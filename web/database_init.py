import pymongo
from pymongo import MongoClient
databaseURL="mongodb://localhost"
db = MongoClient(databaseURL)["lida"]
users = db["users"]
values = {"id":"admin","userName":"admin","password":"admin","email":"","role":"administrator"}
if db.users.count_documents({"id":"admin"}) > 0:
    print("Admin account exists already")
else:
	db.users.insert_one(values)
	print("Success! Log-in with username 'admin' and password 'admin'")
