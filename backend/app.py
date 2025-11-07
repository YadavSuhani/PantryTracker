# backend/app.py
from flask import Flask, jsonify, request
from flask_cors import CORS
from sqlalchemy.orm import Session
from db import engine, Base, SessionLocal
from models import User, Item, Category, Location


app = Flask(__name__)
CORS(app)

# Create tables automatically
Base.metadata.create_all(bind=engine)
@app.before_request
def log_request_info():
    print(f"➡️ {request.method} {request.path}")

@app.route("/")
def index():
    return jsonify({"message": "Pantry API running!"})

# ---------- CRUD for Items ----------
@app.get("/items")
def get_items():
    with Session(engine) as session:
        items = session.query(Item).all()
        return jsonify([
            {
                "item_id": i.item_id,
                "name": i.name,
                "category": i.category.name if i.category else None,
                "location": i.location.name if i.location else None,
                "qty": i.qty,
                "unit": i.unit,
                "min_qty": i.min_qty,
                "expiry_date": str(i.expiry_date) if i.expiry_date else None,
            }
            for i in items
        ])

from datetime import datetime

@app.post("/items")
def create_item():
    data = request.json
    with Session(engine) as session:
        expiry = None
        if data.get("expiry_date"):
            try:
                expiry = datetime.strptime(data["expiry_date"], "%Y-%m-%d").date()
            except ValueError:
                expiry = None  # fallback if format unexpected

        new_item = Item(
            name=data["name"],
            category_id=data.get("category_id"),
            location_id=data.get("location_id"),
            qty=data.get("qty", 0),
            unit=data.get("unit"),
            min_qty=data.get("min_qty", 0),
            expiry_date=expiry
        )
        session.add(new_item)
        session.commit()
        return jsonify({"message": "Item added successfully"}), 201

@app.put("/items/<int:item_id>")
def update_item(item_id):
    data = request.json
    with Session(engine) as session:
        item = session.get(Item, item_id)
        if not item:
            return jsonify({"error": "Item not found"}), 404
        for key, value in data.items():
            setattr(item, key, value)
        session.commit()
        return jsonify({"message": "Item updated"})

@app.delete("/items/<int:item_id>")
def delete_item(item_id):
    with Session(engine) as session:
        item = session.get(Item, item_id)
        if not item:
            return jsonify({"error": "Item not found"}), 404
        session.delete(item)
        session.commit()
        return jsonify({"message": "Item deleted"})


@app.get("/users")
def get_users():
    with Session(engine) as session:
        users = session.query(User).all()
        return jsonify([
            {"user_id": u.user_id, "name": u.name}
            for u in users
        ])


@app.post("/users")
def add_user():
    data = request.json
    name = data.get("name")
    if not name:
        return jsonify({"error": "Name is required"}), 400

    with Session(engine) as session:
        existing = session.query(User).filter_by(name=name).first()
        if existing:
            return jsonify({"error": "User already exists"}), 409

        new_user = User(name=name)
        session.add(new_user)
        session.commit()
        return jsonify({"message": f"User '{name}' added successfully"}), 201


@app.put("/users/<int:user_id>")
def update_user(user_id):
    data = request.json
    with Session(engine) as session:
        user = session.get(User, user_id)
        if not user:
            return jsonify({"error": "User not found"}), 404
        user.name = data.get("name", user.name)
        session.commit()
        return jsonify({"message": "User updated successfully"}), 200


@app.delete("/users/<int:user_id>")
def delete_user(user_id):
    with Session(engine) as session:
        user = session.get(User, user_id)
        if not user:
            return jsonify({"error": "User not found"}), 404
        session.delete(user)
        session.commit()
        return jsonify({"message": "User deleted successfully"}), 200

# ---------- Supporting dropdowns ----------
@app.get("/categories")
def get_categories():
    with Session(engine) as session:
        return jsonify([{"category_id": c.category_id, "name": c.name} for c in session.query(Category).all()])
    
