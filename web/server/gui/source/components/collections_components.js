Vue.component("database-header", {

    data(){ 
        return {
            guiMessages,
            showHelpWork:"",
            showHelpColl:"",
            userName:mainApp.userName,
            role:mainApp.role,
            activeColl: mainApp.activeCollection,
        }
    
    },

    methods: {
        go_back : function(){
            console.log("==================================");
            annotationAppEventBus.$emit("go_back", event);
        },

        admin_panel_clicked() {
            console.log("==================================");
            annotationAppEventBus.$emit("admin_panel_clicked");
        }

    },

    template: 
    `
            <div class="database-menu">
                <h2 class="database-title">{{guiMessages.selected.collection.title}}</h2>
                <user-bar v-bind:userName="userName"></user-bar>
                <div class="help-button-container">
                    <button v-if="role == 'administrator'" class="btn-mid btn btn-sm btn-primary" @click="admin_panel_clicked()">{{guiMessages.selected.admin.button_admin}}</button>
                    <button v-if="activeColl != null" v-on:click="go_back($event)" class="back-button btn btn-sm">{{guiMessages.selected.admin.annotation}}</button>
                </div>
                <help-collection-modal v-if="showHelpColl" @close="showHelpColl = false"></help-collection-modal>
            </div>
    `
});

