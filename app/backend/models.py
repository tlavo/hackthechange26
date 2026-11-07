from sqlmodel import SQLModel, Field


class Tree(SQLModel, table=True):
    # Unique identifier for each tree.
    tree_id: str = Field(primary_key=True)

    # Basic tree information.
    common_name: str | None = None
    community_code: str | None = None

    # Geographic coordinates.
    latitude: float | None = None
    longitude: float | None = None