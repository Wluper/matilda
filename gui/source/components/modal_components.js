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
            view: ''
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

         import_doc(annotations) {
            if (confirm(guiMessages.selected.database.confirmImport)) {
               backend.post_new_dialogues_from_string_lists_async(annotations)
                  .then( (response) => {
                     console.log();
                     console.log("Import Success");
               });
            }
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
               {{guiMessages.selected.modal_document[0]}} Database
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
              <button class="modal-import-button" @click="import_doc(entry.annotations)">
                {{guiMessages.selected.database.importDoc}}
              </button>
              <button class="modal-default-button" @click="$emit('close')">
                OK
              </button>
            </slot>
          </div>

         </div>


         <div v-else-if="view == 'collection-view'" class="modal-container">
            <div class="modal-header">
               <slot name="header">
                  {{guiMessages.selected.modal_document[0]}} Database
               </slot>
            </div>
            <hr>
            <div class="modal-body">
              <slot name="body">
                  <strong>ID:</strong>
                  <input type="text" v-bind:value="entry._id">
                  <br>
                  <strong>Title:</strong>
                  <input type="text" v-bind:value="entry.title">
                  <br>
                  <strong>Description:</strong>
                  <input type="text" v-bind:value="entry.description">
                  <br><br>
                  <strong>Annotation style:</strong>
                  <input type="text" v-bind:value="entry.annotationStyle">
                  <br>
                  <strong>Assigned to:</strong>
                  <input type="text" v-bind:value="entry.assignedTo">
                  <br>
                  <strong>Last Update:</strong>
                  <input type="text" v-bind:value="entry.lastUpdate">
                  <br>
                  <strong>Status:</strong>
                  <input type="text" v-bind:value="entry.status">
                  <br><br>
                  <strong>
                  Document
                  </strong>
                  <br>
                  <pre>
                  {{entry.document}}
                  </pre>
              </slot>
          </div>
          <hr>
          <div class="modal-footer">
            <slot name="footer">
              <button class="modal-import-button" @click="import_doc(entry.document)">
                {{guiMessages.selected.database.importDoc}}
              </button>
              <button class="modal-save-button" @click="save()">
                {{guiMessages.selected.annotation_app.save}}
              </button>
              <button class="modal-default-button" @click="$emit('close')">
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
