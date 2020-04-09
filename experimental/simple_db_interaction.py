import json
from flask import Flask
from pymongo import MongoClient
from bson.objectid import ObjectId

app = Flask(__name__)
client = MongoClient("localhost",27017)
db = client.mymongodb
collection = db.test_collection

with open("../server/LIDA_ANNOTATIONS/Joe.json") as file:
	annotations = json.load(file)

print("Elementi nella collezione",collection.find())

print("Found by matching",collection.count_documents(annotations))

client.close()