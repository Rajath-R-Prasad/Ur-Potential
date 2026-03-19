from sqlalchemy import create_engine
from sqlalchemy.orm import declarative_base, sessionmaker
from sqlalchemy.pool import StaticPool
import os

# SQLite setup (in-memory or local file, depending on deployment)
# Since Vercel is serverless, SQLite will be reset on every deployment or function invocation
# depending on where it's stored. For a real app, you'd use a remote DB like Vercel Postgres.
# For this demo, we use a local /tmp/ database file in serverless or local file.
SQLITE_URL = "sqlite:////tmp/urpotential.db" if os.environ.get("VERCEL") else "sqlite:///./urpotential.db"

engine = create_engine(
    SQLITE_URL,
    connect_args={"check_same_thread": False},
    poolclass=StaticPool
)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
