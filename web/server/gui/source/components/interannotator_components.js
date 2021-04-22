/************************************
* All Collections View "aka MAIN INTERANNOTATOR VIEW"
*************************************/

Vue.component("interannotator-view", {

  props: [
      "displayingCollection", "alreadyVisited", "userName"
  ],

  data () {
      return {

          /*
              `allDialogueMetadata` will always be a list of tuples of the form:

                  List[Tuple[str, List[str]]]

              Where the first item of each tuple is the name of the dialogue and the second item is a list
              of the different dialogue files on the backend which contain that dialogue ID.
          */
          allCollectionsMetadata: [],
          allConfrontMetadata:[],
          dragging: false,
          showAgreement: false,
          selectedCollection: this.displayingCollection,

          // A list of dialogue IDs for which annotator names should be displayed
          showAnnotatorNamesForIds: [],

          //Reference to the language data
          guiMessages,

      }
  },

  mounted () {
      this.getAllCollectionIdsFromServer();
  },

  methods: {        

    go_back : function(){
        console.log("==================================");
        console.log("==================================");
        console.log("==================================");
        adminEventBus.$emit("go_back", event);
    },

    clicked_collection_button() {
        adminEventBus.$emit("collection_clicked");
    },

    getAllCollectionIdsFromServer() {
        backend.get_collections_ids_async("dialogues_collections")
            .then( (response) => {
                this.allCollectionsMetadata = response;
                this.count_errors();
        });
    },

    count_errors() {
        for (i=0; i < this.allCollectionsMetadata.length-1; i++) {
            var count = 0;
            var resolved = 0;
            if (this.allCollectionsMetadata[i]["errors"]["errorsMeta"] != undefined) {
                for (dialogue in this.allCollectionsMetadata[i]["errors"]["errorsMeta"]) {
                    for (error in this.allCollectionsMetadata[i]["errors"]["errorsMeta"][dialogue]) {
                        count += 1;
                        if (this.allCollectionsMetadata[i]["errors"]["errorsMeta"][dialogue][error]["accepted"]) {
                            resolved += 1;
                        }
                    }
                }
            }
            this.allCollectionsMetadata[i]["errors"]["found"] = count; 
            this.allCollectionsMetadata[i]["errors"]["resolved"] = resolved;  
        }
        console.log("Error count",this.allCollectionsMetadata);
    },

    dialogue_already_visited(id) {
        return this.alreadyVisited.includes(id)
    },

    clicked_collection(clickedCollection) {
        //load in interannotator all the annotated versions of the same collection
        document.body.style.cursor = "progress";
        backend.del_all_dialogues_async("admin")
            .then( (response) => {
                console.log(response);
                backend.admin_import_for_interannotation(clickedCollection)
                    .then( (response) => {
                        console.log("===== LOADING ANNOTATED COLLECTIONS FOR",clickedCollection," =====");
                        console.log(response);
                        document.body.style.cursor = null;
                        if (response.data.status == "fail") {
                            alert(guiMessages.selected.admin.importConflictsResult);
                            return;
                        } else {
                          adminEventBus.$emit("conflicts_on_collection", clickedCollection);
                        }
                    }
                );
            }
        );
    },

    toggle_show_annotators(dialogueName){

        if (this.show_annotators(dialogueName)) {
            index = this.showAnnotatorNamesForIds.indexOf(dialogueName)
            this.showAnnotatorNamesForIds.splice(index, 1)
        } else {
            this.showAnnotatorNamesForIds.push(dialogueName)
        }

    },

    show_annotators(dialogueName){

        return this.showAnnotatorNamesForIds.includes(dialogueName)

    },

  },
  template:
  `
  <div class="all-dialogues-container" id="listedDialoguesContainer">

    <agreement-modal v-if="showAgreement" @close="showAgreement = false">
    </agreement-modal>

    <div class="dialogue-list-title-container">
        <div class="all-dialogues-list-title">
          <h2>{{guiMessages.selected.admin.title}}: {{ allCollectionsMetadata.length }} {{ guiMessages.selected.admin.dataItems }}, {{ alreadyVisited.length }} {{ guiMessages.selected.admin.visited }}
          </h2>
        </div>

        <user-bar v-bind:userName="userName"></user-bar>

        <div class="help-button-container">
            <button v-on:click="go_back($event)" class="back-button btn btn-sm">{{guiMessages.selected.annotation_app.backToAll}}</button>
        </div>
    </div>
    
    <div class="inner-wrap">
    <h2 class="list-title">{{guiMessages.selected.lida.buttonCollections}}</h2>
    <ul class="dialogue-list">

      <li class="listed-dialogue"
          v-for="(name) in allCollectionsMetadata">

          <div class="int-coll-list-single-item-container">

            <div class="int-coll-info">

                <div class="int-coll-id" v-on:click="clicked_collection(name.id)">
                    {{name.id}}
                </div>

                <div class="errors-space" v-on:click="clicked_collection(name.id)">
                    Errors: <span v-if="name.errors.found > 0" class="gold-true">{{name.errors.resolved}}/{{name.errors.found}}</span>
                          <span v-else class="gold-false">0</span>
                </div>

                <div class="gold-space" v-on:click="clicked_collection(name.id)">
                    Gold: <span v-if="name.gold == true" class="gold-true">{{name.gold}}</span>
                          <span v-else>{{name.gold}}</span>
                </div>

                <template v-if="name.assignedTo.length == 1">
                    <div class="int-coll-num-turns" style="padding-right:10px;">
                        {{ guiMessages.selected.admin.assignedTo }}: {{ name.assignedTo[0] }}
                    </div>
                </template>

                <template v-else>
                    <div v-if="show_annotators(name.id)"
                         class="int-coll-num-turns-clicked"
                         v-on:click="toggle_show_annotators(name.id)">
                        {{ guiMessages.selected.admin.to }}: {{ name.assignedTo.join(", ") }}
                    </div>

                    <div v-else
                         class="int-coll-num-turns"
                         v-on:click="toggle_show_annotators(name.id)">
                        {{ guiMessages.selected.admin.assignedTo }}: {{ name.assignedTo.length }}
                    </div>
                </template>

            </div>

          </div>

      </li>

    </ul>
    </div>
  </div>
  `

});

