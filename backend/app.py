from datetime import datetime, timezone
from flask import Flask, jsonify, request
from flask_cors import CORS
from flask_sqlalchemy import SQLAlchemy
import json
from functools import wraps

app = Flask(__name__)
CORS(app)
app.config["SQLALCHEMY_DATABASE_URI"] = "postgresql://postgres:Azach26%23@localhost:5432/chemical_brothers"
app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False

db = SQLAlchemy(app)

ADMIN_TOKEN = "admin-token"

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
    subtotal = data.get("subtotal")
    delivery_fee = data.get("delivery_fee")
    total = data.get("total")

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
            product_id=item.get("id"),
            product_name=item.get("name"),
            price=item.get("price"),
            quantity=item.get("quantity")
        )
        db.session.add(order_item)

    db.session.commit()

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

    if not new_status:
        return jsonify({
            "success": False,
            "message": "Status is required."
        }), 400

    order = Order.query.get(order_id)

    if not order:
        return jsonify({
            "success": False,
            "message": "Order not found."
        }), 404

    order.status = new_status
    db.session.commit()

    return jsonify({
        "success": True,
        "message": "Order status updated successfully.",
        "order": {
            "id": order.id,
            "customer_name": order.customer_name,
            "customer_email": order.customer_email,
            "phone": order.phone,
            "address": order.address,
            "items": json.loads(order.items_json),
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

with app.app_context():
    db.create_all()

if __name__ == "__main__":
    app.run(debug=True)
