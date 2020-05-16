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

/*************************************
* MODAL COMPONENT
*************************************/
Vue.component('database-entry-modal', {
   data () {
         return {
            entry : {},
            guiMessages,
            view: '',
            update: {}
         }
   },

   mounted () {
      this.init();
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
            });

         },

         import_doc(doc, conversion) {
            if (conversion != undefined) {
               doc = JSON.stringify(JSON.parse(doc));
               backend.post_new_dialogue_from_json_string_async(doc, this.entry._id)
            }
            if (confirm(guiMessages.selected.database.confirmImport)) {
               backend.post_new_dialogues_from_string_lists_async(doc)
                  .then( (response) => {
                     console.log();
                     console.log("Import Success");
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
            backend.update_collection_async(this.entry._id, JSON.stringify(params))
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
        <div v-if="view == 'database-view'" class="modal-container">
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
              <button class="modal-big-button" @click="import_doc(entry.annotations)">
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
              <button class="modal-big-button" @click="import_doc(entry.document, true)">
                {{guiMessages.selected.collection.importColl}}
              </button>
              <button class="modal-big-button" @click="save()">
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
      }
   },

   mounted () {
      this.init();
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
         backend.update_collection_async(params._id, JSON.stringify(params))
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
                  <strong>{{guiMessages.selected.collection.addToColl}}</strong>
                  <br><br>
                  <template v-for="name in userList">
                     <input type="checkbox" v-bind:id="name._id" :value="name._id" v-model="checkedUsers">
                     <label :for="name._id"> <strong>ID:</strong> {{name._id}} <strong>Last updated:</strong> {{name.lastUpdate}} </label>
                     <br>
                  </template>
                  <button class="modal-big-button" @click="add_from_user(true)">{{guiMessages.selected.collection.add}}</button>
               </slot>
            </div>
            <hr>
          <div class="modal-footer">
            <slot name="footer">
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
                  <input class="collection-input" type="text" v-model="entry._id" placeholder="Insert an unique id for the collection or LIDA will generate one">
                  <br>
                  <strong>{{guiMessages.selected.collection.collTitle}}:</strong>
                  <input class="collection-input" type="text" v-model="entry.title" placeholder="Insert a title">
                  <br>
                  <strong>{{guiMessages.selected.collection.collDesc}}:</strong>
                  <input class="collection-input" type="text" v-model="entry.description" placeholder="Insert a short description of the content">
                  <br><br>
                  <strong>{{guiMessages.selected.collection.collAnnot}}:</strong>
                  <input class="collection-input" type="text" v-model="entry.annotationStyle" placeholder="You can save the used annotation model">
                  <br>
                  <strong>{{guiMessages.selected.collection.collAssi}}:</strong>
                  <input class="collection-input" type="text" v-model="entry.assignedTo" placeholder="You can assign this dialogues to an user, they will be loaded at their next login">
                  <br>
                  <strong>Status:</strong>
                  <input class="collection-input" type="text" v-model="entry.status" placeholder="You can note down here the progress of the annotation work">
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
})