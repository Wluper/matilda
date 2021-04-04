Vue.component("configuration-view", {

    props: [
      "userName"
    ],

    data() {
        return {
            changesSaved: "",
            guiMessages,
            showHelpConfig:false,
            settings: {
                "app":{},
                "database": {
                    "legacy_configuration":{}
                }
            },
            outModels:[],
            selectedModel:false,
            outModel:{},
            dTurns:[],
            dCurrentTurn:[]
        }
    },

    created() {
        this.init();
    },

    mounted () {
    },

    computed : {
        role: function() {
            return mainApp.role;
        }
    },

    beforeDestroyed() {
        console.log("==================================");
        console.log("I am being destroyed");
    },
    // METHODS
    methods:{
        init : function(){
            //get configuration info from server
            backend.manage_configuration_file("get") 
                .then( (response) => {
                    if (response.status == "done") {
                        this.settings = response;
                        this.outModels = this.settings.app.annotation_models;
                    } else {
                        alert(response.error);
                    }
                }
            );
        },

        go_back: function() {
            if (this.selectedModel == false) {
                adminEventBus.$emit("go_back");
            } else {
                this.selectedModel = false;
            }
        },

        inspect_model: function(id) {
            backend.manage_configuration_file("get",id) 
                .then( (response) => {
                    if (response.data.status == "done") {
                        this.selectedModel = id;
                        this.outModel = response.data["annotationStyle"];
                        this.stringOutModel = JSON.stringify(response.data["annotationStyle"], null, 5);
                        this.changesSaved = "";
                    } else {
                        alert(response.data.error);
                    }
                }
            );
        },

        create_new_model() {
            this.changesSaved = "";
            this.selectedModel = "create_new";
        },

        save_option(option) {
            backend.manage_configuration_file("post", option, this.outModels)
                .then( (response) => {
                    if (response.data.status == "done") {
                        this.changesSaved = "";
                        this.init();
                    } else {
                        alert(response.error);
                    }
                }
            );            
        },

        delete_model(model) {
            let ask = confirm(guiMessages.selected.admin.deleteConfirm);
            if (ask != true) {
                return;
            }
            let index = this.outModels.indexOf(model);
            if (index != -1) {
                this.outModels.splice(index, 1);
                this.changesSaved = 'false';
            }
        },

        save_model() {
            backend.manage_configuration_file("put", this.selectedModel, this.stringOutModel)
                .then( (response) => {
                    if (response.data.status == "done") {
                        this.changesSaved = 'true';
                        this.init();
                    } else {
                        alert(response.error);
                    }
                }
            );
        },
    },
    template:
    `
        <div id="collection-view">
            <div class="database-menu">
                <h2 class="database-title">{{guiMessages.selected.collection.title}}</h2>
                <user-bar v-bind:userName="userName"></user-bar>
                <div class="help-button-container">

                    <button v-if="selectedModel==false" type="button" v-on:click="create_new_model()" class="btn btn-sm btn-primary" style="margin-right:3px;">
                            {{guiMessages.selected.admin.createAnno}}
                    </button>

                    <button class="help-button btn btn-sm" @click="showHelpConfig = true">{{ guiMessages.selected.database.showHelp }}</button>
                    <button v-on:click="go_back()" class="back-button btn btn-sm">{{guiMessages.selected.annotation_app.backToAll}}</button>
                </div>
                <help-config-modal v-if="showHelpConfig" @close="showHelpCongif = false"></help-config-modal>
            </div>

            <div v-if="selectedModel == false" class="inner-wrap">
                <ul class="collection-list two-columns annotation-models-list">
                    <h2 class="list-title">Annotation</h2>
                    <h3>Listed annotation models</h3>
                    
                    <div class="entry-list-single-item-container" v-for="model in settings['app']['annotation_models']">
                            <div class="entry-info" style="display:block;">
                                <label :for="model" class="listed-label"><span>{{guiMessages.selected.admin.fileName}}:</span>{{model}}</label>
                            </div>
                            <div class="entry-buttons">
                              <div class="edit-dialogue-button" v-on:click="inspect_model(model)">
                                    {{guiMessages.selected.admin.editButton}}
                                </div>
                             <div class="del-dialogue-button" v-on:click="delete_model(model)">
                                    {{guiMessages.selected.lida.button_delete}}
                                </div>
                            </div>
                    </div>
                    <div style="margin-top: 3%; clear: both; margin-left: 17%;">
                        <span v-if="changesSaved == 'true'" class="is-saved">{{guiMessages.selected.database.saved}}</span>
                        <span v-else-if="changesSaved == 'false'" class="is-not-saved">
                            <button type="button" class="help-button btn btn-sm btn-primary" v-on:click="save_option('annotation_models')">
                                {{guiMessages.selected.annotation_app.save}}
                            </button>
                            {{guiMessages.selected.annotation_app.unsaved}}
                        </span>
                    </div>   
                </ul>
                <ul class="collection-list two-columns annotation-models-list">
                    <h2 class="list-title" style="margin-bottom:6.5%;">Database</h2>

                    <template v-if="settings.database.optional_uri == null">
                        <h4>{{guiMessages.selected.database.location}}: <span>{{settings.database.legacy_configuration.address}}</span></h4>
                        <h4>{{guiMessages.selected.database.port}}: <span>{{settings.database.legacy_configuration.port}}</span></h4>
                        <h4>Username: <span>{{settings.database.legacy_configuration.username}}</span></h4>
                        <h4>Password: <span>{{settings.database.legacy_configuration.password}}</span></h4>
                    </template>
                    <template v-else>
                        <h4>Database URI: <span>{{settings.database.optional_uri}}</span></h4>
                    </template>
                        <h4>Name: <span>{{settings.database.name}}</span></h4>
                        <template v-if="settings.databaseList">
                            <h4>Size: <span>{{settings.databaseList[settings.database.name].sizeOnDisk}} Byte</span></h4>
                            <h4>Others on the same location:</h4>
                            <select>
                                <option>{{settings.database.name}}</option>
                                <template v-for="db in settings.databaseList">
                                    <option v-if="db.name != settings.database.name">{{db.name}}</option>
                                </template>
                            </select>
                        </template>
                    </template>
                </ul>
            </div>

            <div v-else-if="selectedModel == 'create_new'" class="inner-wrap">
                <create-annotation-model></create-annotation-model>
            </div>

            <div v-else class="inner-wrap">
                <h2>Modifica: {{selectedModel}}</h2>
                <ul class="collection-list two-columns annotation-models-list" style="padding-right:2%;">
                    <h3>Structure</h3>
                    <structure-viewer v-bind:outModel="outModel"></structure-viewer>
                </ul>
                <ul class="collection-list two-columns annotation-models-list">
                    <h3>Editing</h3>
                    <textarea v-model:value="stringOutModel" class="annotation-style-text" v-on:input="changesSaved = 'false'"/>
                </ul>
                <div style="margin-top: 3%; clear: both; margin-left: 17%;">
                    <span v-if="changesSaved == 'true'" class="is-saved">{{guiMessages.selected.database.saved}}</span>
                    <span v-else-if="changesSaved == 'false'" class="is-not-saved">
                        <button type="button" class="help-button btn btn-sm btn-primary" v-on:click="save_model()">
                            {{guiMessages.selected.annotation_app.save}}
                        </button>
                        {{guiMessages.selected.annotation_app.unsaved}}
                    </span>
                </div>
            </div>
        </div>
    `
});

