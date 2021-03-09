[![Wluper](https://wluper.com/content/themes/main/static/gfx/wluperlogo.png)](https://wluper.com/)     

**What's new in MATILDA:** 
1. Full support for more than one annotator and project management
2. Database MongoDB for data delivery and consistency
3. Production ready server with Gunicorn and nginx
4. New annotation functions

## Document structure

1. <strong>Installation</strong>
   - Option A) Running the Server with Docker
     - Downloading & Installing MATILDA Modules Requirements
     - Run the server with flask or gunicorn
   - Option B) Running the Server with flask (WSGI) or gunicorn
   - Optional: Installing a MongoDB local database
   - Accessing the interface
   - First username and password
2. <strong>Configuration</strong>
   - Network and database
   - Annotation Models
3. <strong>Advanced Configuration</strong>
   - New Labels
   - Interannotator Tool
   - Adding ML Models As Recommenders
   - Dummy Models
4. <strong>JSON Format Example</strong>

## 1. Installation

MATILDA is a client-server app. The server is written in Python with the Flask
web framework. The front end is written with HTML/CSS/Vue.js and communicates
with the back end via a RESTful API. 

To run MATILDA, you will need to first run the Flask server on your 
local machine / wherever you want the back end to run.

To do this you have two options:
1) Using the provided docker-compose.yml file to run it
in a docker container together with its database. This is probably faster and cleaner.
2) Otherwise you will need to have Python 3.6 or above installed on your machine 
and a mongoDB database, either online (there are many free services) or local. 
If you are using an online database you will need to set the database address in
configuration/conf.json.

Further instructions are provided in the next paragraph.

### Option A) Running the Server with Docker

MATILDA also comes with a docker container you may want to use for a fast and clean installation on Linux systems. This type of deployment is not yet full supported on Mac and Windows systems.

<strong> For these steps, please see the specific instructions in `docker_readme.md.` </strong>

### Optional: Installing a MongoDB local database

<strong>If you don't plan to use a local database but you prefer an online one, feel free to skip this step.</strong>

mongoDB requires Homebrew to install on OSX.
Update instructions are on its official website: https://brew.sh/#install

Instructions for a working local mongoDB database are here:
https://docs.mongodb.com/manual/administration/install-community/

<strong>Testing:</strong>

You can test it's running by:

`ps aux | grep -v grep | grep mongod`


### Option B) Running the Server with Flask (WSGI) or Gunicorn

#### 1) Downloading & Installing MATILDA Modules Requirements

It is strongly recommended that you clone into a Python virtual environment:

```bash
$ mkdir MATILDA/
$ python3 -m venv MATILDA/
$ cd MATILDA/ && source bin/activate
(MATILDA)$ git clone https://github.com/davivcu/matilda
(MATILDA)$ cd matilda/web
(MATILDA)$ pip3 install -r requirements.txt
```

#### 2) Run the server with flask or gunicorn

Assuming you have just followed the steps to "Downloading & Installing MATILDA Module Requirements"
and you have a mongoDB locally installed on your system:

```bash
(MATILDA)$ pwd
~/MATILDA/matilda/web
(MATILDA)$ cd server/
(MATILDA)$ python matilda_app.py
```

You should see the Flask server running in the Terminal now on port 5000.

Alternatively you may use gunicorn to run the server app:

```bash
(MATILDA)$ pwd
~/MATILDA/matilda/web
(MATILDA)$ cd server/
gunicorn --bind localhost:5000 matilda_app:MatildaApp
```

### Accessing the interface

Each option you chose before you can now simply navigate to http://localhost:5000 if you installed the server locally 
or navigate to the remote server address.
Keep in mind you may need to open the correct ports on your firewall(s) in order to reach the server.

HTTP Requests from your client may not reach your server in some configuration environment, 
in those few cases please check and edit the backend address in MATILDA's file `/web/server/gui/source/utils/backend.js`.
Other configuration options are exposed in `/Configuration/conf.json`.

### First username and password

On its first start MATILDA creates an administrator account with username "admin" and password "admin".
You need to use this credentials for your first login. Once you are allowed to enter it's recommended 
to change the admin password from the graphical interface.

## 2. Configuration

