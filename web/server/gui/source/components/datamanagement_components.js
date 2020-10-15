Vue.component("datamanagement-view", {

    data() {
        return {
            changesSaved: "",
            guiMessages,
            allEntryMetadata: [],
            showCollection: "all",
            showUser:"all",
            showHelpColl: false,
            status:"collections",
            userList:{},
            userName: mainApp.userName,
            allUsers:[],
            selectedCollection:"",
            allEntriesNamedMetadata:{},
            tIndex:"",
        }
    },

    created() {
        databaseEventBus.$on("collections_changed", this.init );
        databaseEventBus.$on("creation_completed", this.reset_view );
        databaseEventBus.$on("entry_selected", this.inspect_entry );
    },

    mounted () {
        this.init();
    },

    computed : {
        role: function() {
            return mainApp.role;
        }
    },

    beforeDestroyed() {
        console.log("==================================");
        console.log("I am being destroyed");
        console.log(this.entryId);
    },
    // METHODS
    methods:{
        init : function(){
            //Get DATABASE COLLECTIONS
            this.getAllEntriesFromServer();
        },

        go_back: function() {
            adminEventBus.$emit("go_back");
        },

        getAllEntriesFromServer() {
            mainContainer.style.cursor = "progress";
            backend.get_collections_async("dialogues_collections")
                .then( (response) => {
                    for (collection in response) {
                      this.allEntriesNamedMetadata[response[collection].id] = response[collection]
                    }
                    this.allEntryMetadata = response;
                    console.log(this.allEntryMetadata);
                    mainContainer.style.cursor = null;
                    backend.get_all_users()
                        .then( (response) => {
                            this.allUsers = response;
                });
            })
        },

        inspect_entry(clickedEntry) {
            event.stopPropagation();
            mainContainer.style.cursor = "progress";
            this.changesSaved = "";
            this.showUser = "all";
            this.showCollection = clickedEntry;
            this.status = "collection";
        },

        clicked_entry(clickedEntry, index) {
            this.status = "collections";
            this.tIndex = index;
            this.selectedCollection = this.allEntriesNamedMetadata[clickedEntry];
            document.getElementById(this.selectedCollection.id).style.opacity = "1";
            console.log("Selected collection",this.selectedCollection);
            this.changesSaved = "";
            //refresh from database
            this.init();
        },

        clicked_active() {
            adminAppEventBus.$emit("go_back");
        },

        clicked_user() {
            if (this.changesSaved != "") {
                let del = confirm(guiMessages.selected.collection.confirmChangesLost);
                if (del == true) { 
                    this.showUser = this.allUsers[0].id;
                }
            } else {
                this.showUser = this.allUsers[0].id;
            } 
        },

        toggle_user_list(clickedEntry) {
            if (this.userList[clickedEntry] != true) {
                this.userList[clickedEntry] = true;
            } else {
                this.userList[clickedEntry] = false;
            }
        },

        delete_entry(clickedEntry) {
            event.stopPropagation();
            if (confirm(guiMessages.selected.admin.deleteConfirm)) {
                console.log('-------- DELETING --------')
                backend.del_db_entry_async(clickedEntry, "dialogues_collections")
                    .then( (response) => {
                        databaseEventBus.$emit('collections_changed');
                    });
            } else {
                return;
            }
        },

        save() {
            fields = {"assignedTo":this.selectedCollection.assignedTo};
            backend.update_collection_async(this.selectedCollection.id,"dialogues_collections",fields)
              .then( (response) => {
                  console.log(response);
                  this.changesSaved = true;
                  this.getAllEntriesFromServer();
            });
        },

        switch_view(clickedUser) {
            if ( this.selectedCollection == "" ) {
                console.log("switching from collection to user view");
                this.showUser = clickedUser;
                this.selectedCollection = "";
                this.allEntriesNamedMetadata = [];
                this.tIndex = "";
                this.status = "users";
            } else if (this.showUser != "all") {
                console.log("switching from user to collection view");
                this.showCollection = "all";
                this.showUser = "all";
                this.status = "collection";
            }
        },

        reset_view() {
            if (this.selectedCollection != "") {
                this.selectedCollection = "";
            } else {
                this.showUser = "all";
            }
            this.changesSaved = "";
            this.showCollection = "all";
            this.status = "collections";
            this.init();
        },
    },
    template:
    `
        <div id="collection-view">
            <div class="database-menu">
                <h2 class="database-title">{{guiMessages.selected.collection.title}}</h2>
                <user-bar v-bind:userName="userName"></user-bar>
                <div class="help-button-container">
                    <button class="help-button btn btn-sm" @click="showHelpColl = true">{{ guiMessages.selected.database.showHelp }}</button>
                    <button v-on:click="go_back()" class="back-button btn btn-sm btn-primary">{{guiMessages.selected.annotation_app.backToAll}}</button>
                </div>
                <help-collection-modal v-if="showHelpColl" @close="showHelpColl = false"></help-collection-modal>
            </div>

            <div class="inner-wrap" v-if="status != 'creation' && status != 'collection'">
                <div>
                    <button type="button" v-on:click="status = 'creation'" 
                            class="help-button btn btn-sm btn-primary">
                            {{guiMessages.selected.collection.create}}
                    </button> 

                    <button v-if="selectedCollection != '' || showUser != 'all'" 
                        type="button" 
                        class="back-button btn btn-sm btn-primary" 
                        v-on:click="reset_view()" style="float:right;">
                        {{guiMessages.selected.admin.button_abort}}
                    </button>
                </div>

                <ul class="collection-list two-columns" v-if="showCollection == 'all' && showUser == 'all' ">
                    <h2>{{guiMessages.selected.lida.buttonCollections}}</h2>
                    <li class="listed-entry" v-for='collection,index in allEntryMetadata' v-bind:id="collection.id" style="opacity:1;">
                        <div class="entry-list-single-item-container" v-on:click="switch_view(collection.id)">
                            <div class="edit-dialogue-button" v-on:click="inspect_entry(collection.id)">
                                {{guiMessages.selected.admin.editButton}}
                            </div>
                            <div class="del-dialogue-button" v-on:click="delete_entry(collection.id)">
                                {{guiMessages.selected.lida.button_delete}}
                            </div>
                            <input type="radio" class="user-checkbox radio-primary" v-bind:id="'coll_'+collection.id" v-bind:value="collection.id" v-model="selectedCollection.id">
                            
                            <div v-if="selectedCollection == ''" class="entry-info" v-on:click="clicked_entry(collection.id, index)" style="opacity:1;">
                                <div class="entry-id">
                                    <span>ID:</span> {{collection.id}}
                                </div>
                                <div class="entry-annotated">
                                    <template v-if="collection.gold">
                                        Gold: <span class="gold-true">True</span>
                                    </template>
                                    <template v-else>
                                        Gold: <span class="gold-false">False</span>
                                    </template>
                                </div>
                                <div class="entry-assigned">
                                    <span v-if="userList[collection.id] != true" v-on:click="toggle_user_list(collection.id)" class="open-close">
                                    Assigned: 
                                        <span class="gold-true">{{collection.assignedTo.join(", ")}}</span> 
                                    </span>

                                    <span v-else v-on:click="toggle_user_list(collection.id)">
                                    Assigned: 
                                        <span class="gold-false">{{collection.assignedTo.length}}</span>
                                    </span>
                                </div>
                                <div class="entry-date">
                                    {{guiMessages.selected.admin.dataItems}} {{collection.documentLength}}
                                </div>
                            </div>
                            <div v-else class="entry-info" v-on:click="clicked_entry(collection.id, index)">
                                <div class="entry-id">
                                    <span>ID:</span> {{collection.id}}
                                </div>
                                <div class="entry-annotated">
                                    <template v-if="collection.gold">
                                        Gold: <span class="gold-true">True</span>
                                    </template>
                                    <template v-else>
                                        Gold: <span class="gold-false">False</span>
                                    </template>
                                </div>
                                <div class="entry-assigned">
                                    <span v-if="userList[collection.id] != true" v-on:click="toggle_user_list(collection.id)" class="open-close">
                                    Assigned: 
                                        <span class="gold-true">{{collection.assignedTo.join(", ")}}</span> 
                                    </span>

                                    <span v-else v-on:click="toggle_user_list(collection.id)">
                                    Assigned: 
                                        <span class="gold-false">{{collection.assignedTo.length}}</span>
                                    </span>
                                </div>
                                <div class="entry-date">
                                    {{guiMessages.selected.admin.dataItems}} {{collection.documentLength}}
                                </div>
                            </div>

                        </div>
                    </li>
                </ul>

                <ul class="collection-user-list two-columns" v-if="showCollection == 'all' && showUser == 'all'">
                    <h2>{{guiMessages.selected.admin.users}}</h2>
                    <li class="listed-entry collection-users" v-for="user in allUsers" v-bind:id="'user_'+user.id">
                        <div class="entry-list-single-item-container" v-on:click="switch_view(user.id)">
                            <input type="checkbox" class="user-checkbox" v-bind:id="'check_'+user.id" :value="user.id" v-model="selectedCollection.assignedTo">
                            <div class="entry-info">
                                <label :for="'check_'+user.id" class="listed-label" v-on:click="changesSaved = 'false'">
                                    <div class="entry-id">
                                        <span>Username:</span> {{user.id}}
                                    </div>
                                    <div class="entry-annotated">
                                        <template v-if="user.role == 'administrator'">
                                        Role: <span class="gold-true">Administrator</span>
                                        </template>
                                        <template v-else>
                                        Role: <span class="gold-false">Annotator</span>
                                        </template>
                                    </div>
                                </label>
                            </div>
                        </div>
                    </li>
                </ul>

                <div class="closing-list" v-if="showUser == 'all'">
                    <span v-if="changesSaved == 'true'" class="is-saved">{{guiMessages.selected.database.saved}}</span>
                    <span v-else-if="changesSaved == 'false'" class="is-not-saved" style="float:right;">{{guiMessages.selected.annotation_app.unsaved}} 
                        <button type="button" class="help-button btn btn-sm btn-primary" v-on:click="save()">
                        {{guiMessages.selected.annotation_app.save}}
                        </button>
                    </span>
                </div>
                    
                <collection-users-reverse
                        v-if="status == 'users'"
                        v-bind:selectedUserFromParent="showUser">
                </collection-users-reverse>
            </div>

            <collection-entry-details 
                        v-if="status == 'collection'"
                        v-bind:allUsers="allUsers"
                        v-bind:selectedCollection="showCollection">
            </collection-entry-details>
            
            <collection-creation
                        v-bind:allUsers="allUsers"
                        v-if="status =='creation'">
            </collection-creation>
        </div>
    `
});

