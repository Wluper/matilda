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
from flask import Flask
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

	responseObject = []
	
	def readDatabase(coll,attribute,string=None):

		DatabaseManagement.responseObject = []

		print(" * Searching in:",coll,"for key-value",attribute,string)

		entries = {}
		collection_selected = DatabaseConfiguration.collection

		if coll == "users":
			collection_selected = DatabaseConfiguration.users
		elif coll == "dialogues":
			collection_selected = DatabaseConfiguration.dialogues

		if string is not None:
			query = collection_selected.find({attribute:string})
		else:
			query = collection_selected.find()

		for line in query:
			DatabaseManagement.responseObject.append(line)

		return DatabaseManagement.responseObject

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

		if collection != "users":
			DatabaseConfiguration.collection.delete_one({"_id":id})
		else:
			DatabaseConfiguration.users.delete_one({"_id":id})

		DatabaseManagement.responseObject = { "status":"success" }
		return DatabaseManagement.responseObject

	def updateDatabase(self,username):

		#update the database user's document

		DatabaseManagement.responseObject = []

		try:
			with open(DatabaseManagement.__DEFAULT_PATH+"/"+username+".json") as file:
				annotations = json.load(file)
		except:
			annotations = {}

		DatabaseConfiguration.collection.save({"_id":username,"lastUpdate":datetime.datetime.utcnow(),"annotations":annotations})
		return DatabaseManagement.responseObject

	def getUserEntry(self, id):

		#check the database and format the response

		DatabaseManagement.responseObject = []

		elaborate = DatabaseManagement.readDatabase("database","_id",id)

		for line in elaborate:
			for name in line:
				if name == "annotations":
					#print(line[name])
					DatabaseManagement.responseObject = line[name]

		return DatabaseManagement.responseObject

	"""
	DIALOGUES COLLECTIONS OPERATIONS
	"""

	def createCollection(collection_id, document, description=None, assignedTo=None, annotationStyle=None, completed=None):

		DatabaseConfiguration.dialogues.save(
			{
			"_id":collection_id,
			"description":description if description else "", 
			"assignedTo":assignedTo if assignedTo else "", 
			"annotationStyle":annotationStyle if annotationStyle else Configuration.annotation_style,
			"lastUpdate":datetime.datetime.utcnow(),
			"status":completed if completed else "", 
			"document":document 
			})