
from datetime import datetime, timezone
from flask import Flask, jsonify, request
from flask_cors import CORS
from flask_sqlalchemy import SQLAlchemy
import json
from functools import wraps
from flask_mail import Mail, Message
from dotenv import load_dotenv
import os
from io import BytesIO
from reportlab.lib.pagesizes import A4
from reportlab.pdfgen import canvas


load_dotenv()

app = Flask(__name__)
CORS(app, resources={
    r"/*": {
        "origins" : [
            "https://chemical-brothers-full-stack-7uoe.vercel.app",
            "http://localhost:5173"
        ]
    }
})

app.config["SQLALCHEMY_DATABASE_URI"] = os.getenv("DATABASE_URL")
app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False

app.config["MAIL_SERVER"] = os.getenv("MAIL_SERVER", "smtp.gmail.com")
app.config["MAIL_PORT"] = int(os.getenv("MAIL_PORT", 587))
app.config["MAIL_USE_TLS"] = os.getenv("MAIL_USE_TLS", "True") == "True"
app.config["MAIL_USE_SSL"] = os.getenv("MAIL_USE_SSL", "False") == "True"
app.config["MAIL_USERNAME"] = os.getenv("MAIL_USERNAME")
app.config["MAIL_PASSWORD"] = os.getenv("MAIL_PASSWORD")
app.config["MAIL_DEFAULT_SENDER"] = os.getenv("MAIL_USERNAME")

CURRENCY_SYMBOL = os.getenv("CURRENCY_SYMBOL", "$")

db = SQLAlchemy(app)
mail = Mail(app)

ADMIN_TOKEN = os.getenv("ADMIN_TOKEN", "admin-token")

def admin_required(f):
    @wraps(f)
    def decorated_function(*args, **kwargs):
        auth_header = request.headers.get("Authorization")

        if not auth_header or auth_header != f"Bearer {ADMIN_TOKEN}":
            return jsonify({
                "success": False,
                "message": "Unauthorized access"
            }), 401

        return f(*args, **kwargs)

    return decorated_function

class Order(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    customer_name = db.Column(db.String(100), nullable=False)
    customer_email = db.Column(db.String(120), nullable=False)
    phone = db.Column(db.String(50))
    address = db.Column(db.Text)
    subtotal = db.Column(db.Float)
    delivery_fee = db.Column(db.Float)
    total = db.Column(db.Float)
    status = db.Column(db.String(50), default="Pending")
    created_at = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc))

class OrderItem(db.Model):
    id = db.Column(db.Integer, primary_key=True)

    order_id = db.Column(db.Integer, db.ForeignKey("order.id"), nullable=False)

    product_id = db.Column(db.String(100), nullable=False)
    product_name = db.Column(db.String(100), nullable=False)
    price = db.Column(db.Float, nullable=False)
    quantity = db.Column(db.Integer, nullable=False)

    order = db.relationship("Order", backref=db.backref("order_items", lazy=True))


def format_datetime(dt):
    if dt is None:
        return None

    return dt.replace(tzinfo=timezone.utc).isoformat()

# date
with open("chemical_brothers_products.json", "r", encoding="utf-8") as file:
    data = json.load(file)

products = data["products"]

contact_messages = []