Vue.component('collection-users-reverse', {
   
   props: ["selectedUserFromParent"],

   data () {
         return {
            entry : {},
            guiMessages,
            role: mainApp.role,
            allEntryMetadata: [],
            allUsers:[],
            assignedCollections:[],
            changesSaved:'',
            allEntriesNamedMetadata:{},
            saveTasks:{},
            selectedUser: this.selectedUserFromParent,
         }
   },

   mounted () {
      this.init();
   },

   methods: {

        init: function() {
            //refresh 
            this.changesSaved = "";
            this.saveTasks = {};
            this.allEntriesNamedMetadata = [];
            this.assignedCollections = [];
            //get data from server
            backend.get_collections_async("dialogues_collections")
                  .then( (response) => {
                    console.log("All collections",response);
                    for (collection in response) {
                      this.allEntriesNamedMetadata[response[collection].id] = response[collection]
                    }
                    this.allEntryMetadata = response;
                    console.log(this.allEntryMetadata);
                    mainContainer.style.cursor = null;
                    backend.get_all_users()
                        .then( (response) => {
                            this.allUsers = response;
                            this.get_user_assignments();
                    });
            });
        },

        get_user_assignments: function() {
            search = {"assignedTo":this.selectedUser}
            projection = {"id":1,"gold":1,"assignedTo":1,"lastUpdate":1}
            backend.get_specific_collections("dialogues_collections",search, projection)
                .then( (response) => {
                    console.log(response);
                    for (collection in response) {
                        this.assignedCollections.push(response[collection].id)
                    }
                    console.log("Asssigned to",this.selectedUser,this.assignedCollections)
                }
            )
        },

        clicked_user: function(clickedUser) {
            this.selectedUser = clickedUser;
            this.init();
        },

        inspect_entry: function(clickedEntry) {
            databaseEventBus.$emit("entry_selected",clickedEntry);
        },
        
        add_or_remove: function(clickedCollection) {
            if (this.allEntriesNamedMetadata[clickedCollection]["assignedTo"].includes(this.selectedUser)) {
                let index = this.allEntriesNamedMetadata[clickedCollection]["assignedTo"].indexOf(this.selectedUser);
                this.allEntriesNamedMetadata[clickedCollection]["assignedTo"].splice(index, 1);
            } else {
                this.allEntriesNamedMetadata[clickedCollection]["assignedTo"].push(this.selectedUser);
            }
            this.saveTasks[clickedCollection] = this.allEntriesNamedMetadata[clickedCollection].assignedTo;
            console.log("Output array updated",this.allEntriesNamedMetadata[clickedCollection].assignedTo);
        },

        save: function() {
            console.log("Update plan",this.saveTasks);
            backend.update_multiple_collections_async("dialogues_collections",this.saveTasks) 
                .then( (response) => {
                    console.log("Collections updated",response);
                    this.init();
            })
        }
  },
  template:
    `
            <div id="collection-user-editing">
                <ul class="collection-list two-columns">
                    <h2>{{guiMessages.selected.lida.buttonCollections}}</h2>
                    <li class="listed-entry" v-for='collection in allEntryMetadata' v-bind:id="collection.id">
                        <div class="entry-list-single-item-container">
                            <div class="edit-dialogue-button" v-on:click="inspect_entry(collection.id)">
                                {{guiMessages.selected.admin.editButton}}
                            </div>
                            <div class="del-dialogue-button" v-on:click="delete_entry($event)">
                                {{guiMessages.selected.lida.button_delete}}
                            </div>
                            <input type="checkbox" class="user-checkbox" v-bind:id="'check_'+collection.id" :value="collection.id" v-model="assignedCollections" v-on:click="add_or_remove(collection.id)">
                            <div class="entry-info">
                                <label :for="'check_'+collection.id" class="listed-label" v-on:click="changesSaved = 'false'">
                                    <div class="entry-id">
                                        <span>ID:</span> {{collection.id}}
                                    </div>
                                    <div class="entry-annotated">
                                        <template v-if="collection.gold">
                                            Gold: <span class="gold-true">True</span>
                                        </template>
                                        <template v-else>
                                            Gold: <span class="gold-false">False</span>
                                        </template>
                                    </div>
                                    <div class="entry-assigned">
                                        <span>Assigned: <span class="gold-true">{{collection.assignedTo.join(", ")}}</span> </span>
                                    </div>
                                    <div class="entry-date">
                                        {{guiMessages.selected.admin.dataItems}} {{collection.documentLength}}
                                    </div>
                                </label>
                            </div>
                        </div>
                    </li>
                </ul>

                <ul class="collection-user-list two-columns">
                    <h2>{{guiMessages.selected.admin.users}}</h2>
                    <li class="listed-entry collection-users" v-for="user in allUsers" v-bind:id="'user_'+user.id" v-on:click="clicked_user(user.id)">
                        <div class="entry-list-single-item-container">
                            <input type="radio" class="user-checkbox radio-primary" v-bind:id="'user_'+user.id" v-bind:value="user.id" v-model="selectedUser">
                            <div class="entry-info">
                                <label class="listed-label">
                                    <div class="entry-id">
                                        <span>Username:</span> {{user.id}}
                                    </div>
                                    <div class="entry-annotated">
                                        <template v-if="user.role == 'administrator'">
                                        Role: <span class="gold-true">Administrator</span>
                                        </template>
                                        <template v-else>
                                        Role: <span class="gold-false">Annotator</span>
                                        </template>
                                    </div>
                                </label>
                            </div>
                        </div>
                    </li>
                </ul>
                <span v-if="changesSaved == 'true'" class="is-saved">{{guiMessages.selected.database.saved}}</span>
                <span v-else-if="changesSaved == 'false'" class="is-not-saved" style="float:right;">{{guiMessages.selected.annotation_app.unsaved}} 
                    <button type="button" class="help-button btn btn-sm btn-primary" v-on:click="save()">{{guiMessages.selected.annotation_app.save}}</button>
                </span>
            </div>
  `
});

