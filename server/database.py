##############################################
#  IMPORT STATEMENTS
##############################################

# == Native ==
import os
import sys
import json
import copy
import json
import datetime
from typing import Dict, List, Any, Tuple, Hashable, Iterable, Union
import functools

# == Flask ==
from flask import Flask
from flask_cors import CORS

# == Pymongo ==
from pymongo import MongoClient
from bson.objectid import ObjectId

# == Local ==
from utils import load_json_file, save_json_file

class DatabaseManagement(object):

	"""
	CONSTANTS
	"""
	databaseLocation = "localhost" 
	databasePort = 27017

	client = MongoClient(databaseLocation,databasePort)
	db = client.mymongodb
	collection = db.lida_database
	users = db.lida_users

	"""
	MAIN PART
	"""

	__DEFAULT_PATH = "LIDA_ANNOTATIONS"

	responseObject = []
	
	def readDatabase(coll,attribute,string=None):

		entries = []
		collection_selected = DatabaseManagement.collection

		if coll == "users":
			collection_selected = DatabaseManagement.users

		if string is not None:
			query = collection_selected.find({attribute:string})
		else:
			query = collection_selected.find()

		for name in query:
			entries.append(name)

		return entries


	def checkDatabase(coll,attribute,string=None):

		entries = {}
		collection_selected = DatabaseManagement.collection

		if coll == "users":
			collection_selected = DatabaseManagement.users

		if string is not None:
			query = collection_selected.find({attribute:string})
		else:
			query = collection_selected.find()

		return query

	def downloadDatabase(self):

		entries = []

		collection_dict = DatabaseManagement.collection.find()
		for index,entry in enumerate(collection_dict,1):
			entries.append({"File "+str(index):entry})
		print("Download \n",entries)

		return entries

	def getDatabaseIds(self):

		entries = []

		collection_dict = DatabaseManagement.collection.find()
		print(collection_dict)
		for entry in collection_dict:
			print("Database Entry *************** \n",entry)
			entries.append( { "_id":str(entry["_id"]), "lastUpdate":str(entry["lastUpdate"]) })
		print("Response ***********\n",entries)

		return entries

	def deleteEntry(self,id,collection):

		if collection != "users":
			DatabaseManagement.collection.delete_one({"_id":id})
		else:
			DatabaseManagement.users.delete_one({"_id":id})

		DatabaseManagement.responseObject = { "status":"success" }
		return DatabaseManagement.responseObject

	def updateDatabase(self,username):

		with open(DatabaseManagement.__DEFAULT_PATH+"/"+username["name"]) as file:
			annotations = json.load(file)

		DatabaseManagement.collection.save({"_id":username["name"],"lastUpdate":datetime.datetime.utcnow(),"annotations":str(annotations)})
		return DatabaseManagement.responseObject