def generate_invoice_pdf(order, order_items):
    buffer = BytesIO()

    pdf = canvas.Canvas(buffer, pagesize=A4)
    width, height = A4

    y = height - 50

    pdf.setFont("Helvetica-Bold", 18)
    pdf.drawString(50, y, "Chemical Brothers Invoice")

    y -= 40
    pdf.setFont("Helvetica", 11)
    pdf.drawString(50, y, f"Invoice / Order ID: #{order.id}")

    y -= 20
    pdf.drawString(50, y, f"Customer: {order.customer_name}")

    y -= 20
    pdf.drawString(50, y, f"Email: {order.customer_email}")

    y -= 20
    pdf.drawString(50, y, f"Phone: {order.phone}")

    y -= 20
    pdf.drawString(50, y, f"Address: {order.address}")

    y -= 40
    pdf.setFont("Helvetica-Bold", 11)
    pdf.drawString(50, y, "Product")
    pdf.drawString(250, y, "Qty")
    pdf.drawString(320, y, "Price")
    pdf.drawString(420, y, "Subtotal")

    y -= 20
    pdf.setFont("Helvetica", 10)

    for item in order_items:
        item_subtotal = item.price * item.quantity

        pdf.drawString(50, y, str(item.product_name))
        pdf.drawString(250, y, str(item.quantity))
        pdf.drawString(320, y, f"{CURRENCY_SYMBOL}{item.price:.2f}")
        pdf.drawString(420, y, f"{CURRENCY_SYMBOL}{item_subtotal:.2f}")

        y -= 20

    y -= 20
    pdf.setFont("Helvetica-Bold", 12)
    pdf.drawString(50, y, f"Subtotal: {CURRENCY_SYMBOL}{order.subtotal:.2f}")

    y -= 20
    pdf.drawString(50, y, f"Delivery Fee: {CURRENCY_SYMBOL}{(order.delivery_fee or 0):.2f}")

    y -= 20
    pdf.drawString(50, y, f"Total: {CURRENCY_SYMBOL}{order.total:.2f}")

    y -= 30
    pdf.drawString(50, y, f"Status: {order.status}")

    pdf.save()

    buffer.seek(0)
    return buffer

@app.route("/")
def home():
    return jsonify({
        "success": True,
        "message": "Chemical Brothers backend is running."
    })


@app.route("/products", methods=["GET"])
def get_products():
    return jsonify({
        "success": True,
        "products": products
    })


@app.route("/products/<product_id>", methods=["GET"])
def get_product(product_id):
    product = next((p for p in products if str(p["id"]) == str(product_id)), None)

    if not product:
        return jsonify({
            "success": False,
            "message": "Product not found."
        }), 404

    return jsonify({
        "success": True,
        "product": product
    })


@app.route("/contact", methods=["POST"])
def contact():
    data = request.get_json()

    name = data.get("name")
    email = data.get("email")
    message = data.get("message")

    if not name or not email or not message:
        return jsonify({
            "success": False,
            "message": "Name, email, and message are required."
        }), 400

    new_message = {
        "id": len(contact_messages) + 1,
        "name": name,
        "email": email,
        "message": message
    }

    contact_messages.append(new_message)

    return jsonify({
        "success": True,
        "message": "Your message has been received successfully.",
        "data": new_message
    }), 201

@app.route("/orders", methods=["GET", "POST"])
def handle_orders():
    if request.method == "GET":
        auth_header = request.headers.get("Authorization")

        if not auth_header or auth_header != f"Bearer {ADMIN_TOKEN}":
            return jsonify({
                "success": False,
                "message": "Unauthorized access"
            }), 401
        
        orders = Order.query.order_by(Order.created_at.desc()).all()

        orders_data = []
        for order in orders:
            orders_data.append({
                "id": order.id,
                "customer_name": order.customer_name,
                "customer_email": order.customer_email,
                "phone": order.phone,
                "address": order.address,
                "items": [
                    {
                        "id": item.product_id,
                        "name": item.product_name,
                        "price": item.price,
                        "quantity": item.quantity
                    }
                    for item in order.order_items
                ],
                "subtotal": order.subtotal,
                "delivery_fee": order.delivery_fee,
                "total": order.total,
                "status": order.status,
                "created_at": format_datetime(order.created_at)
            })

        return jsonify({
            "success": True,
            "orders": orders_data
        })

    data = request.get_json()

    customer_name = data.get("customer_name")
    customer_email = data.get("customer_email")
    phone = data.get("phone")
    address = data.get("address")
    items = data.get("items")
    subtotal = data.get("subtotal") or 0
    delivery_fee = data.get("delivery_fee") or 0
    total = data.get("total") or 0

    if not customer_name or not customer_email or not items:
        return jsonify({
            "success": False,
            "message": "Customer name, customer email, and items are required."
        }), 400

