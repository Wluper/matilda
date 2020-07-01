/************************************
* All Dialgoues View "aka MAIN ADMIN LIDA VIEW"
*************************************/

Vue.component("interannotator-view", {

  props: [
      "alreadyVisited", "userName"
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

          });

    },

    dialogue_already_visited(id) {
        return this.alreadyVisited.includes(id)
    },

    clicked_collection(clickedCollection) {
        //load in interannotator all the annotated versions of the same collection
        mainContainer.style.cursor = "progress";
        backend.del_all_dialogues_async("admin")
            .then( (response) => {
                console.log(response);
                backend.admin_import_all_annotations(clickedCollection)
                    .then( (response) => {
                        console.log("===== LOADING ANNOTATED COLLECTIONS FOR",clickedCollection," =====");
                        console.log(response);
                        mainContainer.style.cursor = null;
                        if (response.data.status == "fail") {
                            alert(guiMessages.selected.admin.importConflictsResult);
                            return;
                        } else {
                          adminEventBus.$emit("conflicts_on_collection", clickedCollection);
                        }
            });
        });
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
  <div class="all-dialogues-container"
       id="listedDialoguesContainer"
       v-on:dragover="handleDragOver($event)"
       v-on:dragleave="handleDragOut($event)"
       v-on:drop="handleDrop($event)">

    <agreement-modal v-if="showAgreement" @close="showAgreement = false"></agreement-modal>

    <div class="dialogue-list-title-container">
        <div v-if="!(dragging)" class="all-dialogues-list-title">
          <h2>{{guiMessages.selected.admin.title}}: {{ allCollectionsMetadata.length }} {{ guiMessages.selected.admin.dataItems }}, {{ alreadyVisited.length }} {{ guiMessages.selected.admin.visited }}
          </h2>
        </div>

        <div v-else class="all-dialogues-list-title">
            <h2>{{guiMessages.selected.lida.drop}}</h2>
        </div>

        <user-bar v-bind:userName="userName"></user-bar>

        <div class="help-button-container">
            <button v-on:click="go_back($event)" class="back-button btn btn-sm">{{guiMessages.selected.annotation_app.backToAll}}</button>
        </div>
    </div>
    
    <div class="inner-wrap">
    <ul class="dialogue-list">

      <li class="listed-dialogue"
          v-for="(name) in allCollectionsMetadata">

          <div class="int-coll-list-single-item-container">

            <div class="int-coll-info">

                <div class="int-coll-id" v-on:click="clicked_collection(name.id)">
                    {{name.id}}
                </div>

                <div class="gold-space" v-on:click="clicked_collection(name.id)">
                    Gold: <span v-if="name.gold == true" class="gold-true">{{name.gold}}</span>
                          <span v-else>{{name.gold}}</span>
                </div>

                <div v-if="show_annotators(name.id)"
                     class="int-coll-num-turns-clicked"
                     v-on:click="toggle_show_annotators(name.id)">
                    {{ guiMessages.selected.admin.annotators }}: {{ name.assignedTo }}
                </div>

                <div v-else
                     class="int-coll-num-turns"
                     v-on:click="toggle_show_annotators(name.id)">
                    {{ guiMessages.selected.admin.annotators }}: {{ name.assignedTo.length }}
                </div>

            </div>

          </div>

      </li>

    </ul>
    </div>

    
   

  </div>
  `

});
