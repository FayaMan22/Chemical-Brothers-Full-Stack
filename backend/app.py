from flask import Flask, jsonify, request
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

# Temporary sample product data
products = [
    {
        "id": 1,
        "name": "Chemical Brothers Multi-Purpose Cleaner",
        "category": "Cleaner",
        "price": 12.99,
        "stock": 25,
        "description": "Powerful cleaning solution for household and industrial use.",
        "image": "/images/product1.jpg"
    },
    {
        "id": 2,
        "name": "Chemical Brothers Dishwashing Liquid",
        "category": "Dishwashing",
        "price": 7.49,
        "stock": 40,
        "description": "Cuts grease fast and leaves dishes sparkling clean.",
        "image": "/images/product2.jpg"
    },
    {
        "id": 3,
        "name": "Chemical Brothers Laundry Detergent",
        "category": "Laundry",
        "price": 15.99,
        "stock": 18,
        "description": "Deep-cleaning detergent for bright and fresh clothes.",
        "image": "/images/product3.jpg"
    }
]

contact_messages = []
orders = []


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


@app.route("/products/<int:product_id>", methods=["GET"])
def get_product(product_id):
    product = next((p for p in products if p["id"] == product_id), None)

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
        return jsonify({
            "success": True,
            "orders": orders
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

    new_order = {
        "id": len(orders) + 1,
        "customer_name": customer_name,
        "customer_email": customer_email,
        "phone": phone,
        "address": address,
        "items": items,
        "subtotal": subtotal,
        "delivery_fee": delivery_fee,
        "total": total,
        "status": "Pending"
    }

    orders.append(new_order)

    return jsonify({
        "success": True,
        "message": "Order created successfully.",
        "order": new_order
    }), 201

if __name__ == "__main__":
    app.run(debug=True)