Vue.component('collection-entry-details', {
   
   props: ["selectedCollection", "allUsers"],

   data () {
         return {
            entry : {},
            guiMessages,
            role: mainApp.role,
            checkedUsers:[],
            changesSaved:"",
            showGold: {boo: false, code:""}
         }
   },

   mounted () {
      this.init();
   },

   methods: {

         init : function(){
            backend.get_db_entry_async(this.selectedCollection,"dialogues_collections")
                  .then( (response) => {
                     console.log("Collection details",response[0]);
                     this.entry = response[0];
                     this.checkedUsers = response[0]["assignedTo"]
                     mainContainer.style.cursor = null;
                     this.showGold.boo = this.check_if_gold(this.entry);
            });
        },

        check_if_gold(response) {
            this.showGold.code = JSON.stringify(response.gold);
            if (this.showGold.code === "{}")
                return false;
            else
                return true;
        },

        show_gold(mode) {
            if (mode == undefined) {
                document.getElementById("gold_expanded").style.display = "block";
                document.getElementById("gold_field").style.display = "none";
            } else {
                document.getElementById("gold_expanded").style.display = "none";
                document.getElementById("gold_field").style.display = "block";
            }
        },

        close_document_view() {
            databaseEventBus.$emit("creation_completed");
        },

        update() {
            console.log(this.checkedUsers);
            params = {
               id: this.entry.id,
               title:this.entry.title, 
               description:this.entry.description,
               annotationStyle:this.entry.annotationStyle,
               assignedTo:this.checkedUsers,
               gold:this.entry.gold,
               errors:this.entry.errors,
            }
            if (params.assignedTo.length == 0) {
                params.assignedTo = ["admin"];
            }
            for (element in params) {
               if (params[element] == undefined)
                  params[element] = ""
            }
            backend.update_collection_async(this.entry.id, "dialogues_collections", params)
               .then( (response) => {
                  console.log();
                  console.log("============== Dialogues-Collection Updated ==============");
                  databaseEventBus.$emit('creation_completed');
            });
        },

        delete_entry(clickedDialogue) {
            let del = confirm(guiMessages.selected.collection.confirmDeleteDialogue);
            if (del == true) { 
                backend.remove_from_collection_async("dialogues_collections", this.entry.id, {"dialogue":clickedDialogue})
                    .then( (response) => {
                        console.log(response);
                        this.init();
                    }
                )
            }
        }
  },
  template:
  ` 
  <div class="inner-wrap">
    <div id="collection-editing">
        <div id="collection-fields" class="collection-list two-columns">
            <h2>{{guiMessages.selected.admin.editButton}}: {{entry.id}}</h2>
            <strong>{{guiMessages.selected.collection.collTitle}}:</strong>
                <input class="collection-input" type="text" v-model="entry.title" :placeholder="guiMessages.selected.collection.empty">
                  <br>
            <strong>{{guiMessages.selected.collection.collDesc}}:</strong>
                <input class="collection-input" type="text" v-model="entry.description" :placeholder="guiMessages.selected.collection.empty">
                  <br>
            <strong>{{guiMessages.selected.collection.collAnnot}}:</strong>
                <input class="collection-input" type="text" v-model="entry.annotationStyle" :placeholder="guiMessages.selected.collection.empty">
                  <br>
            <strong>Gold:</strong>
                <input class="collection-input" type="text" v-model="showGold.boo" :placeholder="guiMessages.selected.collection.empty" v-on:click="show_gold()" id="gold_field">
                <textarea id="gold_expanded" v-on:click="show_gold(false)" style="height:104px; display:none">{{showGold.code}}</textarea>
        </div>

        <ul class="collection-user-list two-columns">
            <h2>{{guiMessages.selected.admin.assignedTo}}</h2>
            <li class="listed-entry collection-users" v-for="user in allUsers" v-bind:id="'user_'+user.id">
                <div class="entry-list-single-item-container">
                    <input type="checkbox" class="user-checkbox" v-bind:id="'check_'+user.id" :value="user.id" v-model="checkedUsers">
                    <div class="entry-info">
                        <label :for="'check_'+user.id" class="listed-label" v-on:click="changesSaved = 'false'">
                            <div class="entry-id">
                                <span>Username:</span> {{user.id}}
                            </div>
                            <div class="entry-annotated">
                                <template v-if="user.role == 'administrator'">
                                    Role: <span class="gold-true">Administrator</span>
                                </template>
                                <template v-else>
                                    Role: <span class="gold-false">Annotator</span>
                                </template>
                            </div>
                        </label>
                    </div>
                </div>
            </li>
        </ul>

        <div class="closing-list">
            <button class="help-button btn btn-sm" @click="close_document_view()">
                {{guiMessages.selected.admin.button_abort}}
            </button>
            <button class="help-button btn btn-sm btn-primary" @click="update()">
                {{guiMessages.selected.annotation_app.save}}
            </button>
        </div>

        <ul class="collection-list closing-list">
            <h2>{{entry.documentLength}} {{guiMessages.selected.admin.dataItems}}</h2>
            <li v-for='(content,name) in entry.document' v-bind:id="name" class="listed-entry">
                <div class="dialogue-entry-list">
                    <div class="del-dialogue-button" v-on:click="delete_entry(name)">
                        {{guiMessages.selected.lida.button_delete}}
                    </div>
                    <div class="dialogue-entry-info" v-on:click="clicked_active()">
                        <div class="entry-id">
                            {{name}}
                        </div>
                        <div class="entry-annotated">
                            <span>{{guiMessages.selected.lida.turns}}</span>: {{content.length}}
                        </div>
                    </div>
                </div>
            </li>
        </ul>
    </div>
    </div>
  `
});

