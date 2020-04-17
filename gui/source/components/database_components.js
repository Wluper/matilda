Vue.component("database-view", {

    data() {
        return {
            changesSaved: "",
            guiMessages,
            allEntryMetadata: [],
            db_address:"127.0.0.1",
            db_port:"27017",
            role: ''
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
            this.detectMode();
            this.getAllEntriesFromServer();
        },
        go_back : function(){
            console.log("==================================");
            console.log("==================================");
            console.log("==================================");
            annotationAppEventBus.$emit("go_back", event);
        },
        detectMode: function() {
            let title = document.getElementsByTagName("title")[0].textContent;
            console.log(title);
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
            databaseEventBus.$emit("entry_selected", this.allEntryMetadata[clickedEntry])
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
            if (confirm("Are you sure you want to permanently delete this entry? This cannot be undone!")) {
                console.log('-------- DELETING --------')
                idToDelete = event.target.parentNode.parentNode.id;
                backend.del_db_entry_async(idToDelete)
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
                <div>
                    <span v-if="changesSaved == 'true'" class="is-saved">{{guiMessages.selected.database.saved}}</span>
                </div>
            </div>
        </div>
    `
});