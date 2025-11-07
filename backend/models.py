# backend/models.py
from sqlalchemy import Column, Integer, String, Date, ForeignKey, Table
from sqlalchemy.orm import relationship
from db import Base

# Junction table for many-to-many
UserItems = Table(
    "user_items",
    Base.metadata,
    Column("user_id", Integer, ForeignKey("users.user_id"), primary_key=True),
    Column("item_id", Integer, ForeignKey("items.item_id"), primary_key=True)
)

class User(Base):
    __tablename__ = "users"
    user_id = Column(Integer, primary_key=True)
    name = Column(String(100), nullable=False)

    items = relationship("Item", secondary="user_items", back_populates="users")


class Category(Base):
    __tablename__ = "categories"
    category_id = Column(Integer, primary_key=True)
    name = Column(String(100), unique=True)

class Location(Base):
    __tablename__ = "locations"
    location_id = Column(Integer, primary_key=True)
    name = Column(String(100), unique=True)

class Item(Base):
    __tablename__ = "items"
    item_id = Column(Integer, primary_key=True)
    name = Column(String(100))
    category_id = Column(Integer, ForeignKey("categories.category_id"))
    location_id = Column(Integer, ForeignKey("locations.location_id"))
    qty = Column(Integer, default=0)
    unit = Column(String(20))
    min_qty = Column(Integer, default=0)
    expiry_date = Column(Date)

    category = relationship("Category")
    location = relationship("Location")
    users = relationship("User", secondary=UserItems, back_populates="items")
