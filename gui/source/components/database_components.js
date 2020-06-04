Vue.component("database-view", {

    data() {
        return {
            changesSaved: "",
            guiMessages,
            allEntryMetadata: [],
            showModal: false,
            db_address:"127.0.0.1",
            db_port:"27017",
            userName: '',
            role:'',
            workspace:'',
        }
    },

    mounted () {
        this.init();
        this.role = mainApp.role;
    },

    beforeDestroyed() {
        console.log("==================================");
        console.log("I am being destroyed");
        console.log(this.entryId);
    },
    // METHODS
    methods:{
        init : function(){
            //Get DATABASE COLLECTION
            this.getAllEntriesFromServer();
        },

        getAllEntriesFromServer() {
            mainContainer.style.cursor = "progress";
            backend.get_all_db_entries_ids()
                .then( (response) => {
                    console.log();
                    this.allEntryMetadata = response;
                    console.log(this.allEntryMetadata);
                    mainContainer.style.cursor = null;
           });

        },

        clicked_entry(clickedEntry) {
            mainContainer.style.cursor = "progress";
            this.showModal = 'true';
            databaseEventBus.$emit("document_selected",clickedEntry);
        },

        update_database() {
            backend.update_db()
                .then( (response) => {
                    console.log(response);
                    this.changesSaved = "true";
                    this.getAllEntriesFromServer();
          });
        },

        confirm_and_update() {
            if (confirm(guiMessages.selected.database.confirmUpdate)) {
                this.update_database()
            }
        },

        delete_entry(event) {
            if (confirm(guiMessages.selected.admin.deleteConfirm)) {
                console.log('-------- DELETING --------')
                idToDelete = event.target.parentNode.parentNode.id;
                backend.del_db_entry_async(idToDelete, "database")
                    .then( () => {
                        this.getAllEntriesFromServer();
                    });
                databaseEventBus.$emit('entry_deleted', idToDelete);
            } else {
                return
            }
        },

        import_from_database() {
            //manually synchronize from database, it will delete server dialogue-source for the user
            this.userName = localStorage["remember"];
            let add = confirm(guiMessages.selected.database.confirmImport);
            if (add == true) {
                backend.del_all_dialogues_async()
                    .then( (response) => {
                        console.log(response);
                        this.restore_session_from_database(this.userName);
                });
            }
        },

        restore_session_from_database(fileName) {
            console.log("Ready to restore from database");
            backend.get_user_db_entry_async(fileName)
                .then( (response) => {
                    console.log(response);
            });
        }
    },
    template:
    `
        <div id="database-view">
            <database-header v-bind:workspace=true
                             v-bind:db_port="db_port"
                             v-bind:db_address="db_address">
            </database-header>
            <div class="inner-wrap">
                <ul class="collection-list">

                    <li class="listed-entry" v-for='name in allEntryMetadata' v-bind:id="name._id">
                        <div class="entry-list-single-item-container">
                            <div v-if="role == 'admin'" class="del-dialogue-button" v-on:click="delete_entry($event)">
                                {{guiMessages.selected.lida.button_delete}}
                            </div>
                            <div class="entry-info" v-on:click="clicked_entry(name._id)">
                                <div class="entry-id">
                                    <span>DOC:</span> {{name._id}}
                                </div>
                                <div class="entry-date">
                                    {{name.lastUpdate}}
                                </div>
                            </div>
                        </div>
                    </li>
                </ul>
                <button v-if="role != 'admin'" v-on:click="import_from_database()" class="help-button btn btn-sm btn-primary">{{guiMessages.selected.database.importDb}}</button>
                <button v-if="role != 'admin'" v-on:click="confirm_and_update()" class="help-button btn btn-sm btn-primary">{{guiMessages.selected.database.update}}</button>
                <div>
                    <span v-if="changesSaved == 'true'" class="is-saved">{{guiMessages.selected.database.saved}}</span>
                </div>
                <database-entry-modal v-if="showModal" @close="showModal = false"></database-entry-modal>
            </div>
        </div>
    `
});

