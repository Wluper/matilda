Vue.component("datamanagement-view", {

    data() {
        return {
            changesSaved: "",
            guiMessages,
            allEntryMetadata: [],
            showModal: false,
            showHelpColl: false,
            showCreateModal: false,
            showSelectModal: false,
            userName: mainApp.userName,
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

        clicked_active() {
            adminAppEventBus.$emit("go_back");
        },

        delete_entry(event) {
            if (confirm(guiMessages.selected.admin.deleteConfirm)) {
                console.log('-------- DELETING --------')
                idToDelete = event.target.parentNode.parentNode.id;
                backend.del_db_entry_async(idToDelete, "dialogues_collections")
                    .then( () => {
                        databaseEventBus.$emit('collections_changed');
                    });
            } else {
                return
            }
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

                <ul class="collection-list">
                    <li class="listed-entry" v-for='name in allEntryMetadata' v-bind:id="name.id">
                        <div class="entry-list-single-item-container">
                            <div class="del-dialogue-button" v-on:click="delete_entry($event)">
                                {{guiMessages.selected.lida.button_delete}}
                            </div>
                            <div class="entry-info" v-on:click="clicked_entry(name.id)">
                                <div class="entry-id">
                                    <span>Collection:</span> {{name.id}}
                                </div>
                              <div class="entry-annotated">
                                <template v-if="name.gold">
                                <span>Gold: True</span>
                                </template>
                                <template v-else>
                                <span>Gold: False</span>
                                </template>
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
                <button v-if="role == 'administrator'" v-on:click="showCreateModal = true" class="help-button btn btn-sm btn-primary">{{guiMessages.selected.collection.create}}</button>
                <button v-if="role != 'administrator'" v-on:click="update_collection" class="help-button btn btn-sm btn-primary">{{guiMessages.selected.collection.update}}</button>
                <div>
                    <span v-if="changesSaved == 'true'" class="is-saved">{{guiMessages.selected.database.saved}}</span>
                </div>
                <collection-entry-modal v-if="showModal" @close="showModal = false"></collection-entry-modal>
                <collection-creation-modal v-if="showCreateModal" @close="showCreateModal = false"></collection-creation-modal>
            </div>
        </div>
    `
});



Vue.component('collection-creation-modal', {
   data () {
      return {
         entry : {
            id:"",
            title:"",
            description:"",
            assignedTo:[],
            annotationStyle:"",
            document:"",
         },
         guiMessages,
         update: {},
         userList: [],
         allUsers: [],
         checkedUsers:[],
         showSelector: false,
         role:mainApp.role
      }
   },

   mounted () {
      this.get_all_users();
   },

   methods: {

      get_all_users() {
         backend.get_all_users()
            .then( (response) => {
                  this.allUsers = response;
                  console.log(this.allUsers);
         });
      },

      add_from_view() {
         backend.get_all_dialogues_async("admin")
            .then( (response) => {
                this.formatJSON(response);
         });
      },

      add_from_file(event) {
         let file = event.target.files[0];
         let jsonType = /application.json/;
         if (file.type.match(jsonType)) {
            console.log('---- HANDLING LOADED JSON FILE ----');
            let reader = new FileReader();
            reader.onload = (event) => {
                console.log('THE READER VALUE', reader);
                //removing starting and ending {}
                this.formatJSON(reader.result, true);
               }
            reader.readAsText(file);
         } else {
            alert('Only .json files are supported.')
         }
      },

      add_from_user(selected) {
         if (selected != true) {
            backend.get_all_db_entriesi_ds()
               .then( (response) => {
                  console.log();
                  this.userList = response;
                  this.showSelector = true;
            })
         } else {
            for (name in this.checkedUsers) {
               backend.get_db_entry_async(this.checkedUsers[name],"database")
                  .then( (response) => {
                     console.log();
                     this.formatJSON(response[0]["annotations"]);
                  })
            }
            this.showSelector = false;
         }
      },

      formatJSON(jsonFile, fromFile) {
         if (fromFile == undefined) {
            prepare = JSON.stringify(jsonFile);
         } else {
            prepare = jsonFile;
         }
         //correctly chains more than one json
         prepare = prepare.trim();
         prepare = prepare.slice(1,-1);
         if (this.entry.document.length > 0) {
            this.entry.document += ","+prepare;
         } else {
            this.entry.document += prepare;
         }
      },

      save() {
         params = {
            id:this.entry.id,
            title:this.entry.title, 
            description:this.entry.description,
            annotationStyle:this.entry.annotationStyle,
            errors:{},
            gold:{},
            assignedTo:this.checkedUsers,
         }
         for (element in params) {
            if (params[element] == undefined)
                  params[element] = ""
         }
         if ((params.id == "") || (params.id == undefined)) {
               params.id = "Collection"+Math.floor(Math.random() * 10001);
         }
         if (this.entry.document.length == 0)
            this.entry.document = " ";
         doc = this.entry.document.trim();
         backend.update_collection_async(params.id, params, doc)
               .then( (response) => {
                  console.log();
                  console.log("Database: Dialogue Collection updloaded with id",params.id);
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

         <div class="modal-container" v-if="showSelector">
            <div class="modal-header">
               <slot name="header">
                  {{guiMessages.selected.collection.create}}
               </slot>
            </div>
            <hr>
            <div id="ask-selector">
               <slot name="body">
                  <br>
                  <h2>{{guiMessages.selected.collection.addToColl}}</h2>
                  <br>
                  <div class="database-selection">

                     <li class="listed-entry" v-for="name in userList">
                        <div class="entry-list-single-user-container">
                        <input type="checkbox" class="user-checkbox" v-bind:id="name.id" :value="name.id" v-model="checkedUsers">
                           <div class="entry-info in-selector with-top-border">
                              <label :for="name.id"> 
                                 <strong>ID:</strong> {{name.id}} 
                                 <br>
                                 <strong>Last updated:</strong> {{name.lastUpdate}} 
                              </label>
                           </div>
                        </div>
                     </li>

                  </div>
               </slot>
            </div>
            <hr class="clear">
          <div class="modal-footer">
            <slot name="footer">
              <button class="modal-big-button" @click="add_from_user(true)">
              {{guiMessages.selected.collection.add}}
              </button>
              <button class="modal-big-button modal-right-button" @click="$emit('close')">
                {{guiMessages.selected.annotation_app.close}}
              </button>
            </slot>
          </div>
        </div>

         <div class="modal-container" v-else>
            <div class="modal-header">
               <slot name="header">
                  {{guiMessages.selected.collection.create}}
               </slot>
            </div>
            <hr>
            <div class="modal-body">
              <slot name="body">
                  <strong>ID:</strong>
                  <input class="collection-input" type="text" v-model="entry.id" :placeholder="guiMessages.selected.coll_creation[0]">
                  <br>
                  <strong>{{guiMessages.selected.collection.collTitle}}:</strong>
                  <input class="collection-input" type="text" v-model="entry.title" :placeholder="guiMessages.selected.coll_creation[1]">
                  <br>
                  <strong>{{guiMessages.selected.collection.collDesc}}:</strong>
                  <input class="collection-input" type="text" v-model="entry.description" :placeholder="guiMessages.selected.coll_creation[2]">
                  <br><br>
                  <strong>{{guiMessages.selected.collection.collAnnot}}:</strong>
                  <input class="collection-input" type="text" v-model="entry.annotationStyle" :placeholder="guiMessages.selected.coll_creation[3]">
                  <br>
                  <strong>{{guiMessages.selected.collection.collAssi}}:</strong>
                  <template v-for="user in allUsers">
                    <input type="checkbox" :value="user.userName" :id="user.userName" v-model="checkedUsers">
                    <label :for="user.userName">{{user.userName}}</label>
                  </template>
                  <br><br>
                  <strong>
                  {{guiMessages.selected.modal_document[0]}}
                  </strong>
                  <br>
                  <textarea v-model="entry.document">
                  </textarea>
              </slot>
          </div>
          <hr>
          <div class="modal-footer">
            <slot name="footer">
              <!--
              <button class="modal-big-button" @click="add_from_view">
                {{guiMessages.selected.collection.importCollfromView}}
              </button>
              -->
              <input type="file"
                   id="fileInput"
                   name="fileInput"
                   accept=".txt, .json"
                   v-on:change="add_from_file($event)">

               <label for="fileInput"
                   id="fileInputLabel_modal"
                   class="btn btn-sm">
                   {{ guiMessages.selected.collection.importCollfromFile }}
               </label>
               <!--
              <button class="modal-big-button" @click="add_from_user()">
                {{guiMessages.selected.collection.importCollfromUser}}
              </button>
               -->
              <button class="modal-big-button modal-right-button" @click="$emit('close')">
                {{guiMessages.selected.annotation_app.close}}
              </button>
              <button class="modal-big-button modal-right-button" @click="save()">
                {{guiMessages.selected.annotation_app.save}}
              </button> 
            </slot>
          </div>
        </div>
      </div>
    </div>
  </transition>
  `
});

Vue.component('collection-entry-modal', {
   data () {
         return {
            entry : {},
            guiMessages,
            view: '',
            update: {},
            role: mainApp.role,
            showResult:false,
            allUsers:[],
            checkedUsers:[],
         }
   },

   mounted () {
      this.init();
      this.get_all_users();
   },

   methods: {

          get_all_users() {
              backend.get_all_users()
                .then( (response) => {
                    this.allUsers = response;
                    console.log(this.allUsers);
              });
          },

         init : function(){
            this.view = mainApp.status;
            collection = "dialogues_collections";
            backend.get_db_entry_async(mainApp.displayingDocument,collection)
                  .then( (response) => {
                     console.log();
                     this.entry = response[0];
                     if (typeof(this.entry.document) == "object") {
                        this.entry.document = JSON.stringify(this.entry.document)
                        this.entry.gold = JSON.stringify(this.entry.gold)
                        this.entry.errors = JSON.stringify(this.entry.errors)
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
                           backend.update_db(this.entry.id,"0%");
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
               assignedTo:this.entry.assignedTo,
               gold:this.entry.gold,
               errors:this.entry.errors,
            }
            for (element in params) {
               if (params[element] == undefined)
                  params[element] = ""
            }
            let preparedDocument = this.entry.document;
            if (preparedDocument == undefined)
              preparedDocument = " "
            backend.update_collection_async(this.entry.id, params, preparedDocument)
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

         <div class="modal-container" id="collection-review">
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
                  <strong>{{guiMessages.selected.collection.collTitle}}:</strong>
                  <input class="collection-input" type="text" v-model="entry.title" readonly>
                  <br>
                  <strong>{{guiMessages.selected.collection.collDesc}}:</strong>
                  <input class="collection-input" type="text" v-model="entry.description" readonly>
                  <br>
                  <strong>{{guiMessages.selected.collection.collAnnot}}:</strong>
                  <input class="collection-input" type="text" v-model="entry.annotationStyle" readonly>
                  <br>
                  <strong>{{guiMessages.selected.collection.collAssi}}:</strong>
                      <template v-for="user in allUsers">
                          <input type="checkbox" :value="user.userName" :id="user.userName" v-model="entry.assignedTo">
                          <label :for="user.userName">{{user.userName}}</label>
                      </template>
                  <br>
                  <strong>{{guiMessages.selected.collection.collUpda}}:</strong>
                  <input class="collection-input" type="text" v-model="entry.lastUpdate" readonly>
                  <br>
                  <strong>Gold:</strong>
                  <input class="collection-input" type="text" v-model="entry.gold" readonly>
                  <br>
                  <!--
                  <strong>Errors:</strong>
                  <input class="collection-input" type="text" v-model="entry.errors" readonly>
                  <br>
                  -->
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