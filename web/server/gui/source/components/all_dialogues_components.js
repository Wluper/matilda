/************************************
* All Dialgoues View "aka MAIN LIDA VIEW"
*************************************/

Vue.component("all-dialogues", {

   props: [
      "alreadyVisited", "collectionRate"
   ],

   data () {
      return {
         allDialogueMetadata: [],
         showModal: false,
         // Reference to the language item
         guiMessages,
         userName: mainApp.userName,
         activeCollection: mainApp.activeCollection
      }
   },
  created() {
      allDialoguesEventBus.$on( "refresh_dialogue_list", this.getAllDialogueIdsFromServer )
  },
  mounted () {
      this.init();
  },

  methods: {

      init : function(){
         // Step ONE: Get FILE NAME
         this.getAllDialogueIdsFromServer();
      },

      getAllDialogueIdsFromServer() {
         backend.get_all_dialogue_ids_async()
            .then( (response) => {
               this.allDialogueMetadata = response;
               console.log(response);
               this.collectionAnnotationRate();
               if ((mainApp.restored == false) && (response.length == 0)) {
                  //if new session then recover from database
                  this.restore_session_from_database();
               }
               mainApp.restored = true;
         });
      },

      collectionAnnotationRate() {
          let summatory = 0; 
          total_turns = 0;
          for (i=0; i < this.allDialogueMetadata.length; i++) {
              total_turns += Number(this.allDialogueMetadata[i]["num_turns"]-1);
              summatory += Number(this.allDialogueMetadata[i]["status"].slice(0,-1) * this.allDialogueMetadata[i]["num_turns"]-1)
          }
          mainApp.collectionRate = Number( summatory / total_turns).toFixed(1);
          if ((mainApp.collectionRate <= 0) || (mainApp.collectionRate == NaN)) {
            mainApp.collectionRate = 0;
          } else if (mainApp.collectionRate >= 99) {
            mainApp.collectionRate = 100;
          }
          mainApp.collectionRate = mainApp.collectionRate+"%";
          if (mainApp.collectionRate == "NaN%") {
              mainApp.collectionRate = "0%";
              mainApp.collectionRate = "0%"
          }
          //backend.update_collection_fields(mainApp.activeCollection,{"status":mainApp.collectionRate}, false);
      },

      dialogue_already_visited(id) {
         return this.alreadyVisited.includes(id)
      },

      clicked_dialogue(clickedDialogue) {
         //if collection is freezed dialogues can't be opened
         if (!mainApp.done)
            allDialoguesEventBus.$emit("dialogue_selected", this.allDialogueMetadata[clickedDialogue].id)
         else
            allDialoguesEventBus.$emit("show_message", guiMessages.selected.collection.freezed )
      }, 

      restore_session_from_database: function () {
         console.log("Ready to restore from database");
         const mainContainer = document.getElementById("mainContainer");
         mainContainer.style.cursor = "progress";
         if (this.activeCollection != undefined) {
            var doc = this.activeCollection;
         } else {
            return
         }
         backend.recover_dialogues(doc)
            .then( (response) => {
               console.log(response);
               allDialoguesEventBus.$emit("refresh_dialogue_list");
               mainContainer.style.cursor = null;
         });
      },

      handle_file_name_change : function(event){
         console.log('---- CHANGING FILE NAME ----');
         console.log(event);

         // for some reason needs manual updating...
         mainApp.userName = event.target.value;

         backend.put_name("USER_"+event.target.value+".json")
            .then( (response) => {

               if (response) {
                    console.log("Name Changed");
               } else {
                    alert('Server error, name not changed.')
               }

         })
      },

      download_all_dialogues_from_server(event) {
         backend.get_all_dialogues_async()
            .then( (response) => {
               let blob = new Blob([JSON.stringify(response, null, 4)], {type: 'application/json'});
               const url = window.URL.createObjectURL(blob)
               const link = document.createElement('a')
               link.href = url
               fileName = "USER_" + mainApp.userName + "_"+utils.create_date()+".json"
               link.setAttribute('download', fileName )
               document.body.appendChild(link)
               link.click();
         });
      },

      clicked_collections_button() {
         databaseEventBus.$emit("assignments_selected");
      },
  },

  template:

  `
  <div class="all-dialogues-container"
       id="listedDialoguesContainer">
    
     <div class="dialogue-list-title-container">

          <div class="all-dialogues-list-title">
              <h2>
                  <span>{{activeCollection}}:</span> {{ allDialogueMetadata.length }} {{ guiMessages.selected.admin.dataItems }}, {{collectionRate}} {{guiMessages.selected.lida.annotated}}
              </h2>
          </div>

          <user-bar v-bind:userName="userName"></user-bar>

          <div class="help-button-container">
              <button class="help-button btn btn-sm" @click="showModal = true">{{ guiMessages.selected.lida.button_fileFormatInfo }}</button>
              <button class="help-button btn btn-sm btn-primary" @click="download_all_dialogues_from_server()">{{ guiMessages.selected.admin.button_downloadAll }}</button>
              <button class="help-button btn btn-sm" @click="clicked_collections_button()">{{guiMessages.selected.annotation_app.backToAll}}</button> 
          </div>
      </div>

    <div class="inner-wrap">

      <modal v-if="showModal" @close="showModal = false"></modal>

      <ul class="dialogue-list">

        <li class="listed-dialogue"
            v-for="(dat, index) in allDialogueMetadata"
            v-bind:id="index">

            <div class="dialogue-list-single-item-container">

                <div v-if="dialogue_already_visited(dat.id)"
                       class="visited-indicator">
                       {{ guiMessages.selected.admin.visited }}
                </div>
                <div v-else
                       class="visited-indicator not-visited">
                       {{ guiMessages.selected.admin.notVisited }}
                </div>

              <div class="dialouge-info" v-on:click="clicked_dialogue(index)">
                  <div class="dialogue-id">
                    {{dat.id}}
                  </div>

                  <div class="dialogue-num-turns" >{{dat.num_turns-1}} {{ guiMessages.selected.lida.turns }}</div>

                  <div class="dialogue-annotated">
                    <span>Annotation: {{dat.status}}</span>
                    <div class="annotated-bar">
                        <div class="annotated-fill" v-bind:style="{ width: dat.status }"></div>
                    </div>
                  </div>
              </div>
            </div>

        </li>

      </ul>
      <!--
      <ul class="btn-set">
        <li><button class="add-dialogue-button btn btn-sm" v-on:click="create_new_dialogue()">{{ guiMessages.selected.lida.button_newDialogue }}</button></li>
        <li><button class="add-dialogue-button btn btn-sm" v-on:click="clean_dialogues()">{{ guiMessages.selected.lida.button_wipeDialogues }}</button></li>
        <li>
          
              <input type="file"
                     id="fileInput"
                     name="fileInput"
                     accept=".txt, .json"
                     v-on:change="open_file($event)">

              <label for="fileInput"
                     id="fileInputLabel"
                     class="btn btn-sm">
                     {{ guiMessages.selected.admin.button_upload}}
              </label>
        </li>
      </ul>
      -->
      

  
      
    </div>
  </div>
  `

});
