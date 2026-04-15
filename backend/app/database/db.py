from pymongo import MongoClient

client = MongoClient("mongodb://localhost:27017/neuralQuest")
db = client["neuralquest"]

users_collection = db["users"]