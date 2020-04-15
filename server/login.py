class loginFuncs(object):

	userList = ["Cucurnia","Simi","Ciuffoletti","Sucameli","Carla","Clara"]

	__DEFAULT_PATH = "LIDA_ANNOTATIONS"

	responseString = {}

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
				self.__fileName = loginFuncs.__DEFAULT_FILENAME

	def save(self):
		save_json_file( obj=self.__entries, path=os.path.join( self.__filePath, self.__fileName ) )

	def logIn(self, userID):
		if userID in self.userList:
			self.responseString = { "status" : "success" }
		else: 
			self.responseString = { "status" : "fail" }
		return self.responseString