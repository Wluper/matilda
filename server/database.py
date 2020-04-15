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

#********************************
# CONSTANTS
#********************************

databaseLocation = "localhost" 
databasePort = 27017

client = MongoClient(databaseLocation,databasePort)
db = client.mymongodb
collection = db.lida_database

#********************************
# MAIN
#********************************

class DatabaseManagement(object):
	"""
	container for database functions
	"""
	__DEFAULT_PATH = "LIDA_ANNOTATIONS"

	responseObject = []

	def __init__(self, filePath, fileName=None, entries=None):
		#self.filePath = filePath
		self.set_entries(entries)
		self.set_file( filePath, fileName )
		self.addedEntries = 0

	def get_file_name(self):
		return { "name":self.__fileName}

	def set_entries( self, entries=None ):
		self.__entries = entries if entries else {}

	def set_file( self, filePath, fileName=None):

		self.__filePath = filePath

		if fileName:
			self.__fileName = fileName
			try:
				self.__entries = load_json_file( os.path.join( self.__filePath, self.__fileName ) )
			except FileNotFoundError:
				save_json_file( obj=self.__entries, path=os.path.join( self.__filePath, self.__fileName ) )
			else:
				self.__fileName = DatabaseManagement.__DEFAULT_FILENAME

	def save(self):
		save_json_file( obj=self.__entries, path=os.path.join( self.__filePath, self.__fileName ) )

	def downloadDatabase(self):
		entries = []
		collection_dict = collection.find()
		for index,entry in enumerate(collection_dict,1):
			entries.append({"File "+str(index):entry})
		print("Download \n",entries)
		return entries

	def getDatabaseIds(self):
		entries = []
		collection_dict = collection.find()
		for entry in collection_dict:
			print("Database Entry *************** \n",entry)
			entries.append( { "_id":str(entry["_id"]), "lastUpdate":str(entry["lastUpdate"]) })
		print("Response ***********\n",entries)
		return entries

	def deleteEntry(self,id):
		print("Delete request for",id)
		collection.delete_one({"_id":id})
		return self.responseObject

	def updateDatabase(self,username):
		with open(self.__DEFAULT_PATH+"/"+username["name"]) as file:
			annotations = json.load(file)
		collection.save({"_id":username["name"],"lastUpdate":datetime.datetime.utcnow(),"annotations":str(annotations)})
		return self.responseObject
