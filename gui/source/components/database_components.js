Vue.component("database-view", {

    data() {
        return {
            changesSaved: "",
            guiMessages,
            allEntryMetadata: [],
            showModal: false,
            db_address:"127.0.0.1",
            db_port:"27017",
            role: '',
            userName: ''
        }
    },

    mounted () {
        this.init();
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
            this.detectRole();
            this.getAllEntriesFromServer();
        },
        go_back : function(){
            console.log("==================================");
            console.log("==================================");
            console.log("==================================");
            annotationAppEventBus.$emit("go_back", event);
        },
        detectRole: function() {
            let title = document.getElementsByTagName("title")[0].textContent;
            if (title != " LIDA ") {
                this.role = "admin"
            }
        },

        getAllEntriesFromServer() {
            backend.get_all_db_entries_ids()
                .then( (response) => {
                    console.log();
                    this.allEntryMetadata = response;
                    console.log(this.allEntryMetadata);
           });

        },

        clicked_entry(clickedEntry) {
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

        download_database(event) {
            backend.get_all_entries_async()
                .then( (response) => {
                    console.log()
                    this.fileContent = response;
                    let blob = new Blob([JSON.stringify(response, null, 4)], {type: 'application/json'});
                    const url = window.URL.createObjectURL(blob);
                    const link = document.createElement('a');
                    link.href = url;
                    fileName = "Database.json";
                    link.setAttribute('download', fileName );
                    document.body.appendChild(link);
                    link.click();
                });
        },

        import_from_database() {
            //manually synchronize from database, ask if clean start is required
            this.userName = localStorage["remember"];
            let add = confirm(guiMessages.selected.database.confirmImport);
            if (add == true) {
                let del = confirm(guiMessages.selected.database.confirmWipe);
                if (del == true) {
                    backend.del_all_dialogues_async(this.userName)
                        .then( (response) => {
                            console.log(response);
                            this.restore_session_from_database(this.userName)
                    });
                } else {
                    this.restore_session_from_database(this.userName)
                }
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
            <div class="database-menu">
                <h2 class="database-title">{{guiMessages.selected.database.title}}</h2>
                <div class="config-container">
                    <div class="inner">
                        <span>{{guiMessages.selected.database.location}}</span> <input v-model="db_address" placeholder="127.0.0.1">
                        <span>{{guiMessages.selected.database.port}}</span> <input v-model="db_port" placeholder="27017">
                    </div>
                </div>
                <div class="help-button-container">
                    <button v-if="role != 'admin'" v-on:click="update_database()" class="help-button btn btn-sm btn-primary">{{guiMessages.selected.database.update}}</button>
                    <button v-on:click="download_database()" class="help-button btn btn-sm btn-primary">{{guiMessages.selected.admin.button_downloadAll}}</button>
                    <button v-on:click="go_back($event)" class="back-button btn btn-sm">{{guiMessages.selected.annotation_app.backToAll}}</button>
                </div>
            </div>
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
            db_address:"127.0.0.1",
            db_port:"27017",
            role: '',
            userName: ''
        }
    },

    created() {
        databaseEventBus.$on( "collections changed", this.init )
    },

    mounted () {
        this.init();
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
        go_back : function(){
            console.log("==================================");
            console.log("==================================");
            console.log("==================================");
            annotationAppEventBus.$emit("go_back", event);
        },

        getAllEntriesFromServer() {
            backend.get_collection_ids_async()
                .then( (response) => {
                    console.log();
                    this.allEntryMetadata = response;
                    console.log(this.allEntryMetadata);
            })

        },

        clicked_entry(clickedEntry) {
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

        download_collections(event) {
            backend.get_collection_ids_async()
                .then( (response) => {
                    console.log()
                    this.fileContent = response;
                    let blob = new Blob([JSON.stringify(response, null, 4)], {type: 'application/json'});
                    const url = window.URL.createObjectURL(blob);
                    const link = document.createElement('a');
                    link.href = url;
                    fileName = "Collections.json";
                    link.setAttribute('download', fileName );
                    document.body.appendChild(link);
                    link.click();
                });
        },
    },
    template:
    `
        <div id="collection-view">
            <div class="database-menu">
                <h2 class="database-title">{{guiMessages.selected.collection.title}}</h2>
                <div class="config-container">
                    <div class="inner">
                        <span>{{guiMessages.selected.database.location}}</span> <input v-model="db_address" placeholder="127.0.0.1">
                        <span>{{guiMessages.selected.database.port}}</span> <input v-model="db_port" placeholder="27017">
                    </div>
                </div>
                <div class="help-button-container">
                    <button v-on:click="download_collections()" class="help-button btn btn-sm btn-primary">{{guiMessages.selected.admin.button_downloadAll}}</button>
                    <button v-on:click="go_back($event)" class="back-button btn btn-sm">{{guiMessages.selected.annotation_app.backToAll}}</button>
                </div>
            </div>
            <div class="inner-wrap">
                <ul class="collection-list">

                    <li class="listed-entry" v-for='name in allEntryMetadata' v-bind:id="name._id">
                        <div class="entry-list-single-item-container">
                            <div class="del-dialogue-button" v-on:click="delete_entry($event)">
                                {{guiMessages.selected.lida.button_delete}}
                            </div>
                            <div class="entry-info" v-on:click="clicked_entry(name._id)">
                                <div class="entry-id">
                                    <span>COLLECTION:</span> {{name._id}}
                                </div>
                                <div class="entry-date">
                                    {{name.lastUpdate}}
                                </div>
                            </div>
                        </div>
                    </li>
                </ul>
                <button v-on:click="showCreateModal = true" class="help-button btn btn-sm btn-primary">{{guiMessages.selected.collection.create}}</button>
                <div>
                    <span v-if="changesSaved == 'true'" class="is-saved">{{guiMessages.selected.database.saved}}</span>
                </div>
                <database-entry-modal v-if="showModal" @close="showModal = false"></database-entry-modal>
                <collection-creation-modal v-if="showCreateModal" @close="showCreateModal = false"></collection-creation-modal>
            </div>
        </div>
    `
});