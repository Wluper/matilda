from database_config import DatabaseConfiguration

class LoginFuncs(object):
	"""
	Here all the username accepted by the server
	"""

	def logIn(self, userID, userPass):

		response = { "status":"fail" }

		userDetails = self.databaseFuncs.readDatabase("users","userName",userID)

		for line in userDetails:
			if line["userName"] == userID:
				if line["password"] == userPass:
					response = { "status":"success" }

		return response

	def create(self, userID, password, email=None):

		response = { "status":"fail" }

		DatabaseConfiguration.users.save({"_id":userID,"userName":userID,"password":password, "email":email})
		response = { "status": "success" }

		return response