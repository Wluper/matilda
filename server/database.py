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
from annotator_config import Configuration

class DatabaseManagement(object):

	"""
	MAIN PART
	"""

	__DEFAULT_PATH = "LIDA_ANNOTATIONS"
	
	def readDatabase(coll,attribute,string=None, fields=None):
		# if field parameter is provided the search will be a projection of the id
		# and the requested field only.
		# if string is provided the search will be restricted to the req string

		responseObject = []

		print(" * Searching in:",coll,"for key-value",attribute,string)

		entries = {}

		if coll == "users":
			collection_selected = DatabaseConfiguration.users
		else:
			collection_selected = DatabaseConfiguration.dialogues

		#simple search for one interested field
		if string is not None:
			query = collection_selected.find({attribute:string})
		
		#search with projection of interested fields only
		elif fields is not None:
			projection = {}
			for element in fields:
				projection[element]=1
			query = collection_selected.find({},projection)
		
		#gets all
		else:
			query = collection_selected.find()

		for line in query:
			responseObject.append(line)

		return responseObject

	def deleteEntry(collection, id):

		#delete a database document by id

		if collection == "dialogues":
			DatabaseConfiguration.dialogues.delete_one({"_id":id})
		else: 
			DatabaseConfiguration.users.delete_one({"_id":id})

		responseObject = { "status":"success" }
		return responseObject

	def updateDatabase(username, destination, annotationRate, backup=None):

		#update the database user's document

		try:
			with open(DatabaseManagement.__DEFAULT_PATH+"/"+username+".json") as file:
				annotations = json.load(file)
		except:
			annotations = {}

		#if back up mode then saves with a different id and 
		# checks if document will be empty before saving
		if backup:
			if annotations != {}:
				DatabaseConfiguration.dialogues.save(
				{"_id":username+"_"+destination, "document":annotations, "lastUpdate":datetime.datetime.utcnow(), "status":annotationRate})
			else:
				responseObject = {"status":"empty"}
				return responseObject

		#saving
		DatabaseConfiguration.dialogues.update(
			{"_id":destination},
			{ "$set": { "lastUpdate":datetime.datetime.utcnow(), "status":annotationRate, "document": annotations } }
		)
		
		responseObject = {"status":"success"}
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
				{ "$set": { field : fields[field] } }
			)
