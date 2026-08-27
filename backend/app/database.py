from motor.motor_asyncio import AsyncIOMotorClient
from app.config import settings

class Database:
    client: AsyncIOMotorClient = None
    db = None

db_instance = Database()

async def connect_to_mongo():
    """Establish connection to MongoDB Atlas."""
    db_instance.client = AsyncIOMotorClient(settings.MONGODB_URL)
    # Extract DB name from connection string or default to 'billnova'
    db_name = settings.MONGODB_URL.split("/")[-1].split("?")[0] or "billnova"
    db_instance.db = db_instance.client[db_name]
    print(f" Connected to MongoDB Atlas: [{db_name}]")

async def close_mongo_connection():
    """Close connection to MongoDB Atlas."""
    if db_instance.client:
        db_instance.client.close()
        print(" Closed MongoDB Atlas connection.")

def get_database():
    """Dependency helper to return database instance."""
    return db_instance.db