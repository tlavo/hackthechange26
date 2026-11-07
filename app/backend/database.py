from pathlib import Path

from sqlmodel import SQLModel, create_engine, Session


# Get the directory where this file is located.
# This ensures that app.db is created inside the backend folder.
BASE_DIR = Path(__file__).resolve().parent
DATABASE_URL = f"sqlite:///{BASE_DIR / 'app.db'}"


# SQLite needs this setting when used with FastAPI,
# because requests can be handled by different threads.
engine = create_engine(
    DATABASE_URL,
    connect_args={"check_same_thread": False}
)


# Create a database session for each request.
# A session is how we interact with the database.
def get_session():
    with Session(engine) as session:
        yield session


# Create all database tables defined in our models.
def create_db_and_tables():
    SQLModel.metadata.create_all(engine)