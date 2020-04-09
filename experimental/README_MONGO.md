[![Wluper](https://wluper.com/content/themes/main/static/gfx/wluperlogo.png)](https://wluper.com/)     

# LIDA: Lightweight Interactive Dialogue Annotator

# experimental/mongoDB branch 

## Installation

Following the mongoDB guide page:
https://docs.mongodb.com/manual/tutorial/install-mongodb-on-os-x/


### Downloading & Installing Requirements

mongoDB requires Homebrew to install.
https://brew.sh/#install

In terminal type:

<<<<<<< HEAD
`/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/master/install.sh)"`

`brew tap mongodb/brew`

`brew install mongodb-community@4.2`

`brew services start mongodb-community@4.2`

You can test it by:

`ps aux | grep -v grep | grep mongod`
=======
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/master/install.sh)"

brew tap mongodb/brew

brew install mongodb-community@4.2

brew services start mongodb-community@4.2

You can test it by:

ps aux | grep -v grep | grep mongod
>>>>>>> 1ac1011078e9947cb293a74e04fbf0635eee37d6

### Install pymongo

Now you only need the python mongoDB drivers:

<<<<<<< HEAD
`pip3 install pymongo`
=======
pip3 install pymongo
>>>>>>> 1ac1011078e9947cb293a74e04fbf0635eee37d6

