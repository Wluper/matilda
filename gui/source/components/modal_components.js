/*************************************
* MODAL COMPONENT
*************************************/
Vue.component('modal', {
  data() { 
    return {
      guiMessages
    }
  },
  template:
  `
  <transition name="modal">
    <div class="modal-mask">
      <div class="modal-wrapper">
        <div class="modal-container">

          <div class="modal-header">
            <slot name="header">
              {{guiMessages.selected.modal_formatInfo[0]}}
            </slot>
          </div>

          <hr>

          <div class="modal-body">
            <slot name="body">
            {{guiMessages.selected.modal_formatInfo[1]}}
            <br><br>
            {{guiMessages.selected.modal_formatInfo[2]}}
            <br><br>
            {{guiMessages.selected.modal_formatInfo[3]}}
              <ul>
                <li v-for="segment in guiMessages.selected.modal_formatInfo_list" :key="segment">
                  {{ segment }}
                </li>
              </ul>

            </slot>
          </div>

          <hr>

          <div class="modal-footer">
            <slot name="footer">
              LIDA
              <button class="modal-default-button" @click="$emit('close')">
                OK
              </button>
            </slot>
          </div>
        </div>
      </div>
    </div>
  </transition>
  `
})





/*************************************
* MODAL COMPONENT
*************************************/
Vue.component('agreement-modal', {
    data () {
        return {
            scores : {},
            guiMessages,
        }
    },
    mounted () {
        this.init();
    },

    methods: {

          init : function(){

              // Step ONE: Get FILE NAME
              backend.get_scores_async()
                  .then( (response) => {
                      console.log();
                      this.scores = response;

                  });

          },
  },
  template:
  `
  <transition name="modal">
    <div class="modal-mask">
      <div class="modal-wrapper">
        <div class="modal-container">

          <div class="modal-header">
            <slot name="header">
              {{guiMessages.selected.modal_agreementScores[0]}}
            </slot>
          </div>

          <hr>

          <div class="modal-body">
              <slot name="body">
                  {{guiMessages.selected.modal_agreementScores[1]}}
                  <br><br>
                        {{guiMessages.selected.modal_agreementScores[2]}} [query_type, policy_funcs, hotel_belief_state ]
                  <br><br>
                  <strong>
                    {{guiMessages.selected.modal_agreementScores[3]}}
                  </strong>
                  <ul>
                      <li v-for="(item, key, index) in scores">
                        {{key}} : {{item}}
                      </li>
                  </ul>

              </slot>
          </div>

          <hr>

          <div class="modal-footer">
            <slot name="footer">
              LIDA
              <button class="modal-default-button" @click="$emit('close')">
                OK
              </button>
            </slot>
          </div>
        </div>
      </div>
    </div>
  </transition>
  `
})

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
            if (this.view.substr(0,8) == "database") {
               collection = "database";
            } else {
               collection = "dialogues";
            }
            backend.get_db_entry_async(mainApp.displayingDocument,collection)
                  .then( (response) => {
                     console.log();
                     this.entry = response[0];
                     mainContainer.style.cursor = null;
            });

         },

         load_collection(doc) {
            let del = confirm(guiMessages.selected.collection.confirmImport);
            if (del == true) {
               backend.del_all_dialogues_async()
                  .then( (response) => {
                     console.log(response);
                     backend.post_new_dialogue_from_json_string_async(doc, this.entry._id)
                        .then( (response) => {
                           console.log("==== IMPORT SUCCESS ====");
                           console.log();
                           //set global variable with the collection name
                           //send event in all dialogues
                           this.showResult = true;
                           databaseEventBus.$emit( "collection_active", this.entry._id);
                        });
                  });
               }
         },

         import_doc(doc, conversion) {
            if (confirm(guiMessages.selected.database.confirmImport)) {
               backend.del_all_dialogues_async()
                  .then( (response) => {
                     console.log(response);
                     if (conversion != undefined) {
                        doc = JSON.stringify(JSON.parse(doc));
                        backend.post_new_dialogue_from_json_string_async(doc, this.entry._id)
                           .then( (response) => {
                              console.log("==== IMPORT FROM JSON SUCCESS ====");
                              console.log();
                              this.showResult = true;
                        });
                     } else {
                        backend.post_new_dialogues_from_string_lists_async(doc)
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
                  databaseEventBus.$emit('collections changed');
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

        <div v-else-if="view == 'database-view'" class="modal-container">
          <div class="modal-header">
            <slot name="header">
               Database {{guiMessages.selected.modal_document[0]}} 
            </slot>
          </div>
          <hr>
          <div class="modal-body">
              <slot name="body">
                  <strong>ID:</strong> {{entry._id}}
                  <br><br>
                  <strong>{{guiMessages.selected.modal_document[1]}}</strong>
                  <br>
                  {{guiMessages.selected.modal_document[3]}}: {{entry.lastUpdate}}
                  <br><br>
                  <strong>
                    {{guiMessages.selected.modal_document[2]}}
                  </strong>
                  <br>
                  <pre>
                  {{entry.annotations}}
                  </pre>
              </slot>
          </div>
          <hr>
          <div class="modal-footer">
            <slot name="footer">
              <button v-if="role=='admin'" class="modal-big-button" @click="import_doc(entry.annotations)">
                {{guiMessages.selected.database.importDoc}}
              </button>
              <button class="modal-big-button modal-right-button" @click="$emit('close')">
                OK
              </button>
            </slot>
          </div>
         </div>


         <div v-else-if="view == 'collection-view'" class="modal-container">
            <div class="modal-header">
               <slot name="header">
                  Dialogues Collection {{guiMessages.selected.modal_document[0]}}
               </slot>
            </div>
            <hr>
            <div class="modal-body">
              <slot name="body">
                  <strong>ID:</strong>
                  <input class="collection-input" type="text" v-model="entry._id">
                  <br>
                  <strong>{{guiMessages.selected.collection.collTitle}}:</strong>
                  <input class="collection-input" type="text" v-model="entry.title">
                  <br>
                  <strong>{{guiMessages.selected.collection.collDesc}}:</strong>
                  <input class="collection-input" type="text" v-model="entry.description">
                  <br><br>
                  <strong>{{guiMessages.selected.collection.collAnnot}}:</strong>
                  <input class="collection-input" type="text" v-model="entry.annotationStyle">
                  <br>
                  <strong>{{guiMessages.selected.collection.collAssi}}:</strong>
                  <input class="collection-input" type="text" v-model="entry.assignedTo">
                  <br>
                  <strong>{{guiMessages.selected.collection.collUpda}}:</strong>
                  <input class="collection-input" type="text" v-model="entry.lastUpdate">
                  <br>
                  <strong>{{guiMessages.selected.collection.collStatus}}:</strong>
                  <input class="collection-input" type="text" v-model="entry.status">
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
            status:"",
            document:"",
         },
         guiMessages,
         update: {},
         userList: [],
         checkedUsers: [],
         showSelector: false,
         role:''
      }
   },

   mounted () {
      this.init();
      this.role = mainApp.role;
   },

   methods: {

      init : function(){
      
      },

      add_from_view() {
         backend.get_all_dialogues_async()
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
            status:this.entry.status,
            document:"{"+this.entry.document+"}"
         }
         for (element in params) {
            if (params[element] == undefined)
                  params[element] = ""
         }
         if ((params._id == "") || (params._id == undefined)) {
               params._id = "Collection"+Math.floor(Math.random() * 10001);
         }
         params.document = params.document.trim();
         backend.update_collection_async(params._id, params)
               .then( (response) => {
                  console.log();
                  console.log("Database: Dialogue Collection updated");
                  databaseEventBus.$emit('collections changed');
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
                  <input class="collection-input" type="text" v-model="entry.assignedTo" :placeholder="guiMessages.selected.coll_creation[4]">
                  <br>
                  <strong>Status:</strong>
                  <input class="collection-input" type="text" v-model="entry.status" :placeholder="guiMessages.selected.coll_creation[5]">
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

Vue.component('help-database-modal', {
  data() { 
    return {
      guiMessages
    }
  },
  template:
  `
  <transition name="modal">
    <div class="modal-mask">
      <div class="modal-wrapper">
        <div class="modal-container">

          <div class="modal-header">
            <slot name="header">
              <strong>{{guiMessages.selected.modal_databaseInfo[0]}}</strong>
            </slot>
          </div>

          <hr>

          <div class="modal-body">
            <slot name="body">
            {{guiMessages.selected.modal_databaseInfo[1]}}
            <br><br>
            {{guiMessages.selected.modal_databaseInfo[2]}}
            <br><br>
            {{guiMessages.selected.modal_databaseInfo[3]}}
            <br>
              <ul>
                <li> 
                  <strong>{{guiMessages.selected.database.update}}:</strong><br>{{guiMessages.selected.modal_databaseButtons[0]}}
                </li>
                <li> 
                  <strong>{{guiMessages.selected.database.importDb}}:</strong><br>{{guiMessages.selected.modal_databaseButtons[1]}}
                </li>
              </ul>
            </slot>
          </div>

          <hr>

          <div class="modal-footer">
            <slot name="footer">
              LIDA
              <button class="modal-default-button" @click="$emit('close')">
                OK
              </button>
            </slot>
          </div>
        </div>
      </div>
    </div>
  </transition>
  `
})

Vue.component('help-collection-modal', {
  
  data() { 
    return {
      guiMessages,
      role:''
    }
  },

  mounted() {
    this.role = mainApp.role;
  },

  template:
  `
  <transition name="modal">
    <div class="modal-mask">
      <div class="modal-wrapper">
        <div class="modal-container">

          <div class="modal-header">
            <slot name="header">
              <strong>{{guiMessages.selected.modal_collectionInfo[0]}}</strong>
            </slot>
          </div>

          <hr>

          <div class="modal-body">
            <slot name="body">
            {{guiMessages.selected.modal_collectionInfo[1]}}
            <br><br>
            {{guiMessages.selected.modal_collectionInfo[2]}}
            <br><br>
            {{guiMessages.selected.modal_collectionInfo[3]}}
            <br><br>
            {{guiMessages.selected.modal_collectionInfo[4]}}
            {{guiMessages.selected.modal_collectionInfo[5]}}
              <ul>
                <li v-if="role == 'admin'"> 
                  <strong>{{guiMessages.selected.collection.create}}:</strong><br> {{guiMessages.selected.modal_collectionButtons[0]}}
                </li>
                <li> 
                  <strong>{{guiMessages.selected.collection.importColl}}:</strong><br> {{guiMessages.selected.modal_collectionButtons[1]}}
                </li>
                <li> 
                  <strong>{{guiMessages.selected.collection.update}}:</strong><br> {{guiMessages.selected.modal_collectionButtons[2]}}
                </li>
              </ul>
            </slot>
          </div>

          <hr>

          <div class="modal-footer">
            <slot name="footer">
              LIDA
              <button class="modal-default-button" @click="$emit('close')">
                OK
              </button>
            </slot>
          </div>
        </div>
      </div>
    </div>
  </transition>
  `
})