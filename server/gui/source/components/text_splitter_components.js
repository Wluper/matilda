/************************************
* Text Splitting View
*************************************/

Vue.component("text-splitter", {

    props: [
        "file",
        "sourceFname"
    ],

    data() {
      return {
          inputChanged: false,
          text: 'UNINITIALIZED'
      }
    },

    mounted () {

        this.read_text_file(this.file)

    },

    methods: {

        read_text_file: function (file) {
            let reader = new FileReader();
            reader.onload = (event) => {
                console.log('THE READER VALUE', reader)
                console.log('THE EVENT VALUE', event)
                console.log('THE FILE VALUE', file)
                this.text = reader.result
            };

            reader.readAsText(file);
        },

        log_change_occured: function(event) {
            this.inputChanged = true
            this.text = event.target.value
        },

        cancel_splitting: function (event) {

            if (this.inputChanged) {

                if (confirm("You have made changes, going back will delete them. Are you sure you wish to do this?")) {
                    textSplitterEventBus.$emit('cancel')
                }

            } else {

                textSplitterEventBus.$emit('cancel')

            }

        },

        process_into_dialogue: function (event) {

            dialoguesList = this.text.split('===')

            console.log("DIALOGUES LIST:", dialoguesList)

            backend.post_new_dialogues_from_string_lists_async(dialoguesList)
                .then( (response) => {
                    textSplitterEventBus.$emit('splitting_complete')
                });
        }

    },

    template:
    `
        <div class="text-splitter-container">

            <div class="fname-info-container">
                <h2 class="fname-info">Source File: {{ sourceFname }}</h2>
            </div>

            <textarea class="text-editor"
                      v-on:input="log_change_occured($event)"
                      v-bind:value="text">
            </textarea>

            <div class="options-container">

                <h3 class="bold-text">Dialogue Splitter</h3>
                <hr>
                <span class="white-text">

                    In the pane, separate utterances so that there is a clear blank line
                    between each utterance.
                    <br><br>
                    If there are multiple dialogues, separate each one with a triple
                    equals sign - "===" - with a blank line on either side.
                    <br><br>
                    This system assumes that:
                    <ul>
                        <li>There are two participants in the dialogue, the "user" and the "system"</li>
                        <li>The user always asks the first query</li>
                    </ul>

                </span>

            </div>

            <div class="text-buttons-container">
                <button class="text-split-button warning-button"
                        v-on:click="cancel_splitting($event)">
                        Go Back
                </button>
                <button class="text-split-button"
                        v-on:click="process_into_dialogue()">
                        Done
                </button>
            </div>
        </div>
    `

});