Vue.component("collection-view", {

    data() {
        return {
            changesSaved: "",
            guiMessages,
            allEntryMetadata: [],
            showModal: false,
            showCreateModal: false,
            showSelectModal: false,
            db_address:"127.0.0.1",
            db_port:"27017",
            userName: '',
            workspace:'',
        }
    },

    created() {
        databaseEventBus.$on( "collections changed", this.init )
    },

    mounted () {
        this.init();
    },

    computed : {
        activeCollection : function() {
            if (localStorage["collection"] == undefined) {
                localStorage["collection"] = "";
            }
            return localStorage["collection"];
        },

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

        getAllEntriesFromServer() {
            mainContainer.style.cursor = "progress";
            backend.get_collections_ids_async()
                .then( (response) => {
                    console.log();
                    this.allEntryMetadata = response;
                    console.log(this.allEntryMetadata);
                    mainContainer.style.cursor = null;
            })

        },

        clicked_entry(clickedEntry) {
            mainContainer.style.cursor = "progress";
            this.showModal = 'true';
            databaseEventBus.$emit("document_selected",clickedEntry);
        },

        delete_entry(event) {
            if (confirm(guiMessages.selected.admin.deleteConfirm)) {
                console.log('-------- DELETING --------')
                idToDelete = event.target.parentNode.parentNode.id;
                backend.del_db_entry_async(idToDelete, "dialogues")
                    .then( () => {
                        databaseEventBus.$emit('collections changed');
                    });
            } else {
                return
            }
        },

        update_annotations(collectionID) {
            mainContainer.style.cursor = "progress";
            backend.update_collection_from_workspace_async(collectionID)
                .then( (response) => {
                    if (response.data.status == "success") {
                        console.log("Database: Dialogue Collection updated");
                    } else {
                        console.log("Database: Error:",response.data)
                        alert("Error! Collection not updated:",response.data)
                    }
                    mainContainer.style.cursor = null;
                    databaseEventBus.$emit('collections changed');
                    this.changesSaved = "true";
            });
        },

        update_collection() {

            if (this.activeCollection == "null") {
                alert(guiMessages.selected.collection.noCollection);
                return
            }
            if (confirm(guiMessages.selected.collection.updateConfirm1+" "+this.activeCollection+" "+guiMessages.selected.collection.updateConfirm2)) {
                this.update_annotations(this.activeCollection);
            }
        },
    },
    template:
    `
        <div id="collection-view">
            <database-header v-bind:workspace=false
                             v-bind:db_port="db_port"
                             v-bind:db_address="db_address">
            </database-header>
            <div class="inner-wrap">
                <ul class="collection-list">

                    <li class="listed-entry" v-for='name in allEntryMetadata' v-bind:id="name._id">
                        <div class="entry-list-single-item-container">
                            <div v-if="role == 'admin'" class="del-dialogue-button" v-on:click="delete_entry($event)">
                                {{guiMessages.selected.lida.button_delete}}
                            </div>
                            <div class="entry-info" v-on:click="clicked_entry(name._id)">
                                <div class="entry-id">
                                    <span>Collection:</span> {{name._id}}
                                </div>
                                <div class="entry-date">
                                    {{name.lastUpdate}}
                                </div>
                                <div class="entry-assigned">
                                    <span>Assigned to:</span> {{name.assignedTo}}
                                </div>
                            </div>
                        </div>
                    </li>
                </ul>
                <button v-if="role == 'admin'" v-on:click="showCreateModal = true" class="help-button btn btn-sm btn-primary">{{guiMessages.selected.collection.create}}</button>
                <button v-if="role != 'admin'" v-on:click="update_collection" class="help-button btn btn-sm btn-primary">{{guiMessages.selected.collection.update}}</button>
                <div>
                    <span v-if="changesSaved == 'true'" class="is-saved">{{guiMessages.selected.database.saved}}</span>
                </div>
                <database-entry-modal v-if="showModal" @close="showModal = false"></database-entry-modal>
                <collection-creation-modal v-if="showCreateModal" @close="showCreateModal = false"></collection-creation-modal>
            </div>
        </div>
    `
});

Vue.component("database-header", {

    props: [ "workspace", "db_address", "db_port" ],

    data() { 
        return {
            guiMessages,
            showHelpWork:"",
            showHelpColl:""
        }
    
    },

    methods: {
        go_back : function(){
            console.log("==================================");
            console.log("==================================");
            console.log("==================================");
            annotationAppEventBus.$emit("go_back", event);
        },

        download_database(event) {
            backend.get_all_entries_async()
                .then( (response) => {
                    console.log()
                    let blob = new Blob([JSON.stringify(response, null, 4)], {type: 'application/json'});
                    const url = window.URL.createObjectURL(blob);
                    const link = document.createElement('a');
                    link.href = url;
                    fileName = "Database_"+utils.create_date()+".json";
                    link.setAttribute('download', fileName );
                    document.body.appendChild(link);
                    link.click();
            });
        },

        download_collections(event) {
            backend.get_collections_async()
                .then( (response) => {
                    console.log();
                    //file requires JSON parsing in order to avoid encoding errors
                    let fileContent = response;
                    for (doc in fileContent) {
                        fileContent[doc]["document"] = JSON.parse(fileContent[doc]["document"])
                    }
                    let blob = new Blob([JSON.stringify(fileContent, null, 4)], {type: 'application/json'});
                    const url = window.URL.createObjectURL(blob);
                    const link = document.createElement('a');
                    link.href = url;
                    console.log("----- File ready for download ----")
                    fileName = "Collections_"+utils.create_date()+".json";
                    link.setAttribute('download', fileName );
                    document.body.appendChild(link);
                    link.click();
                });
        },
    },

    template: 
    `
            <div class="database-menu">
                <h2 class="database-title">{{guiMessages.selected.database.title}}</h2>
                <div class="config-container">
                    <div class="inner">
                        <span>{{guiMessages.selected.database.location}}</span> <input v-model="db_address" readonly>
                        <span>{{guiMessages.selected.database.port}}</span> <input v-model="db_port" readonly>
                    </div>
                </div>
                <div class="help-button-container">
                    <button v-if="workspace" class="help-button btn btn-sm" @click="showHelpWork = true">{{ guiMessages.selected.database.showHelp }}</button>
                    <button v-else="workspace" class="help-button btn btn-sm" @click="showHelpColl = true">{{ guiMessages.selected.database.showHelp }}</button>

                    <button v-if="workspace" v-on:click="download_database()" class="help-button btn btn-sm btn-primary">{{guiMessages.selected.admin.button_downloadAll}}</button>
                    <button v-else v-on:click="download_collections()" class="help-button btn btn-sm btn-primary">{{guiMessages.selected.admin.button_downloadAll}}</button>
                    
                    <button v-on:click="go_back($event)" class="back-button btn btn-sm">{{guiMessages.selected.annotation_app.backToAll}}</button>
                </div>
                <help-database-modal v-if="showHelpWork" @close="showHelpWork = false"></help-database-modal>
                <help-collection-modal v-if="showHelpColl" @close="showHelpColl = false"></help-collection-modal>
            </div>
    `
});