##order saving
    new_order = Order(
        customer_name=customer_name,
        customer_email=customer_email,
        phone=phone,
        address=address,
        subtotal=subtotal,
        delivery_fee=delivery_fee,
        total=total,
        status="Pending"
    )

    db.session.add(new_order)
    db.session.commit()

    for item in items:
        order_item = OrderItem(
            order_id=new_order.id,
            product_id=str(item.get("id")),
            product_name=item.get("name"),
            price=item.get("price"),
            quantity=item.get("quantity")
        )
        db.session.add(order_item)

    db.session.commit()

    order_items_html = ""

    for item in items:
        name = item.get("name")
        price = item.get("price")
        quantity = item.get("quantity")

        subtotal_item = price * quantity

        order_items_html += f"""
        <tr>
            <td>{name}</td>
            <td>{quantity}</td>
            <td>{CURRENCY_SYMBOL}{price:.2f}</td>
            <td>{CURRENCY_SYMBOL}{subtotal_item:.2f}</td>
        </tr>
        """

    invoice_pdf = generate_invoice_pdf(new_order, new_order.order_items)

    formatted_time = new_order.created_at.strftime("%d %b %Y, %H:%M")
    whatsapp_number = "+263772912789"  # company WhatsApp number
    tracking_link = f"http://localhost:5173/track-order/{new_order.id}"


    customer_msg = Message(
        subject=f"Order # {new_order.id} Confirmation - {formatted_time}" ,
        recipients=[customer_email],
        html=f"""
        <h2>Thank you for your order, {customer_name}!</h2>

        <p><strong>Order ID:</strong> # {new_order.id}</p>
        <p><strong>Date:</strong> {formatted_time}</p>

        <p>
            <a href="{tracking_link}"
            style="background:#111;color:white;padding:10px 15px;
                    text-decoration:none;border-radius:5px;">
            Track Your Order
            </a>
        </p>

        <p>
            Need help? WhatsApp us:
            <a href="https://wa.me/{whatsapp_number}">
                Chat with Chemical Brothers
            </a>
        </p>

        <p>Your order has been received successfully.</p>

        <h3>Order Details</h3>

        <table border="1" cellpadding="8" cellspacing="0">
            <thead>
                <tr>
                    <th>Product</th>
                    <th>Qty</th>
                    <th>Price</th>
                    <th>Subtotal</th>
                </tr>
            </thead>
            <tbody>
                {order_items_html}
            </tbody>
        </table>

        <h3>Total: {CURRENCY_SYMBOL}{total}</h3>

        <p><strong>Delivery Address:</strong> {address}</p>
        <p><strong>Order Status:</strong> {new_order.status}</p>

        <p>We will contact you soon regarding delivery.</p>

        <br>
        <p>Regards,<br>Chemical Brothers Team</p>
        """
    )
    customer_msg.attach(
        filename=f"invoice_order_{new_order.id}.pdf",
        content_type="application/pdf",
        data=invoice_pdf.read()
    )

    admin_msg = Message(
        subject="New Order Received",
        recipients=[os.getenv("MAIL_USERNAME")],
        html=f"""
        <h2>New Order Received</h2>

        <p><strong>Order ID:</strong> #{new_order.id}</p>
        <p><strong>Date:</strong> {formatted_time}</p>

        <p><strong>Customer:</strong> {customer_name}</p>
        <p><strong>Email:</strong> {customer_email}</p>
        <p><strong>Phone:</strong> {phone}</p>
        <p><strong>Address:</strong> {address}</p>

        <h3>Order Items</h3>

        <table border="1" cellpadding="8" cellspacing="0">
            <thead>
                <tr>
                    <th>Product</th>
                    <th>Qty</th>
                    <th>Price</th>
                    <th>Subtotal</th>
                </tr>
            </thead>
            <tbody>
                {order_items_html}
            </tbody>
        </table>

        <h3>Total: {CURRENCY_SYMBOL}{total}</h3>
        """
    )

    try:
        mail.send(customer_msg)
    except Exception as e:
        print("Customer email failed:", e)

    try:
        mail.send(admin_msg)
    except Exception as e:
        print("Admin email failed:", e)


    return jsonify({
        "success": True,
        "message": "Order created successfully.",
        "order": {
            "id": new_order.id,
            "customer_name": new_order.customer_name,
            "customer_email": new_order.customer_email,
            "phone": new_order.phone,
            "address": new_order.address,
            "subtotal": new_order.subtotal,
            "delivery_fee": new_order.delivery_fee,
            "total": new_order.total,
            "status": new_order.status
        }
    }), 201

