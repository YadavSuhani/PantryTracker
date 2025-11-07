# backend/db.py
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base

DB_URI = "sqlite:///pantry.db"  # for local dev (you can swap to MySQL later)

engine = create_engine(DB_URI, echo=True)
SessionLocal = sessionmaker(bind=engine)
Base = declarative_base()
