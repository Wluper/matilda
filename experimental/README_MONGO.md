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

`/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/master/install.sh)"`

`brew tap mongodb/brew`

`brew install mongodb-community@4.2`

`brew services start mongodb-community@4.2`

You can test it by:

`ps aux | grep -v grep | grep mongod`

### Install pymongo

Now you only need the python mongoDB drivers:

`pip3 install pymongo`