@app.post("/categories")
def add_category():
    data = request.json
    name = data.get("name")
    if not name:
        return jsonify({"error": "Name is required"}), 400

    with Session(engine) as session:
        # check if it already exists
        existing = session.query(Category).filter_by(name=name).first()
        if existing:
            return jsonify({"error": "Category already exists"}), 409

        new_category = Category(name=name)
        session.add(new_category)
        session.commit()
        return jsonify({"message": f"Category '{name}' added successfully"}), 201

@app.put("/categories/<int:category_id>")
def update_category(category_id):
    data = request.json
    with Session(engine) as session:
        category = session.get(Category, category_id)
        if not category:
            return jsonify({"error": "Category not found"}), 404
        category.name = data.get("name", category.name)
        session.commit()
        return jsonify({"message": "Category updated successfully"}), 200


@app.delete("/categories/<int:category_id>")
def delete_category(category_id):
    with Session(engine) as session:
        category = session.get(Category, category_id)
        if not category:
            return jsonify({"error": "Category not found"}), 404
        session.delete(category)
        session.commit()
        return jsonify({"message": "Category deleted successfully"}), 200


@app.get("/locations")
def get_locations():
    with Session(engine) as session:
        return jsonify([{"location_id": l.location_id, "name": l.name} for l in session.query(Location).all()])
    
@app.post("/locations")
def add_location():
    data = request.json
    name = data.get("name")
    if not name:
        return jsonify({"error": "Name is required"}), 400

    with Session(engine) as session:
        existing = session.query(Location).filter_by(name=name).first()
        if existing:
            return jsonify({"error": "Location already exists"}), 409
        new_location = Location(name=name)
        session.add(new_location)
        session.commit()
        return jsonify({"message": f"Location '{name}' added successfully"}), 201


@app.put("/locations/<int:location_id>")
def update_location(location_id):
    data = request.json
    with Session(engine) as session:
        location = session.get(Location, location_id)
        if not location:
            return jsonify({"error": "Location not found"}), 404
        location.name = data.get("name", location.name)
        session.commit()
        return jsonify({"message": "Location updated successfully"}), 200


@app.delete("/locations/<int:location_id>")
def delete_location(location_id):
    with Session(engine) as session:
        location = session.get(Location, location_id)
        if not location:
            return jsonify({"error": "Location not found"}), 404
        session.delete(location)
        session.commit()
        return jsonify({"message": "Location deleted successfully"}), 200

from sqlalchemy import text

@app.get("/report/low-stock")
def report_low_stock():
    category_id = request.args.get("category_id")
    location_id = request.args.get("location_id")

    sql = text("""
        SELECT 
            i.item_id,
            i.name AS item_name,
            c.name AS category,
            l.name AS location,
            i.qty,
            i.min_qty,
            (i.min_qty - i.qty) AS shortage
        FROM items i
        LEFT JOIN categories c ON i.category_id = c.category_id
        LEFT JOIN locations l ON i.location_id = l.location_id
        WHERE i.qty < i.min_qty
          AND (:category_id IS NULL OR i.category_id = :category_id)
          AND (:location_id IS NULL OR i.location_id = :location_id)
        ORDER BY c.name, l.name, i.name;
    """)

    with engine.connect() as conn:
        rows = conn.execute(sql, {
            "category_id": category_id,
            "location_id": location_id
        }).mappings().all()
    return jsonify(rows)


@app.get("/report/expiring")
def report_expiring():
    days = int(request.args.get("days", 7))  # default: next 7 days
    sql = text("""
        SELECT 
            i.item_id,
            i.name AS item_name,
            c.name AS category,
            i.expiry_date
        FROM items i
        LEFT JOIN categories c ON i.category_id = c.category_id
        WHERE i.expiry_date IS NOT NULL
          AND i.expiry_date <= DATE('now', :days_ahead)
        ORDER BY i.expiry_date ASC;
    """)
    with engine.connect() as conn:
        rows = conn.execute(sql, {"days_ahead": f"+{days} days"}).mappings().all()
    return jsonify(rows)

if __name__ == "__main__":
    app.run(debug=True)