Vue.component("collection-view", {

    props: [
        "done"
    ],

    data() {
        return {
            changesSaved: "",
            guiMessages,
            allEntryMetadata: [],
            showModal: false,
            showCreateModal: false,
            showSelectModal: false,
            userName: mainApp.userName,
            activeCollection: mainApp.activeCollection,
            activeCollectionMeta: {},
            collectionRate: mainApp.collectionRate,
            lastUpdate: mainApp.lastUpdate,
            annotationStyle: mainApp.annotationStyle
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
            console.log(this.activeCollection)
        },

        getAllEntriesFromServer() {
            document.body.style.cursor = "progress";
            backend.get_specific_collections("dialogues_collections",{"assignedTo":mainApp.userName})
                .then( (response) => {
                    console.log("==== ASSIGNED COLLECTIONS ====");
                    this.allEntryMetadata = response;
                    console.log(this.allEntryMetadata);
                    document.body.style.cursor = null;
                    if (this.allEntryMetadata.length != 0) {
                        this.retrieveActiveCollection();
                    } else {
                        this.activeCollection = null;
                        databaseEventBus.$emit("collection_active", null );
                    }
                }
            )
        },

        retrieveServerless() {
            if (mainApp.activeCollection != "") {
                for (var i=0; i<this.allEntryMetadata.length; i++) {
                   if (mainApp.activeCollection == this.allEntryMetadata[i].id) {
                      this.annotationStyle = this.allEntryMetadata[i].annotationStyle;
                      mainApp.annotationStyle = this.allEntryMetadata[i].annotationStyle;
                   }
                }
            }
        },

        retrieveActiveCollection() {
            console.log("==== ACTIVE COLLECTION ====");
            search = {"id":mainApp.activeCollection,"annotator":mainApp.userName}
            projection = {"status":1,"done":1,"lastUpdate":1}
            backend.get_specific_collections("annotated_collections",search, projection)
                .then( (response) => {
                    if (response.length != 0) {
                        this.activeCollectionMeta = response[0];
                        console.log("Active Collection",this.activeCollectionMeta);
                        //storing data for persistence
                        mainApp.collectionRate = response[0].status;
                        mainApp.done = response[0].done;
                        mainApp.lastUpdate = response[0].lastUpdate;
                        this.collectionRate = response[0].status;
                        //updating annotation style view
                        this.retrieveServerless();
                    } else {
                        //if active collection document doesn't exist anymore
                        databaseEventBus.$emit( "collection_active", null );
                        this.activeCollection = null;
                        return
                    }
                    mainApp.boot = false;
                }
            );
        },

        clicked_entry(clickedEntry) {
            if (mainApp.activeCollection != null) {
                var del = confirm(guiMessages.selected.collection.confirmImport);
            } else {
                del = true;
            }
            if (del == true) {
                document.body.style.cursor = "progress";
                backend.del_all_dialogues_async()
                .then( (response) => {
                    console.log(response);
                        backend.load_dialogues(clickedEntry)
                        .then( (response) => {
                            console.log("==== DIALOGUES IMPORT ====");
                            console.log(response);
                            if (response.data.created == true) {
                                console.log("=== CREATED NEW DOCUMENT ====")
                            }
                            databaseEventBus.$emit("collection_active", clickedEntry);
                            document.body.style.cursor = null;
                            annotationAppEventBus.$emit("go_back");
                        }
                    );
                })   
            }
        },

        clicked_active(id) {
            if (this.activeCollectionMeta.done == true) {
                allDialoguesEventBus.$emit("show_message",guiMessages.selected.collection.freezed);
            } else {
                //if the collection is still asigned to the user
                for (index in this.allEntryMetadata) {
                    if (this.allEntryMetadata[index]["id"] == id) {
                        //go back to annotation view
                        annotationAppEventBus.$emit("go_back");
                        return;
                    }
                }
                databaseEventBus.$emit("collection_active", null);
                this.activeCollection = null;
                alert("Collection is no more assigned to you or has been deleted from the server");
            }
        }, 

        update_annotation_rate(collectionID) {
            document.body.style.cursor = "progress";
            backend.update_annotations(mainApp.activeCollection, {"status":mainApp.collectionRate}, false)
                .then( (response) => {
                    document.body.style.cursor = null;
                    databaseEventBus.$emit('collections_changed');
                    this.changesSaved = "true";
            });
        },

        update_collection() {
            if (this.activeCollection == null) {
                allDialoguesEventBus.$emit("show_message",guiMessages.selected.collection.noCollection);
                return
            }
            if (confirm(guiMessages.selected.collection.updateConfirm1+" "+this.activeCollection+" "+guiMessages.selected.collection.updateConfirm2)) {
                this.update_annotation_rate(this.activeCollection);
            }
        },

        set_done() {
            if (confirm(guiMessages.selected.collection.freeze)) {
                if (this.activeCollectionMeta.done != true) {
                  backend.update_collection_fields(this.activeCollection, {"done":true})
                    .then((response) => {
                        databaseEventBus.$emit('collections_changed');
                  });
                }
            }
        }
    },
    template:
    `
        <div id="annotation-view">
            <database-header></database-header>
            <div class="inner-wrap">

                <ul class="active-collection">
                <h2 class="list-title">{{guiMessages.selected.lida.activeColl}}</h2>
                    <div v-if="activeCollection != null" class="entry-list-single-item-container">
                        <div class="entry-info" v-on:click="clicked_active(activeCollection)">
                            <div class="entry-id">
                                <span>Collection:</span> {{activeCollection}}
                            </div>

                            <div v-if="collectionRate != ''" class="entry-annotated">
                                <span>Status: {{collectionRate}}</span>
                                <div class="annotated-bar">
                                    <div class="annotated-fill" v-bind:style="{ width: collectionRate }"></div>
                                </div>
                            </div>

                            <div v-else class="entry-annotated">
                                <span>Status: {{activeCollectionMeta.status}}</span>
                                <div class="annotated-bar">
                                    <div class="annotated-fill" v-bind:style="{ width: activeCollectionMeta.status }"></div>
                                </div>
                            </div>

                            <div class="entry-annotation-style">
                                    Annotation style: <span id="showAnnotationStyle">{{annotationStyle.split(".")[0]}}</span>
                            </div>
                            <div class="entry-date">
                                <template v-if="lastUpdate == ''">
                                    {{activeCollectionMeta.lastUpdate}}
                                </template>
                                <template v-else>
                                    {{lastUpdate}}
                                </template>

                            </div>
                            <div></div>
                            <div class="entry-done">
                                Done: <span v-if="done" class="gold-true">{{done}}</span>
                                      <span v-else class="gold-false">{{done}}</span>
                            </div>
                        </div>
                    </div>
                </ul>

                <ul class="annotation-list">
                <h2 class="list-title">{{guiMessages.selected.lida.assignedColl}}</h2>
                    <li class="listed-entry" v-for='name in allEntryMetadata' v-bind:id="name.id">
                        
                        <div v-if="name.id == activeCollection" class="entry-list-single-item-container" style="opacity:0.3">
                            <div class="entry-info" v-on:click="clicked_entry(name.id)">
                                <div class="entry-id">
                                    <span>{{guiMessages.selected.collection.name}}:</span> {{name.id}}
                                </div>
                              <div class="entry-annotated">
                                    <span class="load">{{guiMessages.selected.lida.load}}</span>
                              </div>
                                <div class="entry-assigned">
                                    <span>{{guiMessages.selected.collection.collAssi}}:</span> {{name.assignedTo.join(", ")}}
                                </div>
                                <div class="entry-date">
                                    {{name.lastUpdate.slice(0,-3)}}
                                    <span id="activeAnnotationStyle" style="display: contents;">{{name.annotationStyle.split(".")[0]}}</span>
                                </div>
                            </div>
                        </div>

                        <div v-else class="entry-list-single-item-container">
                            <div class="entry-info" v-on:click="clicked_entry(name.id)">
                                <div class="entry-id">
                                    <span>Collection:</span> {{name.id}}
                                </div>
                              <div class="entry-annotated">
                                    <span class="load">{{guiMessages.selected.lida.load}}</span>
                              </div>
                                <div class="entry-assigned">
                                    <span style="font-weight:bold">Assigned to:</span> 
                                    <span style="color: #087fdd; font-weight: 100;">{{name.assignedTo.join(", ")}}</span>
                                </div>
                                <div class="load-entry-date">
                                    {{name.lastUpdate.slice(0,-3)}}
                                    {{name.annotationStyle.split(".")[0]}}
                                </div>
                            </div>
                        </div>
                    </li>
                </ul>
                <div v-if="activeCollection != null" class="closing-list">
                    <!-- <button v-on:click="update_collection" class="help-button btn btn-sm btn-primary">{{guiMessages.selected.collection.update}}</button> -->
                    <button v-on:click="set_done" class="help-button btn btn-sm btn-primary">{{guiMessages.selected.collection.done}}</button>
                    <span v-if="changesSaved == 'true'" class="is-saved">{{guiMessages.selected.database.saved}}</span>
                </div>
                <collection-entry-modal v-if="showModal" @close="showModal = false"></collection-entry-modal>
                <collection-creation-modal v-if="showCreateModal" @close="showCreateModal = false"></collection-creation-modal>
            </div>
        </div>
    `
});