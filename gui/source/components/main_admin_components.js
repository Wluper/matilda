/************************************
* All Dialgoues View "aka MAIN LIDA VIEW"
*************************************/



Vue.component("main-admin", {

  props: [
      "alreadyVisited"
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
          showAnnotatorNamesForIds: []
      }
  },

  mounted () {
      this.getAllDialogueIdsFromServer();
  },

  methods: {

    handleDragOver(event) {
        event.stopPropagation();
        event.preventDefault();
        let elem = document.getElementById('listedDialoguesContainer');
        elem.style.transition = '0.3s'
        elem.style.backgroundColor = '#c2c6c4';
        event.dataTransfer.effectAllowed = 'copyMove';
        event.dataTransfer.dropEffect = 'copy';
        this.dragging = true;
    },

    handleDragOut(event) {
        event.preventDefault();
        let elem = document.getElementById('listedDialoguesContainer');
        elem.style.backgroundColor = 'inherit';
        this.dragging = false;
    },

    handleDrop(event) {
        event.preventDefault();
        let elem = document.getElementById('listedDialoguesContainer');
        elem.style.backgroundColor = 'inherit';
        this.dragging = false;
        let file     = event.dataTransfer.files[0]
        this.handle_file(file);
    },

    getAllDialogueIdsFromServer() {

      backend.get_all_dialogue_ids_async()
          .then( (response) => {

              this.allDialogueMetadata = response;

          });

    },

    dialogue_already_visited(id) {
        return this.alreadyVisited.includes(id)
    },

    clicked_dialogue(clickedDialogue) {
        allDialoguesEventBus.$emit("dialogue_clicked", clickedDialogue)
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

        backend.post_empty_dialogue()
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
                backend.post_new_dialogue_from_json_string_async(text, file.name)
                    .then( (response) => {

                        if ('error' in response.data) {
                            alert(`JSON file \"${file.name}\" is not in the correct format. Error from the server: ${response.data.error}`)
                        } else {
                            this.getAllDialogueIdsFromServer();
                        }

                    });
            };

            reader.readAsText(file);

        } else {

            alert('Only .json files are supported.')

        }
    },

    download_all_dialogues_from_server(event) {
        backend.get_all_dialogues_async()
            .then( (response) => {
                let blob = new Blob([JSON.stringify(response, null, 4)], {type: 'application/json'});
                const url = window.URL.createObjectURL(blob)
                const link = document.createElement('a')
                link.href = url
                link.setAttribute('download', 'dialogues.json')
                document.body.appendChild(link)
                link.click();
            });
    }

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
        <h2 v-if="!(dragging)" class="all-dialogues-list-title">
            {{ allDialogueMetadata.length }} Data Items, {{ alreadyVisited.length }} Visited:
        </h2>

        <h2 v-else class="all-dialogues-list-title">
            Drop Files Anywhere to Upload!
        </h2>

        <div class="help-button-container">
            <button class="help-button btn btn-sm" @click="download_all_dialogues_from_server()">Download All Data</button>
            <button class="help-button btn btn-sm btn-primary" @click="showAgreement = true">Inter-annotator Agreement</button>

        </div>
    </div>
    
    <div class="inner-wrap">
    <ul class="dialogue-list">

      <li class="listed-dialogue"
          v-for="(dat, index) in allDialogueMetadata"
          v-bind:id="index">

          <div class="dialogue-list-single-item-container">

            <div class="dialouge-info">

                <div class="dialogue-id" v-on:click="clicked_dialogue(dat[0])">
                    {{dat[0]}}
                </div>

                <div class="filler-space" v-on:click="clicked_dialogue(dat[0])">
                </div>

                <div v-if="dialogue_already_visited(dat[0])"
                     class="visited-indicator"
                     v-on:click="clicked_dialogue(dat[0])">
                     Visited
                </div>

                <div v-if="show_annotators(dat[0])"
                     class="dialogue-num-turns"
                     v-on:click="toggle_show_annotators(dat[0])">
                    Annotators: {{ dat[1] }}
                </div>

                <div v-else
                     class="dialogue-num-turns"
                     v-on:click="toggle_show_annotators(dat[0])">
                    Annotators: {{ dat[1].length }}
                </div>

            </div>

          </div>

      </li>

    </ul>
     <ul class="btn-set">
      <li><input type="file"
                   id="fileInput"
                   name="fileInput"
                   accept=".txt, .json"
                   v-on:change="open_file($event)">

            <label for="fileInput"
                   id="fileInputLabel"
                   class="btn btn-sm">
                   Upload File or Drag and Drop
            </label></li>
    </ul>
    </div>

    
   

  </div>
  `

});
