import pymongo
from pymongo import MongoClient
databaseURL="mongodb://localhost"
db = MongoClient(databaseURL)["lida"]
users = db["users"]
values = {"id":"admin","userName":"admin","password":"admin","email":"","role":"administrator"}
if db.users.find({"id":"admin"}):
    print("Admin account exists already")
db.users.insert_one(values)
print("Success! log with username 'admin' and password 'admin'")
