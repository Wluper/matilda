class LoginFuncs(object):
	"""
	Here all the username accepted by the server
	"""
	response = {}

	def logIn(self, userID):

		userList = self.databaseFuncs.readDatabase("users","userName",userID)

		if userID in userList:
			LoginFuncs.response = { "status":"success" }
		return LoginFuncs.response

	def create(self, userID, password, email):

		self.databaseFuncs.collection.save({"_id":userID,"userName":userID,"password":password, "email":email})
		
		return { status: "success" }