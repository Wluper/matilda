from database_config import DatabaseConfiguration
from database import DatabaseManagement

class LoginFuncs(object):
	"""
	Here all the username accepted by the server
	"""

	def logIn(userID, userPass):

		response = { "status":"fail" }

		userDetails = DatabaseManagement.readDatabase("users","userName",userID)

		for line in userDetails:
			if line["userName"] == userID:
				if line["password"] == userPass:
					response = { "status":"success" }

		return response

	def create(userID, password, email=None):

		response = { "status":"fail" }

		DatabaseConfiguration.users.save({"_id":userID,"userName":userID,"password":password, "email":email})
		response = { "status": "success" }

		return response