### Network and Database
All configuration changes that you may wish to make to MATILDA network and database can be done by editing the json file
`/Configuration/conf.json`.
There you can change:
   - App ports (default 5000) and address (127.0.0.1)
   - Database location with address:port combination (127.0.0.1:27017) or mongoDB URI (mongodb://mongo:27017/?retryWrites=true&w=majority)
   - The annotation models you want to be available inside MATILDA. The json files you are referring to must be included in the Configuration folder.

If you are using the Docker version you can also perform additional configuration with `/Configuration/gunicorn_run.sh`.

### Annotation Models

All configuration changes that you may wish to make to MATILDA's annotation model can be done by editing the json file
`/Configuration/lida_model.json` or by adding a new one. This script contains a configuration dictionary that describes 
which labels will appear in MATILDA's front end. 
You can also add an entire new annotation model file and put a reference to it in the `/Configuration/conf.json` file in
order to instruct the program to load it on start.

You can currently add three different types of new labels to MATILDA:

1. `multilabel_classification` :: will display as checkboxes which you can
   select one or more of.

2. `multilabel_classification_string` :: will display as checkboxes with values
   next to them and text input fields for a string. This kind of label would
   be used for a slot-value pair in dialogue state tracking, where you have
   the slot name (a classification) and the value (an arbitrary string).

3. `string` :: will display underneath the user's utterance as a string
   response. This is the label field that would be used for a response to the
   user's query.


## 3. Advanced Configuration

### New Labels

To add a new label, simply specify a new entry in the `configDict` in
`/web/server/annotator_config.py`.  The key should be the name of the label, and the
value a dictionary which has a field specifying the `label_type`, a boolean
field `required` which defines whether the label is required or not and a field
called `labels` which specify what label values there are for this label (not
applicable to labels of type `string`).

You can optionally add a `description` field and a `model` field which provides
a recommender for the label (see below for details on API requirement). You can
see examples of all label types in `/web/server/annotator_config.py`.

### The Annotator Config file
![Annotator Config](images/ann_conf.png)

### Interannotator tool

All configuration changes that you would like to add to the Interannotator tool can be done in `/web/server/annotator_config.py`.

It currently allows you to modify the following:

1. How to treat disagreements etc.
2. How to calculate scores.

### Adding ML Models As Recommenders

All configuration changes that you may wish to make to MATILDA can be done in the
file `/web/server/annotator_config.py`. This script contains a configuration
dictionary that describes which labels will appear in MATILDA's front end.

To add a recommender, simply add a field called `"model"` to the element of the
config dict that you want to add a recommender for. The value of this field
needs to be a Python object that conforms to the interface defined below.

Any recommender you add to MATILDA must conform to the following API: each
recommender is a **Python object** that has a method called `transform`:

`transform(sent: str) -> List[str] or List[Tuple[str, str]] or str`

That is, your recommender only needs to provide a method called `transform` that
takes a single string as input and returns predicted labels. The predictions
need to conform to the `label_type`. What this means is:

* If the element's `label_type` is `multilabel_classification`, then the
  `transform()` method needs to return a list of strings (i.e. a list of
  the labels for the string). For example, for sentiment classification this
  may look like:

  `predictor.transform("I liked the movie") -> ["positive"]`

* If the element's `label_type` is `multilabel_classification_string`, then the
  `transform()` method needs to return a list of tuples, where each tuple
  consists of two strings (i.e. a list of slots and values). For example, for
  hotel belief state tracking this may look like:

  `predictor.transform("I want a hotel for 5 people") -> [("hotel-book people", "5")]`

* If the element's `label_type` is `string`, then the `transform()` method needs
  to also return a string. For example, you could add a dialogue system to MATILDA
  using this label type:

  `dialogue_system.transform("I want a hotel") -> "What area of town?"`

You can see more examples of this in `/web/server/dummy_models.py` and see how they
are integrated to MATILDA's back end in the current `web/server/annotator_config.py`
script.

### Dummy Models
![Dummy Models](images/models.png)

## Uploading JSON File Format

If you upload a JSON file representing a dialogue to be labelled, then it must
have the following properties:

* File is a dict with keys as the names of each dialogue and values as lists.

* Each value is a list of dictionaries, where each dictionary contains a number
  of key-value pairs which are used to display the dialogue data for annotation.

* Some key-value pairs are compulsory in order to correctly display the
  dialogue. The key-value pairs which are compulsory are defined in the 
  annotation model json file in the `/Configuration` folder read by `/web/gui/server/annotator_config.py` module. 

* By default, the only required key-value pair in each turn is called
  `usr` and should be the user's query as a string.

An example of data in the correct form can be seen in `/web/server/LIDA_ANNOTATIONS/dummy_data.json`.

## 4. JSON Format Example
![JSON format](images/ann_conf.png)

## Citation
The official citation from the EMNLP 2019 conference in Hong Kong. Please cite this when using.
```
@inproceedings{collins-etal-2019-lida,
    title = "{LIDA}: Lightweight Interactive Dialogue Annotator",
    author = "Collins, Edward  and
      Rozanov, Nikolai  and
      Zhang, Bingbing",
    booktitle = "Proceedings of the 2019 Conference on Empirical Methods in Natural Language Processing and the 9th International Joint Conference on Natural Language Processing (EMNLP-IJCNLP): System Demonstrations",
    month = nov,
    year = "2019",
    address = "Hong Kong, China",
    publisher = "Association for Computational Linguistics",
    url = "https://www.aclweb.org/anthology/D19-3021",
    doi = "10.18653/v1/D19-3021",
    pages = "121--126",
    abstract = "Dialogue systems have the potential to change how people interact with machines but are highly dependent on the quality of the data used to train them.It is therefore important to develop good dialogue annotation tools which can improve the speed and quality of dialogue data annotation. With this in mind, we introduce LIDA, an annotation tool designed specifically for conversation data. As far as we know, LIDA is the first dialogue annotation system that handles the entire dialogue annotation pipeline from raw text, as may be the output of transcription services, to structured conversation data. Furthermore it supports the integration of arbitrary machine learning mod-els as annotation recommenders and also has a dedicated interface to resolve inter-annotator disagreements such as after crowdsourcing an-notations for a dataset. LIDA is fully open source, documented and publicly available.[https://github.com/Wluper/lida] {--}{\textgreater} Screen Cast: https://vimeo.com/329824847",
}
```
