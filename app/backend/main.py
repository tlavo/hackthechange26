import random
from fastapi import FastAPI, Depends, Query
from sqlmodel import Session, select
from sqlalchemy import func

from database import get_session, create_db_and_tables
from models import Tree




app = FastAPI()


# Create database tables when the application starts.
@app.on_event("startup")
def on_startup():
    create_db_and_tables()


@app.get("/")
def home():
    return {"message": "Welcome to Tree Wellness!"}


# Retrieve trees, optionally filtered by community and common name.
@app.get("/trees")
def get_trees(
    community_code: str | None = None,
    common_name: str | None = None,
    limit: int = Query(default=100, ge=1, le=1000),
    offset: int = Query(default=0, ge=0),
    session: Session = Depends(get_session)
):
    # Start with a query that selects all trees.
    statement = select(Tree)

    # Filter by community if one was provided.
    if community_code:
        statement = statement.where(
            Tree.community_code == community_code.strip().upper()
        )

    # Filter by common name if one was provided.
    if common_name:
        statement = statement.where(
            func.upper(Tree.common_name) == common_name.strip().upper()
        )

    # Apply pagination.
    statement = statement.offset(offset).limit(limit)

    # Execute the query and retrieve the matching trees.
    trees = session.exec(statement).all()

    return trees

# Retrieve all unique Calgary community codes.
@app.get("/communities")
def get_communities(
    session: Session = Depends(get_session)
):
    # Select community codes from the Tree table.
    statement = (
        select(Tree.community_code)
        .where(Tree.community_code.is_not(None))
        .where(Tree.community_code != "")
        .distinct()
        .order_by(Tree.community_code)
    )

    # Execute the query and retrieve the results.
    communities = session.exec(statement).all()

    return communities

# Retrieve the number of trees belonging to each common name
# within a particular community.
def get_common_name_counts(session: Session, community_code: str):

    statement = (
        select(
            Tree.common_name,
            func.count(Tree.tree_id)
        )
        .where(Tree.community_code == community_code)
        .where(Tree.common_name.is_not(None))
        .where(Tree.common_name != "")
        .group_by(Tree.common_name)
        .order_by(Tree.common_name)
    )

    results = session.exec(statement).all()

    return results

# Retrieve all unique tree types in a community.
@app.get("/communities/{community_code}/tree-types")
def get_tree_types(
    community_code: str,
    session: Session = Depends(get_session)
):

    # Retrieve the count of each common name.
    results = get_common_name_counts(session, community_code.upper())

    # Calculate the total number of trees in this community.
    total_trees = sum(count for _, count in results)

    if total_trees == 0:
        return {
            "community_code": community_code.upper(),
            "total_trees": 0,
            "tree_types": []
        }

    # Format the results and calculate each tree type's percentage.
    tree_types = []

    for common_name, count in results:

        percentage = (count / total_trees) * 100

        tree_types.append({
            "common_name": common_name,
            "tree_count": count,
            "percentage": round(percentage, 2)
        })

    return {
        "community_code": community_code.upper(),
        "total_trees": total_trees,
        "tree_types": tree_types
    }

# Generate a random tree-finding challenge for a community.
@app.get("/communities/{community_code}/challenge")
def get_tree_challenge(
    community_code: str,
    session: Session = Depends(get_session)
):

    # Retrieve the count of each common name.
    results = get_common_name_counts(session, community_code.upper())

    if not results:
        return {
            "message": "No trees found in this community."
        }

    # Calculate the total number of trees.
    total_trees = sum(count for _, count in results)

    # Randomly select one of the available tree types.
    common_name, tree_count = random.choice(results)

    # Calculate how common this tree type is in the community.
    percentage = (tree_count / total_trees) * 100

    return {
        "community_code": community_code.upper(),
        "common_name": common_name,
        "tree_count": tree_count,
        "total_trees": total_trees,
        "percentage": round(percentage, 2)
    }