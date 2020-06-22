from database_config import DatabaseConfiguration
from database import DatabaseManagement

class LoginFuncs(object):
	"""
	Here all the username accepted by the server
	"""

	def logIn(userID, userPass, role):

		response = { "status":"fail" }

		userDetails = DatabaseManagement.readDatabase("users")

		for line in userDetails:
			if line["role"] == role:
				if line["userName"] == userID:
					if line["password"] == userPass:
						response = { "status":"success" }

		return response

	def create(params):

		response = { "status":"fail" }

		if len(DatabaseManagement.readDatabase("users",{"userName":params["userName"]})) == 0:
			DatabaseManagement.createDoc(params["userName"], "users", params)			
		else:
			DatabaseManagement.updateDoc(params["userName"], "users", params)

		response = { "status": "success" }

		return response