@app.route("/orders/<int:order_id>/status", methods=["PATCH"])
@admin_required
def update_order_status(order_id):
    data = request.get_json()
    new_status = data.get("status")

    ALLOWED_STATUSES = ["Pending", "Processing", "Out for Delivery", "Delivered"]

    if not new_status:
        return jsonify({
            "success": False,
            "message": "Status is required."
        }), 400
    
    if new_status not in ALLOWED_STATUSES:
        return jsonify({
            "success": False,
            "message": "Invalid status"
        }), 400

    order = Order.query.get(order_id)

    if not order:
        return jsonify({
            "success": False,
            "message": "Order not found."
        }), 404

    order.status = new_status
    db.session.commit()

    whatsapp_number = "+263772912789"  # company WhatsApp number
    tracking_link = f"http://localhost:5173/track-order/{order.id}"

    # ✅ Add this block HERE
    if new_status == "Processing":
        message = "We have started preparing your order."
    elif new_status == "Out for Delivery":
        message = "Your order is on the way 🚚"
    elif new_status == "Delivered":
        message = "Your order has been delivered successfully."
    else:
        message = "Your order status has been updated."

    try:
        status_msg = Message(
            subject=f"Update: Order #{order.id} is now {new_status}",
            recipients=[order.customer_email],
            html=f"""
            <h2>Order Update</h2>

            <p>Hello {order.customer_name},</p>

            <p>Your order <strong>#{order.id}</strong> is now:</p>

            <h3>{new_status}</h3>

            <p>{message}</p>

            <p>
                <a href="{tracking_link}"
                style="background:#111;color:white;padding:10px 15px;
                        text-decoration:none;border-radius:5px;">
                Track Your Order
                </a>
            </p>

            <p>
                Need help? WhatsApp us:
                <a href="https://wa.me/{whatsapp_number}">
                    Chat with Chemical Brothers
                </a>
            </p>

            <br>
            <p>Regards,<br>Chemical Brothers Team</p>
            """
        )

        mail.send(status_msg)

    except Exception as e:
        print("Status email failed:", e)

    return jsonify({
        "success": True,
        "message": "Order status updated successfully.",
        "order": {
            "id": order.id,
            "customer_name": order.customer_name,
            "customer_email": order.customer_email,
            "phone": order.phone,
            "address": order.address,
           "items": [
                {
                    "id": item.product_id,
                    "name": item.product_name,
                    "price": item.price,
                    "quantity": item.quantity
                }
                for item in order.order_items
            ],
            "subtotal": order.subtotal,
            "delivery_fee": order.delivery_fee,
            "total": order.total,
            "status": order.status
        }
    })

@app.route("/admin/login", methods=["POST"])
def admin_login():
    data = request.get_json()

    username = data.get("username")
    password = data.get("password")

    if username == "admin" and password == "admin123":
        return jsonify({
            "success": True,
            "message": "Login successful",
            "token": "admin-token"
        }), 200

    return jsonify({
        "success": False,
        "message": "Invalid username or password"
    }), 401

@app.route("/orders/<int:order_id>/tracking", methods=["GET"])
def track_order(order_id):
    order = Order.query.get(order_id)

    if not order:
        return jsonify({
            "success": False,
            "message": "Order not found."
        }), 404

    return jsonify({
        "success": True,
        "order": {
            "id": order.id,
            "customer_name": order.customer_name,
            "status": order.status,
            "created_at": format_datetime(order.created_at),
            "total": order.total
        }
    })

with app.app_context():
    db.create_all()

if __name__ == "__main__":
    port = int(os.environ.get("PORT", 5000))
    app.run(host="0.0.0.0", port=port)