Vue.component('collection-creation', {

    props:["allUsers"],

    data () {
        return {
            entry : {showDocument:""},
            guiMessages,
            role: mainApp.role,
            checkedUsers:[],
        }
    },

    mounted () {
        this.init();
    },

    methods: {

        init : function(){
            //
        },

        close_document_view: function() {
            databaseEventBus.$emit("creation_completed");
        },

        add_from_file(event) {
            let file = event.target.files[0];
            let jsonType = /application.json/;
            if (file.type.match(jsonType)) {
                console.log('---- HANDLING LOADED JSON FILE ----');
                let reader = new FileReader();
                reader.onload = (event) => {
                console.log('THE READER VALUE', reader);
                this.entry.showDocument = reader.result;
                this.entry.document = reader.result;
            }
            reader.readAsText(file);
            } else {
                alert('Only .json files are supported.')
            }
        },

        save() {
            if (this.entry.document == undefined) {
                "No document loaded, please import a json file";
                return;
            }
            params = {
               id: this.entry.id,
               title:this.entry.title, 
               description:this.entry.description,
               annotationStyle:this.entry.annotationStyle,
               assignedTo:this.checkedUsers,
               gold:this.entry.gold,
               errors:this.entry.errors,
            }
            if ((params.id == "") || (params.id == undefined)) {
               params.id = "Collection"+Math.floor(Math.random() * 10001);
            }
            if (params.assignedTo.length == 0) {
                params.assignedTo = ["admin"];
            }
            for (element in params) {
               if (params[element] == undefined)
                  params[element] = ""
            }
            backend.new_collection_async(this.entry.id, params, this.entry.document)
               .then( (response) => {
                  console.log();
                  console.log("============== Dialogues-Collection Created ==============");
                  databaseEventBus.$emit('creation_completed');
            });
        }
    },
  template:
  `
    <div class="inner-wrap">
            <div class="collection-dialogues">
                <h2>{{guiMessages.selected.collection.create}}</h2>
                <strong>ID:</strong>
                  <input class="collection-input" type="text" v-model="entry.id" :placeholder="guiMessages.selected.coll_creation[0]">
                  <br>
                <strong>{{guiMessages.selected.collection.collTitle}}:</strong>
                  <input class="collection-input" type="text" v-model="entry.title" :placeholder="guiMessages.selected.coll_creation[1]">
                  <br>
                <strong>{{guiMessages.selected.collection.collDesc}}:</strong>
                  <input class="collection-input" type="text" v-model="entry.description" :placeholder="guiMessages.selected.coll_creation[2]">
                  <br>
                <strong>{{guiMessages.selected.collection.collAnnot}}:</strong>
                  <input class="collection-input" type="text" v-model="entry.annotationStyle" :placeholder="guiMessages.selected.coll_creation[3]">
                  <br><br>
                {{guiMessages.selected.modal_document[0]}}
                </strong>
                <input type="file"
                       id="fileInput"
                       name="fileInput"
                       accept=".txt, .json"
                       v-on:change="add_from_file($event)">

                <label for="fileInput"
                       id="fileInputLabel_modal"
                       class="help-button btn btn-sm btn-primary">
                       {{ guiMessages.selected.collection.importCollfromFile }}
                </label>
                <textarea v-model="entry.showDocument">
                </textarea>
            </div>

            <ul class="collection-user-list two-columns">
            <h2>{{guiMessages.selected.admin.assignedTo}}</h2>
            <li class="listed-entry collection-users" v-for="user in allUsers" v-bind:id="'user_'+user.id">
                <div class="entry-list-single-item-container">
                    <input type="checkbox" class="user-checkbox" v-bind:id="'check_'+user.id" :value="user.id" v-model="checkedUsers">
                    <div class="entry-info">
                        <label :for="'check_'+user.id" class="listed-label">
                            <div class="entry-id">
                                <span>Username:</span> {{user.id}}
                            </div>
                            <div class="entry-annotated">
                                <template v-if="user.role == 'administrator'">
                                    Role: <span class="gold-true">Administrator</span>
                                </template>
                                <template v-else>
                                    Role: <span class="gold-false">Annotator</span>
                                </template>
                            </div>
                        </label>
                    </div>
                </div>
            </li>
            </ul>

            <div class="closing-list">
                <button class="help-button btn btn-sm" @click="close_document_view()">
                    {{guiMessages.selected.admin.button_abort}}
                </button>
                <button class="help-button btn btn-sm btn-primary" @click="save()">
                    {{guiMessages.selected.annotation_app.save}}
                </button>
            </div>
            <br>
    </div>
  `
});