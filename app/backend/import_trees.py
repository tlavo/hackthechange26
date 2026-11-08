import json
from urllib.parse import urlencode
from urllib.request import urlopen

from sqlalchemy.dialects.sqlite import insert
from sqlmodel import Session

from database import engine, create_db_and_tables
from models import Tree


# City of Calgary Public Trees GIS service.
API_URL = (
    "https://services1.arcgis.com/AVP60cs0Q9PEA8rH/"
    "ArcGIS/rest/services/Public_Trees/FeatureServer/0/query"
)

# Number of records to request at a time.
# Fetching smaller batches avoids requesting the entire dataset at once.
BATCH_SIZE = 1000


def fetch_tree_batch(offset):
    """
    Retrieve one batch of tree records from the City of Calgary API.
    """

    # Only retrieve actual trees, not shrubs or stumps.
    params = {
        "where": "ASSET_TYPE = 'TREE'",
        "outFields": "OBJECTID,COMMON_NAME,COMM_CD",
        "returnGeometry": "true",

        # Request coordinates using latitude/longitude (WGS84).
        "outSR": 4326,

        # Pagination settings.
        "resultOffset": offset,
        "resultRecordCount": BATCH_SIZE,

        # Request JSON data.
        "f": "json"
    }

    # Convert our parameters into a URL query string.
    query_string = urlencode(params)
    request_url = f"{API_URL}?{query_string}"

    # Send the request and read the response.
    with urlopen(request_url, timeout=60) as response:
        data = json.loads(response.read().decode("utf-8"))

    # Check whether the API returned an error.
    if "error" in data:
        raise RuntimeError(f"City API error: {data['error']}")

    return data.get("features", [])


def save_tree_batch(session, features):
    """
    Convert API records into Tree models and save them to SQLite.
    """

    tree_records = []

    for feature in features:
        # The City API separates regular information (attributes)
        # from geographic information (geometry).
        attributes = feature.get("attributes", {})
        geometry = feature.get("geometry")

        # Skip records that do not have an ID or coordinates.
        if attributes.get("OBJECTID") is None or not geometry:
            continue

        # Convert the City API record into our database format.
        tree_records.append({
            "tree_id": str(attributes["OBJECTID"]),
            "common_name": attributes.get("COMMON_NAME"),
            "community_code": attributes.get("COMM_CD"),
            "latitude": geometry.get("y"),
            "longitude": geometry.get("x")
        })

    if not tree_records:
        return 0

    # Insert new records. If a tree already exists, update its information.
    # This makes the import script safe to run more than once.
    statement = insert(Tree.__table__).values(tree_records)

    statement = statement.on_conflict_do_update(
        index_elements=["tree_id"],
        set_={
            "common_name": statement.excluded.common_name,
            "community_code": statement.excluded.community_code,
            "latitude": statement.excluded.latitude,
            "longitude": statement.excluded.longitude
        }
    )

    session.execute(statement)
    session.commit()

    return len(tree_records)


def import_trees():
    """
    Download all tree records and save them to our database.
    """

    # Make sure the database table exists before importing.
    create_db_and_tables()

    offset = 0
    total_imported = 0

    with Session(engine) as session:

        while True:
            print(f"Fetching records starting at offset {offset}...")

            features = fetch_tree_batch(offset)

            # No more records are available.
            if not features:
                break

            imported = save_tree_batch(session, features)
            total_imported += imported

            print(f"Imported {imported} records.")

            # Move forward to the next batch.
            offset += len(features)

    print(f"\nImport complete! Total records processed: {total_imported}")


if __name__ == "__main__":
    import_trees()