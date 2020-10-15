import pymongo
from pymongo import MongoClient
databaseURL="mongodb://localhost"
db = MongoClient(databaseURL)["lida"]
users = db["users"]
values = {"id":"admin","userName":"admin","password":"admin","email":"","role":"administrator"}
if db.users.find({"id":"admin"}):
    db.users.delete_many({"id":"admin"})
    db,users_delete_many({"userName":"admin"})
    print("Correct values restored")
db.users.save(values)
print("Success! log with username 'admin' and password 'admin'")
