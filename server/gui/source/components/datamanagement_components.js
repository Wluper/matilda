Vue.component("datamanagement-view", {

    data() {
        return {
            changesSaved: "",
            guiMessages,
            allEntryMetadata: [],
            showCollection: "all",
            showUser:"all",
            showHelpColl: false,
            userList:{},
            userName: mainApp.userName,
            allUsers:[],
            selectedCollection:"",
            allEntriesNamedMetadata: [],
            tIndex:"",
        }
    },

    created() {
        databaseEventBus.$on( "collections_changed", this.init )
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
            backend.get_collections_ids_async("dialogues_collections")
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
            mainContainer.style.cursor = "progress";
            this.showCollection = clickedEntry;
        },

        clicked_entry(clickedEntry, index) {
            if (this.selectedCollection.id != undefined) {
              document.getElementById(this.selectedCollection.id).style.opacity = null;
            }
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

        update_assigned_number() {
            this.allEntryMetadata[this.tIndex]["assignedTo"] = this.selectedCollection.assignedTo;
            console.log(this.allEntryMetadata[this.tIndex]["assignedTo"]);
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

        delete_entry(event) {
            if (confirm(guiMessages.selected.admin.deleteConfirm)) {
                console.log('-------- DELETING --------')
                idToDelete = event.target.parentNode.parentNode.id;
                backend.del_db_entry_async(idToDelete, "dialogues_collections")
                    .then( (response) => {
                        databaseEventBus.$emit('collections_changed');
                    });
            } else {
                return
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
            } else if (this.showUser != "all") {
                console.log("switching from user to collection view");
                this.showCollection = "all";
                this.showUser = "all";
            }
        },

        reset_view() {
            if (this.selectedCollection != "") {
                if (this.selectedCollection.id != undefined) {
                    document.getElementById(this.selectedCollection.id).style.opacity = null;
                }
                this.selectedCollection = "";
            } else {
                this.showUser = "all";
            }
            this.changesSaved = "";
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
            <div class="inner-wrap">
                <div>
                    <button type="button" v-on:click="showCreateModal = true" 
                            class="help-button btn btn-sm btn-primary">
                            {{guiMessages.selected.collection.create}}
                    </button> 
                    <button type="button" v-on:click="inspect_entry()" 
                            class="help-button btn btn-sm btn-primary">
                            {{guiMessages.selected.collection.editColl}}
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
                    <li class="listed-entry" v-for='collection,index in allEntryMetadata' v-bind:id="collection.id">
                        <div class="entry-list-single-item-container" v-on:click="switch_view(collection.id)">
                            <div class="del-dialogue-button" v-on:click="delete_entry($event)">
                                {{guiMessages.selected.lida.button_delete}}
                            </div>
                            <input type="radio" class="user-checkbox radio-primary" v-bind:id="'coll_'+collection.id" v-bind:value="collection.id" v-model="selectedCollection.id">
                            <div class="entry-info" v-on:click="clicked_entry(collection.id, index)">
                                <div class="entry-id">
                                    <span>Collection:</span> {{collection.id}}
                                </div>
                            <div class="entry-annotated">
                                <template v-if="collection.gold">
                                Gold: <span class="gold-true">True</span>
                                </template>
                                <template v-else>
                                Gold: <span class="gold-false">False</span>
                                </template>
                            </div>
                            <div class="entry-assigned open-close">
                                    <span v-if="userList[collection.id] != true" v-on:click="toggle_user_list(collection.id)">
                                    Assigned to: 
                                        <span class="gold-false">{{collection.assignedTo.length}}</span> 
                                    </span>

                                    <span v-else v-on:click="toggle_user_list(collection.id)">
                                    Assigned To: 
                                        <span class="gold-true">{{collection.assignedTo}}</span>
                                    </span>
                                </div>
                            <div class="entry-date">
                                {{collection.lastUpdate.slice(0,-3)}}
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
                    
                <collection-entry-details 
                        v-if="showCollection != 'all' && showUser == 'all'"
                        v-bind:selectedCollection="showCollection">
                </collection-entry-details>

                <collection-user-details
                        v-if="showUser != 'all' && showCollection == 'all'"
                        v-bind:selectedUserFromParent="showUser">
                </collection-user-details>

            </div>
        </div>
    `
});

Vue.component('collection-user-details', {
   
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
            allEntriesNamedMetadata:[],
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
            backend.get_collections_ids_async("dialogues_collections")
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

        add_or_remove: function(clickedCollection) {
            if (this.allEntriesNamedMetadata[clickedCollection]["assignedTo"].includes(this.selectedUser)) {
                let index = this.allEntriesNamedMetadata[clickedCollection]["assignedTo"].indexOf(this.selectedUser);
                this.allEntriesNamedMetadata[clickedCollection]["assignedTo"].splice(index, 1);
            } else {
                this.allEntriesNamedMetadata[clickedCollection]["assignedTo"].push(this.selectedUser);
            }
            this.saveTasks[clickedCollection] = this.allEntriesNamedMetadata[clickedCollection].assignedTo;
            console.log("Output array updated",this.allEntriesNamedMetadata[clickedCollection].assignedTo);
            console.log("Update plan",this.saveTasks);
        },

        save: function() {
            backend.update_multiple_collections_async("dialogues_collections",this.saveTasks) 
                .then( (response) => {
                    console.log(response);
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
                            <div class="del-dialogue-button" v-on:click="delete_entry($event)">
                                {{guiMessages.selected.lida.button_delete}}
                            </div>
                            <input type="checkbox" class="user-checkbox" v-bind:id="'check_'+collection.id" :value="collection.id" v-model="assignedCollections" v-on:click="add_or_remove(collection.id)">
                            <div class="entry-info">
                                <label :for="'check_'+collection.id" class="listed-label" v-on:click="changesSaved = 'false'">
                                    <div class="entry-id">
                                        <span>Collection:</span> {{collection.id}}
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
                                        <span>Assigned to: <span class="gold-false">{{collection.assignedTo}}</span> </span>
                                    </div>
                                    <div class="entry-date">
                                        {{collection.lastUpdate.slice(0,-3)}}
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
   
   props: ["selectedCollection"],

   data () {
         return {
            entry : {},
            guiMessages,
            role: mainApp.role,
            allUsers:[],
            checkedUsers:[],
         }
   },

   mounted () {
      this.init();
   },

   methods: {

         init : function(){
            backend.get_db_entry_async(this.selectedCollection,"dialogues_collections")
                  .then( (response) => {
                     console.log("Collection",response[0]);
                     this.entry = response[0];
                     this.allUsers = response[0]["assignedTo"]
                     mainContainer.style.cursor = null;
            });
        },
  },
  template:
  `
        <div id="collection_editing">
            <ul class="collection-dialogues">
                <h2>Dialogues</h2>
                    <li v-for='(content,name) in entry.document' v-bind:id="name" class="entry-list-single-item-container">
                        <div class="entry-info" v-on:click="clicked_active()">
                            <div class="entry-id">
                                {{name}}
                            </div>
                        </div>
                    </li>
                </ul>

                <ul class="collection-users">
                <h2>Assigned to Users</h2>
                    <li class="listed-entry" v-for='name in allUsers' v-bind:id="name">
                        <div class="entry-list-single-item-container">
                            <div class="entry-info" v-on:click="clicked_entry(name)">
                                <div class="entry-id">
                                    <span>Username:</span> {{name}}
                                </div>
                            </div>
                        </div>
                    </li>
                </ul>
            </div>
  `
});