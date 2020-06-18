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

	def create(params):

		response = { "status":"fail" }

		DatabaseConfiguration.users.save({"_id":params["user"],"userName":params["user"],"password":params["pass"], "role":params["role"], "email":params["email"]})
		response = { "status": "success" }

		return response