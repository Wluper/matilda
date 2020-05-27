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
import ast

# == Flask ==
from flask import Flask, jsonify
from flask_cors import CORS

# == Pymongo ==
from pymongo import MongoClient
from bson.objectid import ObjectId

# == Local ==
from utils import load_json_file, save_json_file
from database_config import DatabaseConfiguration
from interannotator_config import Configuration

class DatabaseManagement(object):

	"""
	MAIN PART
	"""

	__DEFAULT_PATH = "LIDA_ANNOTATIONS"
	
	def readDatabase(coll,attribute,string=None, field=None):
		# if field parameter is provided the search will be a projection of the id
		# and the requested field only.
		# if string is provided the search will be restricted to the req string

		responseObject = []

		print(" * Searching in:",coll,"for key-value",attribute,string)

		entries = {}
		collection_selected = DatabaseConfiguration.collection

		if coll == "users":
			collection_selected = DatabaseConfiguration.users
		elif coll == "dialogues":
			collection_selected = DatabaseConfiguration.dialogues

		if string is not None:
			query = collection_selected.find({attribute:string})
		elif field is not None:
			query = collection_selected.find({},{field:1})
		else:
			query = collection_selected.find()

		for line in query:
			responseObject.append(line)

		return responseObject

	def downloadDatabase(self):

		entries = []

		collection_dict = DatabaseConfiguration.collection.find()
		for index,entry in enumerate(collection_dict,1):
			entries.append({"File "+str(index):entry})

		return entries

	def getDatabaseIds(self):

		entries = []

		collection_dict = DatabaseConfiguration.collection.find()
		for entry in collection_dict:
			#print("* Database Entry *************** \n",entry)
			entries.append( { "_id":str(entry["_id"]), "lastUpdate":str(entry["lastUpdate"]) })
		print("* Response ***********\n",entries,"\n ********************")

		return entries

	def deleteEntry(self,id,collection):

		#delete a database document by id

		if collection == "dialogues":
			DatabaseConfiguration.dialogues.delete_one({"_id":id})
		elif collection == "users":
			DatabaseConfiguration.users.delete_one({"_id":id})
		else:
			DatabaseConfiguration.collection.delete_one({"_id":id})

		responseObject = { "status":"success" }
		return responseObject

	def updateDatabase(self,username):

		#update the database user's document

		try:
			with open(DatabaseManagement.__DEFAULT_PATH+"/"+username+".json") as file:
				annotations = json.load(file)
		except:
			annotations = {}

		DatabaseConfiguration.collection.save({"_id":username,"lastUpdate":datetime.datetime.utcnow(),"annotations":annotations})
		
		responseObject = {"status":"success"}
		return responseObject

	def getUserEntry(self, id):

		#check the database and format the response

		responseObject = []

		elaborate = DatabaseManagement.readDatabase("database","_id",id)

		for line in elaborate:
			for name in line:
				if name == "annotations":
					#print(line[name])
					responseObject = line[name]

		return responseObject

	"""
	DIALOGUES COLLECTIONS OPERATIONS
	"""

	def createCollection(collection_id, values):

		DatabaseConfiguration.dialogues.save({
			"_id":collection_id,
			"title":values["title"],
			"description":values["description"], 
			"assignedTo":values["assignedTo"], 
			"annotationStyle":values["annotationStyle"],
			"lastUpdate":datetime.datetime.utcnow(),
			"status":values["status"], 
			"document":values["document"]})

		response = {"staus":"success"}
		return response 

	def updateCollection(collection_id, fields):

		for field in fields:
			DatabaseConfiguration.dialogues.update(
				{"_id":collection_id}, 
				{ "$set": { field : json.dumps(fields[field]) } }
			)
