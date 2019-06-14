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

  template: '#main-app-template'

})
