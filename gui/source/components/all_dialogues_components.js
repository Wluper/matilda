/************************************
* All Dialgoues View "aka MAIN LIDA VIEW"
*************************************/



Vue.component("all-dialogues", {

  props: [
      "alreadyVisited"
  ],

  data () {
      return {
          allDialogueMetadata: [],
          dragging: false,
          showModal: false,
          userName : ''
      }
  },
  // computed : {
  //     userName : function(){
  //         console.log("computing un");
  //         var restOfName = this.name.split(".json")[0]
  //         var userName = restOfName.split("USER_")[1]
  //         return userName
  //     }
  // },

  mounted () {
      this.init();
  },

  methods: {

        init : function(){

            // Step ONE: Get FILE NAME
            backend.get_name()
                .then( (response) => {
                    console.log();
                    var restOfName = response.split(".json")[0]
                    var userName = restOfName.split("USER_")[1]
                    this.userName = userName;

                });

            this.getAllDialogueIdsFromServer();

        },
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
        allDialoguesEventBus.$emit("dialogue_selected", this.allDialogueMetadata[clickedDialogue].id)
    },

    create_new_dialogue(event) {

        backend.post_empty_dialogue()
            .then( (newDialogueId) => {

                this.allDialogueMetadata.push({id: newDialogueId, num_turns: 0});

            });
    },

    delete_dialogue(event) {

        if (confirm("Are you sure you want to permanently delete this dialogue? This cannot be undone!")) {

            console.log('-------- DELETING --------')
            console.log()
            idToDelete = event.target.parentNode.parentNode.id;
            nameToDelete = this.allDialogueMetadata[idToDelete].id
            backend.del_single_dialogue_async(nameToDelete)
                .then( () => {
                    this.getAllDialogueIdsFromServer();
                });

            allDialoguesEventBus.$emit('dialogue_deleted', nameToDelete);

        } else {

            return

        }

    },

    open_file(event){
        let file = event.target.files[0];
        this.handle_file(file);
    },

    handle_file(file) {
        let textType = /text.plain/;
        let jsonType = /application.json/;

        if (file.type.match(textType)) {

            allDialoguesEventBus.$emit('loaded_text_file', file);

        } else if (file.type.match(jsonType)) {

            console.log('---- HANDLING LOADED JSON FILE ----');
            let reader = new FileReader();
            reader.onload = (event) => {
                console.log('THE READER VALUE', reader)
                console.log('THE EVENT VALUE', event)
                text = reader.result
                backend.post_new_dialogue_from_json_string_async(text)
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

            alert('Only .txt or .json files are supported.')

        }
    },

    handle_file_name_change : function(event){
        console.log('---- CHANGING FILE NAME ----');
        console.log(event);

        // for some reason needs manual updating...
        this.userName = event.target.value;

        backend.put_name("USER_"+event.target.value+".json")
            .then( (response) => {

                if (response) {
                    console.log("Name Changed");
                } else {
                    alert('Server error, name not changed.')
                }

            })
    },

    //
    // toggleFileEdit: function() {
    //
    //     let inputSection = document.getElementById('fileName')
    //     let titleSpan    = document.getElementById('fileNameInput')
    //
    //     if (this.editingTitle) {
    //         this.editingTitle          = false;
    //         inputSection.style.display = 'none';
    //         titleSpan.style.display    = 'inherit';
    //     } else {
    //         this.editingTitle          = true;
    //         inputSection.style.display = 'inherit';
    //         inputSection.focus();
    //         titleSpan.style.display    = 'none';
    //     }
    //
    // },

    download_all_dialogues_from_server(event) {
        backend.get_all_dialogues_async()
            .then( (response) => {
                let blob = new Blob([JSON.stringify(response, null, 4)], {type: 'application/json'});
                const url = window.URL.createObjectURL(blob)
                const link = document.createElement('a')
                link.href = url
                fileName = "USER_" + this.userName + ".json"
                link.setAttribute('download', fileName )
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
    
    
     <div class="dialogue-list-title-container">

          <div class="all-dialogues-list-title">
              <h2 v-if="!(dragging)" >
                  {{ allDialogueMetadata.length }} Data Items, {{ alreadyVisited.length }} Visited
              </h2>

              <h2 v-else>
                  Drop Files Anywhere to Upload!
              </h2>
          </div>

          <div class="file-name-container">
            <div class="inner">
              <span> USER_ </span>
              <input id="fileNameInput"
                      type="text"
                     v-bind:value="userName"
                     v-on:input="handle_file_name_change($event)">
              </input>
              <span> .json </span>
            </div>
          </div>

          <div class="help-button-container">
              <button class="help-button btn btn-sm" @click="showModal = true">File Format Info</button>
              <button class="help-button btn btn-sm btn-primary" @click="download_all_dialogues_from_server()">Download All Data</button>
              
          </div>
      </div>

    <div class="inner-wrap">

      <modal v-if="showModal" @close="showModal = false"></modal>

      

      <ul class="dialogue-list">

        <li class="listed-dialogue"
            v-for="(dat, index) in allDialogueMetadata"
            v-bind:id="index">

            <div class="dialogue-list-single-item-container">

              <div class="del-dialogue-button" v-on:click="delete_dialogue($event)">
                Delete
              </div>


              <div class="dialouge-info" v-on:click="clicked_dialogue(index)">
                  <div class="dialogue-id">
                    {{dat.id}}
                  </div>

                  <div v-if="dialogue_already_visited(dat.id)"
                       class="visited-indicator">
                       Visited
                  </div>

                  <div class="dialogue-num-turns" >{{dat.num_turns}} Turns</div>
              </div>

            </div>

        </li>

      </ul>
      
      <ul class="btn-set">
        <li><button class="add-dialogue-button btn btn-sm" v-on:click="create_new_dialogue()">Add a New Dialogue</button></li>
        <li>
          
              <input type="file"
                     id="fileInput"
                     name="fileInput"
                     accept=".txt, .json"
                     v-on:change="open_file($event)">

              <label for="fileInput"
                     id="fileInputLabel"
                     class="btn btn-sm">
                     Upload File or Drag and Drop
              </label>
        </li>
      </ul>
      

  
      
    </div>
  </div>
  `

});
