Vue.component("database-header", {

    data(){ 
        return {
            guiMessages,
            showHelpWork:"",
            showHelpColl:"",
            userName:mainApp.userName,
            role:mainApp.role,
        }
    
    },

    methods: {
        go_back : function(){
            console.log("==================================");
            console.log("==================================");
            console.log("==================================");
            annotationAppEventBus.$emit("go_back", event);
        },

        admin_panel_clicked() {
            console.log("==================================");
            console.log("==================================");
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
                    <button class="help-button btn btn-sm" @click="showHelpColl = true">{{ guiMessages.selected.database.showHelp }}</button>
                    <button v-if="role == 'administrator'" class="btn-mid btn btn-sm btn-primary" @click="admin_panel_clicked()">{{guiMessages.selected.admin.button_admin}}</button>
                    <button v-on:click="go_back($event)" class="back-button btn btn-sm btn-primary">{{guiMessages.selected.annotation_app.backToAll}}</button>
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
            db_address:"127.0.0.1",
            db_port:"27017",
            userName: mainApp.userName,
            activeCollection: mainApp.activeCollection,
            activeCollectionMeta: {},
            collectionRate: mainApp.collectionRate
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

        getAllEntriesFromServer() {
            mainContainer.style.cursor = "progress";
            backend.get_specific_collections("dialogues_collections",{"assignedTo":mainApp.userName})
                .then( (response) => {
                    console.log("==== ASSIGNED COLLECTIONS ====");
                    this.allEntryMetadata = response;
                    console.log(this.allEntryMetadata);
                    mainContainer.style.cursor = null;
                    if (mainApp.boot == true)
                      this.retrieveActiveCollection();
            })

        },

        retrieveActiveCollection() {
            console.log("==== ACTIVE COLLECTION ====");
            search = {"id":mainApp.activeCollection,"annotator":mainApp.userName}
            projection = {"status":1,"done":1,"lastUpdate":1}
            backend.get_specific_collections("annotated_collections",search, projection)
                .then( (response) => {
                     if (response.length != 0) {
                        this.activeCollectionMeta = response[0]
                        console.log("Active Collection",this.activeCollectionMeta);
                        //storing data for persistence
                        mainApp.collectionRate = response[0].status;
                        mainApp.done = response[0].done;
                        collectionRate = response[0].status;
                        //executed only once
                        //mainApp.boot = false;
                     } else {
                        return
                     }
                });
        },

        clicked_entry(clickedEntry) {
            let del = confirm(guiMessages.selected.collection.confirmImport);
               if (del == true) {
                  mainContainer.style.cursor = "progress";
                  backend.del_all_dialogues_async()
                  .then( (response) => {
                     console.log(response);
                        backend.load_dialogues(clickedEntry)
                        .then( (response) => {
                           console.log("==== DIALOGUES IMPORT ====");
                           console.log(response);
                           if (response.data.created == true)
                              console.log("=== WRITING DESTINATION DOCUMENT FOR ANNOTATOR ====")
                           //set global variable with the collection name
                           databaseEventBus.$emit("collection_active", clickedEntry);
                           //create annotated_document
                           mainContainer.style.cursor = null;
                           annotationAppEventBus.$emit("go_back");
                    });
                })   
            }
        },

        clicked_active() {
            if (this.activeCollectionMeta.done == false)
                annotationAppEventBus.$emit("go_back");
            else
                allDialoguesEventBus.$emit("show_message",guiMessages.selected.collection.freezed);
        }, 

        update_annotations(collectionID) {
            mainContainer.style.cursor = "progress";
            backend.update_annotations(mainApp.activeCollection, {"status":mainApp.collectionRate}, false)
                .then( (response) => {
                    mainContainer.style.cursor = null;
                    databaseEventBus.$emit('collections_changed');
                    this.changesSaved = "true";
            });
        },

        update_collection() {
            if (this.activeCollection == "null") {
                allDialoguesEventBus.$emit("show_message",guiMessages.selected.collection.noCollection);
                return
            }
            if (confirm(guiMessages.selected.collection.updateConfirm1+" "+this.activeCollection+" "+guiMessages.selected.collection.updateConfirm2)) {
                this.update_annotations(this.activeCollection);
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
            <database-header v-bind:db_port="db_port"
                             v-bind:db_address="db_address">
            </database-header>
            <div class="inner-wrap">

                <ul class="active-collection">
                <h2>{{guiMessages.selected.lida.activeColl}}</h2>
                    <div v-if="activeCollection != null" class="entry-list-single-item-container">
                        <div class="entry-info" v-on:click="clicked_active()">
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

                            <div class="entry-assigned">
                                    <span>Annotator: </span> {{userName}}
                            </div>
                            <div class="entry-date">
                                    {{activeCollectionMeta.lastUpdate}}
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
                <h2>{{guiMessages.selected.lida.assignedColl}}</h2>
                    <li class="listed-entry" v-for='name in allEntryMetadata' v-bind:id="name.id" v-if="name.id != activeCollection">
                        <div class="entry-list-single-item-container">
                            <div class="entry-info" v-on:click="clicked_entry(name.id)">
                                <div class="entry-id">
                                    <span>Collection:</span> {{name.id}}
                                </div>
                              <div class="entry-annotated">
                                    <span class="load">{{guiMessages.selected.lida.load}}</span>
                              </div>
                                <div class="entry-assigned">
                                    <span>Assigned to:</span> {{name.assignedTo}}
                                </div>
                                <div class="entry-date">
                                    {{name.lastUpdate.slice(0,-3)}}
                                </div>
                            </div>
                        </div>
                    </li>
                </ul>
                <div class="closing-list">
                    <button v-on:click="update_collection" class="help-button btn btn-sm btn-primary">{{guiMessages.selected.collection.update}}</button>
                    <button v-on:click="set_done" class="help-button btn btn-sm btn-primary">{{guiMessages.selected.collection.done}}</button>
                    <span v-if="changesSaved == 'true'" class="is-saved">{{guiMessages.selected.database.saved}}</span>
                </div>
                <collection-entry-modal v-if="showModal" @close="showModal = false"></collection-entry-modal>
                <collection-creation-modal v-if="showCreateModal" @close="showCreateModal = false"></collection-creation-modal>
            </div>
        </div>
    `
});

/*******************************************
* ANNOTATED_COLLECTIONS SHOW DOCUMENT
********************************************/
Vue.component('database-entry-modal', {
   data () {
         return {
            entry : {},
            guiMessages,
            view: '',
            update: {},
            role: mainApp.role,
            showResult:false,
         }
   },

   mounted () {
      this.init();
   },

   methods: {

         init : function(){
            this.view = mainApp.status;
            if (mainApp.role != "administrator")
                collection = "annotated_collections";
            else 
                collection = "dialogues_collections";
            backend.get_db_entry_async(mainApp.displayingDocument,collection)
                  .then( (response) => {
                     console.log();
                     this.entry = response[0];
                     if (typeof(this.entry.document) == "object") {
                        this.entry.document = JSON.stringify(this.entry.document)
                     }
                     mainContainer.style.cursor = null;
            });

         },

         load_collection(doc) {
            //if role is admin loading in admin workspace
            if (this.role == "administrator") {
               let del = confirm(guiMessages.selected.collection.confirmRevision);
               if (del == true) {
                  backend.import_new_dialogue_from_json_string_async(doc, this.entry.id)
                  .then( (response) => {
                     console.log("==== INTERANNOTATOR IMPORT  ====");
                     console.log();
                     //set global variable with the collection name
                     //send event in all dialogues
                     this.showResult = true;
                     databaseEventBus.$emit( "collection_active", this.entry.id);
                  })
               }
            } else {
               let del = confirm(guiMessages.selected.collection.confirmImport);
               if (del == true) {
                  backend.del_all_dialogues_async()
                  .then( (response) => {
                     console.log(response);
                        backend.post_new_dialogue_from_json_string_async(doc, this.entry.id)
                        .then( (response) => {
                           console.log("==== DIALOGUES IMPORT ====");
                           console.log();
                           //set global variable with the collection name
                           //send event in all dialogues
                           this.showResult = true;
                           databaseEventBus.$emit( "collection_active", this.entry.id);
                           //create annotated_document
                           console.log("=== WRITING DESTINATION DOCUMENT FOR ANNOTATOR ====")
                           //backend.update_annotations(mainApp.activeCollection, {"status":"0%"}, false);
                        });
                  })   
               }
            }
         },

         import_doc(doc, conversion) {
            if (confirm(guiMessages.selected.database.confirmImport)) {
               backend.del_all_dialogues_async()
                  .then( (response) => {
                     console.log(response);
                     if (conversion != undefined) {
                        doc = JSON.stringify(JSON.parse(doc));
                        backend.import_new_dialogue_from_json_string_async(doc, this.entry.id)
                           .then( (response) => {
                              console.log("==== IMPORT FROM JSON SUCCESS ====");
                              console.log();
                              this.showResult = true;
                        });
                     } else {
                        backend.import_new_dialogues_from_string_lists_async(doc)
                           .then( (response) => {
                              console.log("==== IMPORT FROM STRING SUCCESS ====");
                              console.log();
                              this.showResult = true;
                        });
                     }
               });
            }
         },

         save() {
            params = {
               title:this.entry.title, 
               description:this.entry.description,
               annotationStyle:this.entry.annotationStyle,
               annotator:this.entry.owner,
               status:this.entry.status,
               document:this.entry.document,
            }
            for (element in params) {
               if (params[element] == undefined)
                  params[element] = ""
            }
            backend.update_collection_async(this.entry.id, params)
               .then( (response) => {
                  console.log();
                  console.log("============== Dialogues-Collection Updated ==============");
                  databaseEventBus.$emit('collections_changed');
                  this.$emit("close");
            });
         }
  },
  template:
  `
  <transition name="modal">
    <div class="modal-mask">
      <div class="modal-wrapper">

            <div class="modal-container-selection" v-if="showResult">
               <div class="modal-header">
                  <slot name="header">
                  <strong>{{guiMessages.selected.collection.importResult}}</strong>
                  </slot>
               </div>
            <hr>
               <div id="ask-selector">
                  <slot name="body">
                     <h2>{{guiMessages.selected.collection.importSuccess}}</h2>
                     <br>
                     {{guiMessages.selected.collection.importSuccessAddendum}}
                     <br>
                  </slot>
                  <br>
               </div>
               <div class="modal-footer">
                  <slot name="footer">
                     <hr>
                     <button class="modal-big-button modal-right-button" @click="$emit('close')">
                        OK
                     </button>
                  </slot>
                  LIDA
               </div>
            </div>    

         <div class="modal-container">
            <div class="modal-header">
               <slot name="header">
                  Dialogues Collection {{guiMessages.selected.modal_document[0]}}
               </slot>
            </div>
            <hr>
            <div class="modal-body">
              <slot name="body">
                  <strong>ID:</strong>
                  <input class="collection-input" type="text" v-model="entry.id" readonly>
                  <br>
                  <strong>fromCollection:</strong>
                  <input class="collection-input" type="text" v-model="entry.fromCollection" readonly>
                  <br>
                  <strong>{{guiMessages.selected.collection.collAssi}}:</strong>
                  <input class="collection-input" type="text" v-model="entry.annotator" readonly>
                  <br>
                  <strong>{{guiMessages.selected.collection.collUpda}}:</strong>
                  <input class="collection-input" type="text" v-model="entry.lastUpdate" readonly>
                  <br>
                  <strong>{{guiMessages.selected.collection.collStatus}}:</strong>
                  <input class="collection-input" type="text" v-model="entry.status" readonly>
                  <br>
                  <strong>Done:</strong>
                  <input class="collection-input" type="text" v-model="entry.done" readonly>
                  <br><br>
                  <strong>
                  {{guiMessages.selected.modal_document[0]}}
                  </strong>
                  <br>
                  <textarea v-model="entry.document" readonly>
                  </textarea>
              </slot>
          </div>
          <hr>
          <div class="modal-footer">
            <slot name="footer">
              <button class="modal-big-button" @click="load_collection(entry.document)">
                {{guiMessages.selected.collection.importColl}}
              </button>
              <button v-if="role == 'administrator'" class="modal-big-button" @click="save()">
                {{guiMessages.selected.annotation_app.save}}
              </button>
              <button class="modal-big-button modal-right-button" @click="$emit('close')">
                {{guiMessages.selected.annotation_app.close}}
              </button>
            </slot>
          </div>
        </div>

      </div>
    </div>
  </transition>
  `
})