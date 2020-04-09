import json
from flask import Flask
from pymongo import MongoClient
from bson.objectid import ObjectId

#********************************
# CONSTANTS
#********************************

databaseLocation = "localhost" 
databasePort = 27017

app = Flask("_database_")
client = MongoClient(databaseLocation,databasePort)
db = client.mymongodb
collection = db.lida_annotations

#********************************
# MAIN
#********************************

#retrieve number of file
#retrieve user id

def insertFile(location,coll):
	with open(location) as file:
		annotations = json.load(file)
	coll.insert_one(annotations)
	verifyInsertion(annotations)

def printCollection(coll):
	for number,entry in enumerate(coll.find(),1):
		print("\n",number,"\n",entry)

def verifyInsertion(file):
	print("Matching with file content",collection.count_documents(file))
	print("Success")

insertFile("server/LIDA_ANNOTATIONS/Joe.json",collection)
printCollection(collection)
client.close()