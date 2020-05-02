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

		DatabaseManagement.responseObject = []

		print(" * Searching in:",coll,"for key-value",attribute,string)

		entries = {}
		collection_selected = DatabaseManagement.collection

		if coll == "users":
			collection_selected = DatabaseManagement.users

		if string is not None:
			query = collection_selected.find({attribute:string})
		else:
			query = collection_selected.find()

		for line in query:
			DatabaseManagement.responseObject.append(line)

		return DatabaseManagement.responseObject

	def downloadDatabase(self):

		entries = []

		collection_dict = DatabaseManagement.collection.find()
		for index,entry in enumerate(collection_dict,1):
			entries.append({"File "+str(index):entry})

		return entries

	def getDatabaseIds(self):

		entries = []

		collection_dict = DatabaseManagement.collection.find()
		print(collection_dict)
		for entry in collection_dict:
			print("* Database Entry *************** \n",entry)
			entries.append( { "_id":str(entry["_id"]), "lastUpdate":str(entry["lastUpdate"]) })
		print("* Response ***********\n",entries,"\n ********************")

		return entries

	def deleteEntry(self,id,collection):

		#delete a database document by id

		if collection != "users":
			DatabaseManagement.collection.delete_one({"_id":id})
		else:
			DatabaseManagement.users.delete_one({"_id":id})

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

		DatabaseManagement.collection.save({"_id":username,"lastUpdate":datetime.datetime.utcnow(),"annotations":annotations})
		return DatabaseManagement.responseObject

	def getUserEntry(self, id):

		#check the database and format the response

		DatabaseManagement.responseObject = []

		elaboration = DatabaseManagement.readDatabase("database","_id",id)

		for line in elaboration:
			for name in line:
				if name == "annotations":
					#print(line[name])
					DatabaseManagement.responseObject = line[name]

		return DatabaseManagement.responseObject