/************************************
* Interannotator Dialogues-level View
*************************************/

Vue.component("interannotator-app", {

  props: [
      "alreadyVisited", "userName", "displayingCollection"
  ],

  data () {
      return {

          /*
              `allDialogueMetadata` will always be a list of tuples of the form:

                  List[Tuple[str, List[str]]]

              Where the first item of each tuple is the name of the dialogue and the second item is a list
              of the different dialogue files on the backend which contain that dialogue ID.
          */
          allDialogueMetadata: [],
          dragging: false,
          showAgreement: false,

          // A list of dialogue IDs for which annotator names should be displayed
          showAnnotatorNamesForIds: [],
          // dialogues to be marked
          dialoguesWithErrors: [],
          //Reference to the language data
          guiMessages,
      }
  },

  mounted: function() {
      this.init();
  },

  created: function() {
      adminEventBus.$on("conflicts_on_dialogue", this.fill_list);
      //backend.get_collection_errors_async(this.displayingCollection);
  },

  methods: { 

    init: function() {
        this.getAllDialogueIdsFromServer();
    },    

    go_back : function(){
        console.log("==================================");
        adminEventBus.$emit("conflicts_clicked");
    },

    clicked_users_button() {
        adminEventBus.$emit("usersManagement_clicked");
    },
    clicked_collection_button() {
        adminEventBus.$emit("collection_clicked");
    },

    getAllDialogueIdsFromServer() {
        backend.get_all_dialogue_ids_async("admin")
          .then( (response) => {
              console.log(response);
              this.allDialogueMetadata = response;
              backend.get_collection_errors_async(this.displayingCollection)
                .then( (response) => {
                    console.log(response);
                    this.get_dialogues_with_errors(response);
                    //this.errorList = response.errors
                    //this.metaDataList = response.meta;
              });
        });
    },

    get_dialogues_with_errors(errors) {
        for (dialogue in errors["errors"]) {
            if (errors["errors"][dialogue].length != 0) {
                this.dialoguesWithErrors.push({dialogue});
                document.getElementById(dialogue).setAttribute("class","int-listed-dialogue relevant");
                document.getElementById(dialogue+"_count").textContent = "Errors: "+errors["errors"][dialogue].length;
            }
        }
        console.log("Errors found in",this.dialoguesWithErrors);
    },

    fill_list(id) {
        if (!this.dialoguesWithErrors.includes(id)) {
            this.dialoguesWithErrors.push(id);
        }
        console.log(this.dialoguesWithErrors);
    },

    dialogue_already_visited(id) {
        return this.alreadyVisited.includes(id)
    },

    clicked_dialogue(clickedDialogue) {
        adminEventBus.$emit("dialogue_clicked", clickedDialogue)
    },

    toggle_show_annotators(dialogueName){

        if (this.show_annotators(dialogueName)) {
            index = this.showAnnotatorNamesForIds.indexOf(dialogueName)
            this.showAnnotatorNamesForIds.splice(index, 1)
        } else {
            this.showAnnotatorNamesForIds.push(dialogueName)
        }

    },

    show_annotators(dialogueName){

        return this.showAnnotatorNamesForIds.includes(dialogueName)

    },

    create_new_dialogue(event) {

        backend.admin_post_empty_dialogue()
            .then( (newDialogueId) => {

                this.allDialogueMetadata.push({id: newDialogueId, num_turns: 0});

            });
    },

    open_file(event){
        let file = event.target.files[0];
        this.handle_file(file);
    },

    handle_file(file) {
        let jsonType = /application.json/;

        if (file.type.match(jsonType)) {

            console.log('---- HANDLING LOADED JSON FILE ----');
            let reader = new FileReader();
            reader.onload = (event) => {
                console.log('THE READER VALUE', reader)
                console.log('THE EVENT VALUE', event)
                text = reader.result
                backend.admin_import_for_interannotation(this.displayingCollection, text)
                    .then( (response) => {
                        if (response.data["error"] != undefined) {
                            alert(`JSON file \"${file.name}\" is not in the correct format. Error from the server: ${response.data.error}`)
                        } else {
                            backend.get_collection_errors_async(this.displayingCollection)
                            .then( (response) => {
                                console.log(response);
                                this.get_dialogues_with_errors(response);
                                //this.errorList = response.errors
                                //this.metaDataList = response.meta;
                          });
                        }

                    });
            };

            reader.readAsText(file);

        } else {

            alert('Only .json files are supported.')

        }
    },

    download_all_dialogues_from_server(event) {
        backend.get_specific_collections("annotated_collections",{"id":this.displayingCollection},{"id":1,"document":1,"annotator":1})
            .then( (response) => {
                let blob = new Blob([JSON.stringify(response, null, 4)], {type: 'application/json'});
                const url = window.URL.createObjectURL(blob)
                const link = document.createElement('a')
                link.href = url
                link.setAttribute('download', 'dialogues.json')
                document.body.appendChild(link)
                link.click();
            }
        );
    },

    wipe_cache() {
        if (confirm(guiMessages.selected.resolution_app.buttonWipeCache)) {
            backend.update_collection_async(this.displayingCollection, "dialogues_collections", {"errors":{}})
                .then( (response) => {
                    console.log(response);
                    adminEventBus.$emit("conflicts_clicked");
                }
            );
        }
    },

    download_gold() {
        backend.get_db_entry_async(this.displayingCollection,"dialogues_collections")
            .then( (response) => {
                let blob = new Blob([JSON.stringify(response[0]["gold"], null, 4)], {type: 'application/json'});
                const url = window.URL.createObjectURL(blob)
                const link = document.createElement('a')
                link.href = url
                link.setAttribute('download', 'gold_'+this.displayingCollection+'.json')
                document.body.appendChild(link)
                link.click();
            }
        );
    },

  },
  template:
  `
  <div class="all-dialogues-container" id="listedDialoguesContainer">

    <agreement-modal v-if="showAgreement" @close="showAgreement = false"></agreement-modal>

        <div class="dialogue-list-title-container" style="grid-template: [row1-start] 'title-zone name-zone help-button-zone' [row1-end] / 1.1fr 2fr 1.4fr;">
        <div class="all-dialogues-list-title">
          <h2><span id="displaying-collection">{{displayingCollection}}</span>: {{ alreadyVisited.length }}/{{ allDialogueMetadata.length }} {{ guiMessages.selected.admin.visited_dialogues }}
          </h2>
        </div>

        <user-bar v-bind:userName="userName"></user-bar>

        <div class="help-button-container">
            <button class="help-button btn btn-sm" @click="download_all_dialogues_from_server()">{{ guiMessages.selected.admin.button_downloadAll }}</button>
            <button class="help-button btn btn-sm btn-primary" @click="showAgreement = true">{{ guiMessages.selected.admin.button_interAgreement }}</button>
            <button v-on:click="go_back($event)" class="back-button btn btn-sm">{{guiMessages.selected.admin.backToColl}}</button>
        </div>
    </div>
    
    <div class="inner-wrap">
        <h2 class="list-title">{{guiMessages.selected.admin.dataItems}}</h2>
        <button class="btn btn-sm button-title" @click="wipe_cache()">{{ guiMessages.selected.admin.button_wipeCache}}</button>
        <button class="help-button btn btn-sm button-title" style="margin-right:5px;" @click="download_gold()">{{ guiMessages.selected.admin.button_downloadGold}}</button>
        <!--
        <input type="file"
            id="fileInput"
            name="fileInput"
            accept=".txt, .json"
        v-on:change="open_file($event)">
        <label for="fileInput"
            id="fileInputLabel"
            class="btn btn-sm button-title">
            {{ guiMessages.selected.admin.button_upload }}
        </label>
        -->
    <ul class="dialogue-list">

      <li class="int-listed-dialogue"
          v-for="(dat, index) in allDialogueMetadata"
          v-bind:id="dat[0]"
          v-bind:key="dat[0]">

          <div class="int-el dialogue-list-single-item-container">

            <div class="int-info dialouge-info">

                <div class="int-dialogue-id" v-on:click="clicked_dialogue(dat[0])">
                    {{dat[0]}}
                </div>

                <div class="error-count-space" v-bind:id="dat[0]+'_count'" v-on:click="clicked_dialogue(dat[0])">
                </div>

                <div v-if="dialogue_already_visited(dat[0])"
                     class="int-visited-indicator"
                     v-on:click="clicked_dialogue(dat[0])">
                     {{ guiMessages.selected.admin.visited }}
                </div>

                <template v-if="dat[1].length == 1">
                  <div class="dialogue-num-turns">
                      {{ guiMessages.selected.admin.actualAnnotators }}: {{ dat[1][0] }}
                  </div>
                </template>

                <template v-else>
                  <div v-if="show_annotators(dat[0])"
                       class="dialogue-num-turns"
                       v-on:click="toggle_show_annotators(dat[0])">
                      {{ guiMessages.selected.admin.actualAnnotators }}: {{ dat[1].join(", ") }}
                  </div>

                  <div v-else
                       class="dialogue-num-turns"
                       v-on:click="toggle_show_annotators(dat[0])">
                      {{ guiMessages.selected.admin.actualAnnotators }}: {{ dat[1].length }}
                  </div>
                </template>

            </div>

          </div>

      </li>

    </ul>
    </div>
  </div>
  `

});