Vue.component("structure-viewer", {

    props: [
      "outModel"
    ],

    beforeDestroyed() {
        console.log("==================================");
        console.log("I am being destroyed");
    },

    template:
    `
        <div class="annotation-style-structure">

            <template v-for="labelValue,labelName in outModel">
                <h4>{{labelName}}</h4>
                <template v-for="subLabelValue, subLabelName in outModel[labelName]">
                    <h5 v-if="subLabelName == 'required'">• {{subLabelName}}: <span style="color:red; letter-spacing:1px;">{{subLabelValue}}</span> </h5>
                    <h5 v-else-if="subLabelValue == 'multilabel_classification'">• {{subLabelName}}: <span style="color:blue;">{{subLabelValue}}</span> </h5>
                    <h5 v-else-if="subLabelValue == 'multilabel_classification_string'">• {{subLabelName}}: <span style="color:green;">{{subLabelValue}}</span> </h5>
                    <h5 v-else-if="subLabelValue == 'multilabel_global_string'">• {{subLabelName}}: <span style="color:orange;">{{subLabelValue}}</span> </h5>                    
                    <h5 v-else>• {{subLabelName}}: <span>{{subLabelValue}}</span></h5>
                </template>
            </template>

        </div>
    `
});

Vue.component("create-annotation-model", {

    props: [
      "selectedModel"
    ],

    data() {
        return {
            guiMessages,
            newModelName:"",
            stringOut:"",
            newString:{"required":true},
            newMultiString:{"required":false},
            newMultiClass:{"required":false},
            newGlobal:{"required":false},
            baseModel: {
                "category_name": {
                    "description": "generic_description",
                    "label_type": "category_type_name",
                    "labels": [
                        "list",
                        "of",
                        "labels"
                    ],
                    "required": false
                }
            },
            stringModel: {
                "category_name": {
                    "description": "utterance",
                    "label_type": "category_type_name",
                    "required": true
                }
            }
        }
    },

    beforeDestroyed() {
        console.log("==================================");
        console.log("I am being destroyed");
    },

    methods: {

        fillModel(type,data) {
            let category = {}
            category[data.name] = {
                "description": data.description,
                "label_type": type,
                "labels": data.labels,
                "required": data.required
            }
            return category
        },

        addType(type,filler) {
            checkName();
            checkFormat();
            let modelToFill = this.fillModel(type,filler)
            if (this.stringOut.length > 0) {
                this.stringOut += ",";
            }
            this.stringOut += JSON.stringify(modelToFill, null, 4);
        },

        checkName() {
            //check if you forgot fields
        },
        checkFormat() {
            //put labels in array
        },
        saveModel() {
            checkFormat();
            return;
            backend.manage_configuration_file("put", this.newModelName, this.jsonFile)
                .then( (response) => {
                    if (response.data.status == "done") {
                        this.changesSaved = 'true';
                        alert("Upload OK");
                        this.selectedModel = false;
                    } else {
                        alert(response.error);
                    }
                }
            );
        },
    },

    template:
    `
        <div>
            <h2>Create New Annotation Model</h2>
            <ul class="collection-list two-columns annotation-models-list">
                
                <textarea v-model:value="stringOut" class="annotation-style-text"/>

                <button type="button" class="help-button btn btn-sm btn-primary" v-on:click="saveModel()" style="margin-top:0px;">
                    {{guiMessages.selected.annotation_app.save}}
                </button>

            </ul>
            <ul class="collection-list two-columns annotation-models-list" style="padding-left:2%;">

                Input Name: <input type="text" v-model="newModelName" style="margin-bottom:1%;" placeholder="write_a_file_name"/>.json <br>

                <form id="string" class="annotation-style-form"> 
                    <h4>String</h4>
                    <div class="form-anno"> Name: <input type="text" v-model="newString.name" placeholder="Name of your choice"/> </div>
                    <div class="form-anno"> Description: <input type="text" v-model="newString.description" placeholder="Description of use"/> </div>
                    <div class="form-anno"> Required: <input type="checkbox" v-model="newString.required"/> </div>
                    <button type="button" class="help-button btn btn-sm" v-on:click="addType('string',newString)">Add String</button>
                </form> <br>

                <form id="multilabel_classification" class="annotation-style-form"> 
                    <h4>Multilabel Classification</h4>
                    <div class="form-anno"> Name: <input type="text" v-model="newMultiClass.name" placeholder="Name of your choice"/> </div>
                    <div class="form-anno"> Description: <input type="text" v-model="newMultiClass.description" placeholder="Description of use"/> </div>
                    <div class="form-anno"> Labels: <input type="text" v-model="newMultiClass.labels" placeholder="Labels separated by a coma"/> </div>
                    <div class="form-anno"> Required: <input type="checkbox" v-model="newMultiClass.required"/> </div>
                    <button type="button" class="help-button btn btn-sm" v-on:click="addType('multilabel_classification',newMultiClass)">Add Multilabel Classification</button>
                </form> <br>

                <form id="multilabel_classification_string" class="annotation-style-form">
                    <h4>Multilabel Classification String</h4>
                    <div class="form-anno"> Name: <input type="text" v-model="newMultiString.name" placeholder="Name of your choice"/> </div>
                    <div class="form-anno"> Description: <input type="text" v-model="newMultiString.description" placeholder="Description of use"/> </div>
                    <div class="form-anno"> Labels: <input type="text" v-model="newMultiString.labels" placeholder="Labels separated by a coma"/> </div>
                    <div class="form-anno"> Required: <input type="checkbox" v-model="newMultiString.required"/> </div>
                    <button type="button" class="help-button btn btn-sm" v-on:click="addType('multilabel_classification_string',newMultiString)">Add Multilabel Classification String</button>
                </form> <br>

                <form id="multilabel_global_string" class="annotation-style-form"> 
                    <h4>Multilabel Global String</h4>
                    <div class="form-anno"> Name: <input type="text" v-model="newGlobal.name" placeholder="Name of your choice"/> </div>
                    <div class="form-anno"> Description: <input type="text" v-model="newGlobal.description" placeholder="Description of use"/> </div>
                    <div class="form-anno"> Labels: <input type="text" v-model="newGlobal.labels" placeholder="Labels separated by a coma"/> </div>
                    <div class="form-anno">Required: <input type="checkbox" v-model="newGlobal.required"/> </div>
                    <button type="button" class="help-button btn btn-sm" v-on:click="addType('multilabel_global_string',newGlobal)">Add Multilabel Global String</button>
                </form> <br>

            </ul>
        </div>

    `
});
