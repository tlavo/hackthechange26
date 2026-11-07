from fastapi import FastAPI, Depends
from sqlmodel import Session, select

from database import engine, get_session, create_db_and_tables
from models import Tree


app = FastAPI()


# Create database tables when the application starts.
@app.on_event("startup")
def on_startup():
    create_db_and_tables()


@app.get("/")
def home():
    return {"message": "Welcome to Tree Wellness!"}


# Retrieve all trees from the database.
@app.get("/trees")
def get_trees(session: Session = Depends(get_session)):
    trees = session.exec(select(Tree)).all()

    return trees