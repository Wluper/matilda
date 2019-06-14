// This is the main view

var mainApp = new Vue({
  el: '#main-app',

  data() {
    return {
      status: 'list-all',
      displayingDialogue: '',
      alreadyVisited: [],
      splittingFile: '',
      splittingTextSourceFile: '',
    }
  },

  methods: {

    load_in_dialogue_to_annotate: function (event) {
        this.displayingDialogue = event;
        this.status = 'annotating';
        if (!this.alreadyVisited.includes(event)) {
            this.alreadyVisited.push(event)
        }
    },

    clear_annotation: function (event) {
        this.displayingDialogue = '';
        this.status = 'list-all';
    },

    clear_text_split: function (event) {

        this.splittingTextSourceFile = '';
        this.splittingText = '';
        this.status = 'list-all'

    },

    remove_dialogue_from_visited_list(id) {
        for (idx in this.alreadyVisited) {
            if (this.alreadyVisited[idx] == id) {

                this.alreadyVisited.splice(idx, 1)
                break

            }
        }
    },

    change_dialogue_name: function (event) {
        console.log('---- CHANGING DIALOGUE NAME ----');
        console.log(event);
        utils.change_dialogue_name_async(this.displayingDialogue, event.target.value)
            .then( (response) => {

                if (response) {
                    this.displayingDialogue = event.target.value;
                } else {
                    alert('Server error, name not changed.')
                }

            })
    },

    handle_loaded_text_file: function (event) {
        console.log('---- HANDLING LOADED TEXT FILE ----');
        console.log(event);
        this.status = 'splitting-text-file';
        this.splittingFile = event;
        this.splittingTextSourceFile = event.name;
    },

  },

  template:
  ```
    <annotation-app v-if="status === 'annotating'"
                    v-bind:dialogueId="displayingDialogue"
                    v-on:go_back="clear_annotation($event)"
                    v-on:dialogue_id_change="change_dialogue_name($event)">
    </annotation-app>

    <text-splitter v-else-if="status === 'splitting-text-file'"
                   v-bind:file="splittingFile"
                   v-bind:sourceFname="splittingTextSourceFile"
                   v-on:cancel="clear_text_split($event)"
                   v-on:splitting_complete="clear_text_split($event)">
    </text-splitter>

    <all-dialogues v-else
                   v-on:dialogue_selected="load_in_dialogue_to_annotate($event)"
                   v-on:dialogue_deleted="remove_dialogue_from_visited_list($event)"
                   v-on:loaded_text_file="handle_loaded_text_file($event)"
                   v-bind:alreadyVisited="alreadyVisited">
    </all-dialogues>
  ```


})
