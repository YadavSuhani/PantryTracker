# backend/app.py
from flask import Flask, jsonify, request
from flask_cors import CORS
from sqlalchemy.orm import Session
from sqlalchemy import text
from datetime import datetime

from db import engine, Base, SessionLocal
from models import User, Item, Category, Location

app = Flask(__name__)
CORS(app)

# ----------------------------------------------------------
# INIT DATABASE
# ----------------------------------------------------------
Base.metadata.create_all(bind=engine)

@app.before_request
def log_request_info():
    print(f"➡️ {request.method} {request.path}")


@app.get("/")
def index():
    return jsonify({"message": "Pantry API running!"})


# ----------------------------------------------------------
# ITEMS CRUD
# ----------------------------------------------------------
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


@app.post("/items")
def create_item():
    data = request.json

    # Parse expiry date safely
    expiry = None
    if data.get("expiry_date"):
        try:
            expiry = datetime.strptime(data["expiry_date"], "%Y-%m-%d").date()
        except:
            expiry = None

    with Session(engine) as session:
        new_item = Item(
            name=data.get("name"),
            category_id=data.get("category_id"),
            location_id=data.get("location_id"),
            qty=int(data.get("qty", 0)),
            unit=data.get("unit"),
            min_qty=int(data.get("min_qty", 0)),
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

        # Handle expiry date
        if "expiry_date" in data:
            if data["expiry_date"]:
                try:
                    data["expiry_date"] = datetime.strptime(data["expiry_date"], "%Y-%m-%d").date()
                except:
                    data["expiry_date"] = None
            else:
                data["expiry_date"] = None

        # Convert numeric fields
        if "qty" in data:
            try:
                data["qty"] = int(data["qty"])
            except:
                data["qty"] = 0

        if "min_qty" in data:
            try:
                data["min_qty"] = int(data["min_qty"])
            except:
                data["min_qty"] = 0

        # Apply updates
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


# ----------------------------------------------------------
# USERS CRUD
# ----------------------------------------------------------
@app.get("/users")
def get_users():
    with Session(engine) as session:
        users = session.query(User).all()
        return jsonify([{"user_id": u.user_id, "name": u.name} for u in users])


@app.post("/users")
def add_user():
    name = request.json.get("name")

    if not name:
        return jsonify({"error": "Name is required"}), 400

    with Session(engine) as session:
        if session.query(User).filter_by(name=name).first():
            return jsonify({"error": "User already exists"}), 409

        session.add(User(name=name))
        session.commit()

    return jsonify({"message": f"User '{name}' added"}), 201


@app.put("/users/<int:user_id>")
def update_user(user_id):
    new_name = request.json.get("name")

    with Session(engine) as session:
        user = session.get(User, user_id)
        if not user:
            return jsonify({"error": "User not found"}), 404

        user.name = new_name
        session.commit()

    return jsonify({"message": "User updated"})


@app.delete("/users/<int:user_id>")
def delete_user(user_id):
    with Session(engine) as session:
        user = session.get(User, user_id)
        if not user:
            return jsonify({"error": "User not found"}), 404

        session.delete(user)
        session.commit()

    return jsonify({"message": "User deleted"})


# ----------------------------------------------------------
# CATEGORY CRUD
# ----------------------------------------------------------
@app.get("/categories")
def get_categories():
    with Session(engine) as session:
        return jsonify([
            {"category_id": c.category_id, "name": c.name}
            for c in session.query(Category).all()
        ])


@app.post("/categories")
def add_category():
    name = request.json.get("name")

    if not name:
        return jsonify({"error": "Name is required"}), 400

    with Session(engine) as session:
        if session.query(Category).filter_by(name=name).first():
            return jsonify({"error": "Category already exists"}), 409

        session.add(Category(name=name))
        session.commit()

    return jsonify({"message": f"Category '{name}' added"}), 201


# ----------------------------------------------------------
# LOCATION CRUD
# ----------------------------------------------------------
@app.get("/locations")
def get_locations():
    with Session(engine) as session:
        return jsonify([
            {"location_id": l.location_id, "name": l.name}
            for l in session.query(Location).all()
        ])


@app.post("/locations")
def add_location():
    name = request.json.get("name")

    if not name:
        return jsonify({"error": "Name is required"}), 400

    with Session(engine) as session:
        if session.query(Location).filter_by(name=name).first():
            return jsonify({"error": "Location already exists"}), 409

        session.add(Location(name=name))
        session.commit()

    return jsonify({"message": f"Location '{name}' added"}), 201


# ----------------------------------------------------------
# REPORT ROUTES
# ----------------------------------------------------------

# ---- LOW STOCK ----
@app.get("/report/low-stock")
def report_low_stock():
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
        ORDER BY c.name, l.name, i.name;
    """)

    with engine.connect() as conn:
        rows = conn.execute(sql).mappings().all()

    return jsonify([dict(r) for r in rows])


# ---- EXPIRING ----
@app.get("/report/expiring")
def report_expiring():
    days = int(request.args.get("days", 7))

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

    return jsonify([dict(r) for r in rows])


# ---- BY CATEGORY ----
@app.get("/report/by-category")
def report_by_category():
    sql = text("""
        SELECT 
            c.name AS category,
            COUNT(i.item_id) AS total_items
        FROM categories c
        LEFT JOIN items i ON i.category_id = c.category_id
        GROUP BY c.category_id
        ORDER BY total_items DESC, c.name;
    """)

    with engine.connect() as conn:
        rows = conn.execute(sql).mappings().all()

    return jsonify([dict(r) for r in rows])



# ---- BY LOCATION ----
@app.get("/report/by-location")
def report_by_location():
    sql = text("""
        SELECT 
            l.name AS location,
            COUNT(i.item_id) AS total_items
        FROM locations l
        LEFT JOIN items i ON i.location_id = l.location_id
        GROUP BY l.location_id
        ORDER BY total_items DESC, l.name;
    """)

    with engine.connect() as conn:
        rows = conn.execute(sql).mappings().all()

    return jsonify([dict(r) for r in rows])



# ---- SUMMARY ----
@app.get("/report/summary")
def report_summary():
    with Session(engine) as session:
        return jsonify({
            "total_items": session.query(Item).count(),
            "low_stock": session.query(Item).filter(Item.qty < Item.min_qty).count(),
            "expiring": session.query(Item).filter(Item.expiry_date != None).count()
        })

@app.post("/users/<int:user_id>/consume/<int:item_id>")
def consume_item(user_id, item_id):
    with Session(engine) as session:
        user = session.get(User, user_id)
        item = session.get(Item, item_id)

        if not user or not item:
            return jsonify({"error": "User or item not found"}), 404

        if item.qty <= 0:
            return jsonify({"error": "Item out of stock"}), 400

        # ---- CONCURRENCY-SAFE UPDATE ----
        item.qty -= 1

        # record who consumed it (many-to-many)
        user.items.append(item)

        session.commit()

        return jsonify({
            "message": f"{user.name} consumed 1 {item.name}",
            "remaining_qty": item.qty
        })



# ----------------------------------------------------------
# RUN
# ----------------------------------------------------------
if __name__ == "__main__":
    app.run(debug=True)
