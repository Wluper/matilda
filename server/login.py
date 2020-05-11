from database_config import DatabaseConfiguration

class LoginFuncs(object):
	"""
	Here all the username accepted by the server
	"""
	response = { "status":"fail" }

	def logIn(self, userID, userPass):

		userDetails = self.databaseFuncs.readDatabase("users","userName",userID)

		for line in userDetails:
			if line["userName"] == userID:
				if line["password"] == userPass:
					LoginFuncs.response = { "status":"success" }

		return LoginFuncs.response

	def create(self, userID, password, email=None):

		DatabaseConfiguration.users.save({"_id":userID,"userName":userID,"password":password, "email":email})
		response = { "status": "success" }

		return response