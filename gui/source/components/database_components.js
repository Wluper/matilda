Vue.component("database-header", {

    props: [ "workspace", "db_address", "db_port"],

    data(){ 
        return {
            guiMessages,
            showHelpWork:"",
            showHelpColl:"",
        }
    
    },

    methods: {
        go_back : function(){
            console.log("==================================");
            console.log("==================================");
            console.log("==================================");
            annotationAppEventBus.$emit("go_back", event);
        },

        download_collections(event) {
            backend.get_collections_async()
                .then( (response) => {
                    console.log();
                    let fileContent = response;
                    for (doc in fileContent) {
                        fileContent[doc]["document"] = fileContent[doc]["document"]
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
                <h2 class="database-title">{{guiMessages.selected.collection.title}}</h2>
                <div class="config-container">
                    <div class="inner">
                        <span>{{guiMessages.selected.database.location}}</span> <input v-model="db_address" readonly>
                        <span>{{guiMessages.selected.database.port}}</span> <input v-model="db_port" readonly>
                    </div>
                </div>
                <div class="help-button-container">
                    <button class="help-button btn btn-sm" @click="showHelpColl = true">{{ guiMessages.selected.database.showHelp }}</button>

                    <button v-on:click="download_collections()" class="help-button btn btn-sm btn-primary">{{guiMessages.selected.admin.button_downloadAll}}</button>
                    
                    <button v-on:click="go_back($event)" class="back-button btn btn-sm btn-primary">{{guiMessages.selected.annotation_app.backToAll}}</button>
                </div>
                <help-collection-modal v-if="showHelpColl" @close="showHelpColl = false"></help-collection-modal>
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
        databaseEventBus.$on( "collections_changed", this.init )
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
                        databaseEventBus.$emit('collections_changed');
                    });
            } else {
                return
            }
        },

        update_annotations(collectionID) {
            mainContainer.style.cursor = "progress";
            backend.update_db(mainApp.collectionRate, false)
                .then( (response) => {
                    mainContainer.style.cursor = null;
                    databaseEventBus.$emit('collections_changed');
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
            <database-header v-bind:db_port="db_port"
                             v-bind:db_address="db_address">
            </database-header>
            <div class="inner-wrap">
                <ul class="collection-list">

                    <li class="listed-entry" v-for='name in allEntryMetadata' v-bind:id="name._id">
                        <div v-if="role != 'admin'" class="entry-list-single-item-container" style="grid-template: [row1-start] 'info' [row1-end] / 1fr;">
                            <div v-if="role == 'admin'" class="del-dialogue-button" v-on:click="delete_entry($event)">
                                {{guiMessages.selected.lida.button_delete}}
                            </div>
                            <div class="entry-info" v-on:click="clicked_entry(name._id)">
                                <div class="entry-id">
                                    <span>Collection:</span> {{name._id}}
                                </div>
                              <div class="entry-annotated">
                                <span>Status: {{name.status}}</span>
                                <div class="annotated-bar">
                                    <div class="annotated-fill" v-bind:style="{ width: name.status }"></div>
                                </div>
                              </div>
                                <div class="entry-assigned">
                                    <span>Assigned to:</span> {{name.assignedTo}}
                                </div>
                                <div class="entry-date">
                                    {{name.lastUpdate}}
                                </div>
                            </div>
                        </div>

                        <div v-else class="entry-list-single-item-container">
                            <div v-if="role == 'admin'" class="del-dialogue-button" v-on:click="delete_entry($event)">
                                {{guiMessages.selected.lida.button_delete}}
                            </div>
                            <div class="entry-info" v-on:click="clicked_entry(name._id)">
                                <div class="entry-id">
                                    <span>Collection:</span> {{name._id}}
                                </div>
                              <div class="entry-annotated">
                                <span>Status: {{name.status}}</span>
                                <div class="annotated-bar">
                                    <div class="annotated-fill" v-bind:style="{ width: name.status }"></div>
                                </div>
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

/*******************************************
* DATABASE AND COLLECTIONS SHOW DOCUMENT
********************************************/
Vue.component('database-entry-modal', {
   data () {
         return {
            entry : {},
            guiMessages,
            view: '',
            update: {},
            role: '',
            showResult:false,
         }
   },

   mounted () {
      this.init();
      this.role = mainApp.role;
   },

   methods: {

         init : function(){
            this.view = mainApp.status;
            collection = "dialogues";
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
            if (this.role == "admin") {
               let del = confirm(guiMessages.selected.collection.confirmRevision);
               if (del == true) {
                  backend.import_new_dialogue_from_json_string_async(doc, this.entry._id)
                  .then( (response) => {
                     console.log("==== INTERANNOTATOR IMPORT  ====");
                     console.log();
                     //set global variable with the collection name
                     //send event in all dialogues
                     this.showResult = true;
                     databaseEventBus.$emit( "collection_active", this.entry._id);
                  })
               }
            } else {
               let del = confirm(guiMessages.selected.collection.confirmImport);
               if (del == true) {
                  backend.del_all_dialogues_async()
                  .then( (response) => {
                     console.log(response);
                        backend.post_new_dialogue_from_json_string_async(doc, this.entry._id)
                        .then( (response) => {
                           console.log("==== DIALOGUES IMPORT ====");
                           console.log();
                           //set global variable with the collection name
                           //send event in all dialogues
                           this.showResult = true;
                           databaseEventBus.$emit( "collection_active", this.entry._id);
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
                        backend.import_new_dialogue_from_json_string_async(doc, this.entry._id)
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
               status:this.entry.status,
               document:this.entry.document
            }
            for (element in params) {
               if (params[element] == undefined)
                  params[element] = ""
            }
            let preparedDocument = params;
            backend.update_collection_async(this.entry._id, preparedDocument)
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
                  <input class="collection-input" type="text" v-model="entry._id" readonly>
                  <br>
                  <strong>{{guiMessages.selected.collection.collTitle}}:</strong>
                  <input class="collection-input" type="text" v-model="entry.title" readonly>
                  <br>
                  <strong>{{guiMessages.selected.collection.collDesc}}:</strong>
                  <input class="collection-input" type="text" v-model="entry.description" readonly>
                  <br><br>
                  <strong>{{guiMessages.selected.collection.collAnnot}}:</strong>
                  <input class="collection-input" type="text" v-model="entry.annotationStyle" readonly>
                  <br>
                  <strong>{{guiMessages.selected.collection.collAssi}}:</strong>
                  <input class="collection-input" type="text" v-model="entry.assignedTo" readonly>
                  <br>
                  <strong>{{guiMessages.selected.collection.collUpda}}:</strong>
                  <input class="collection-input" type="text" v-model="entry.lastUpdate" readonly>
                  <br>
                  <strong>{{guiMessages.selected.collection.collStatus}}:</strong>
                  <input class="collection-input" type="text" v-model="entry.status" readonly>
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
              <button v-if="role == 'admin'" class="modal-big-button" @click="save()">
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

Vue.component('collection-creation-modal', {
   data () {
      return {
         entry : {
            _id:"",
            title:"",
            description:"",
            assignedTo:"",
            annotationStyle:"",
            document:"",
         },
         guiMessages,
         update: {},
         userList: [],
         allUsers: [],
         checkedUsers: [],
         showSelector: false,
         role:''
      }
   },

   mounted () {
      this.get_all_users();
      this.role = mainApp.role;
   },

   methods: {

      get_all_users() {
         backend.get_all_users()
            .then( (response) => {
                  console.log();
                  this.allUsers = response;
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
            backend.get_all_db_entries_ids()
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
            _id:this.entry._id,
            title:this.entry.title, 
            description:this.entry.description,
            annotationStyle:this.entry.annotationStyle,
            assignedTo:this.entry.assignedTo,
            status:"0%",
         }
         for (element in params) {
            if (params[element] == undefined)
                  params[element] = ""
         }
         if ((params._id == "") || (params._id == undefined)) {
               params._id = "Collection"+Math.floor(Math.random() * 10001);
         }
         doc = this.entry.document.trim();
         backend.update_collection_async(params._id, params, doc)
               .then( (response) => {
                  console.log();
                  console.log("Database: Dialogue Collection updated");
                  databaseEventBus.$emit('collections_changed');
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
                        <input type="checkbox" class="user-checkbox" v-bind:id="name._id" :value="name._id" v-model="checkedUsers">
                           <div class="entry-info in-selector with-top-border">
                              <label :for="name._id"> 
                                 <strong>ID:</strong> {{name._id}} 
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
                  <input class="collection-input" type="text" v-model="entry._id" :placeholder="guiMessages.selected.coll_creation[0]">
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
                  <select class="modal-select" v-model="entry.assignedTo">
                     <option disabled value="">{{guiMessages.selected.coll_creation[4]}}</option>
                     <option v-for="user in allUsers" v-bind:value="user._id">{{user._id}}</option>
                  </select>
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
              <button class="modal-big-button" @click="add_from_view">
                {{guiMessages.selected.collection.importCollfromView}}
              </button>
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
              <button class="modal-big-button" @click="add_from_user()">
                {{guiMessages.selected.collection.importCollfromUser}}
              </button>
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