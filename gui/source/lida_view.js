/*******************************************************************************
* IMPORT STATEMENTS
*******************************************************************************/




/*******************************************************************************
* MAIN VIEW
*******************************************************************************/

var mainApp = new Vue({
  el: '#main-app',

  data() {
    return {
      status: 'logging',
      displayingDialogue: '',
      displayingDocument: '',
      alreadyVisited: [],
      splittingFile: '',
      splittingTextSourceFile: '',
      logged:'false',
      restored:'false',
      userName:'',
      role: 'user',
      activeCollection:'',
      collectionRate:'',
    }
  },

  created () {
      // Annotation APP EVENTS
      annotationAppEventBus.$on("go_back", this.clear_annotation );
      annotationAppEventBus.$on("dialogue_id_change", this.change_dialogue_name );

      // Split View EVENTS
      textSplitterEventBus.$on("cancel", this.clear_text_split)
      textSplitterEventBus.$on("splitting_complete", this.clear_text_split)

      // All Dialogue (MAIN VIEW) Event Bus
      allDialoguesEventBus.$on( "dialogue_selected", this.load_in_dialogue_to_annotate )
      allDialoguesEventBus.$on( "dialogue_deleted", this.remove_dialogue_from_visited_list )
      allDialoguesEventBus.$on( "loaded_text_file", this.handle_loaded_text_file )
      allDialoguesEventBus.$on( "update_username", this.update_username )

      //Database View Event Bus
      databaseEventBus.$on( "document_selected", this.load_document_view )
      databaseEventBus.$on( "collections_selected", this.load_collections_view )
      databaseEventBus.$on( "collection_active", this.set_active_collection )

      //Check if already logged, restore session
      this.check_login_cookie();
      this.check_collection_cookie();
  },

  methods: {

    update_username: function(event,event2) {
        let newName = event;
        let pass = event2;
        backend.put_name(newName)
            .then( (response) => {
                if (response) {
                    console.log("File name updated");
                    this.set_cookie(newName,pass);
                    this.status = "list-all";
                    //wait for 10 seconds then start cyclic-backups
                    setTimeout(this.cyclic_backup, 10000);
                } else {
                    alert('Server error, name not changed.');
                }
        })
    },    

    set_cookie: function(name,pass) {
        if (name != "1") {
            console.log("Log in name set in cookies");
            localStorage.setItem("remember", name);
            localStorage.setItem("password", pass);
        }
    },

    check_collection_cookie: function() {
      if (localStorage["collection"] == undefined) {
        return;
      } else {
        this.activeCollection = localStorage["collection"];
      }
    },

    check_login_cookie: function() {
        if (this.logged == "true")
            return;
        if (localStorage["remember"] != undefined) {
            let memorizedName = localStorage["remember"];
            let memorizedPass = localStorage["password"];
            backend.login(memorizedName,memorizedPass)
                .then( (response) => {
                    if (response.data.status == "success") {
                        console.log("Username still valid");
                        this.update_username(memorizedName);
                    } else {
                        (response.data.status == "fail")
                        this.status = "logging";
                    }
                }
            );          
        }
        this.userName = localStorage["remember"];
        this.logged = "true";
    },

    load_in_dialogue_to_annotate: function (event) {
        this.displayingDialogue = event;
        this.status = 'annotating';
        if (!this.alreadyVisited.includes(event)) {
            this.alreadyVisited.push(event)
        }
    },

    set_active_collection: function (event) {
        console.log(event);
        localStorage["collection"] = event;
        this.activeCollection = localStorage["collection"];
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
        backend.change_dialogue_name_async(this.displayingDialogue, event.target.value)
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

    load_document_view: function (event) {
        this.displayingDocument = event;
    },

    load_collections_view: function (event) {
        this.status = 'collection-view';
    },

    cyclic_backup: function() {
        /*
        user backup every two minutes
        if windows is active and dialogue list not empty
        */
        console.log("======= CYCLIC BACKUP ======")
        if (!document.hidden) {
            backend.update_db(mainApp.collectionRate, true)
            .then( (response) => {
                console.log(utils.create_date());
                if (response.status == "success") {
                    console.log(guiMessages.selected.lida.backupDone);
                } else if (response.status == "empty") {
                    console.log(guiMessages.selected.lida.backupPost);
                } else {
                    console.log(guiMessages.selected.lida.backupFailed);
                }
                console.log(guiMessages.selected.lida.backupNext);
            })
        }
        var nextBackup = setTimeout( this.cyclic_backup, 120000 )
    }

},

  template:
  `

    <login-view v-if="status === 'logging'">
    </login-view>

    <annotation-app v-else-if="status === 'annotating'"
                    v-bind:dialogueId="displayingDialogue">
    </annotation-app>

    <text-splitter v-else-if="status === 'splitting-text-file'"
                   v-bind:file="splittingFile"
                   v-bind:sourceFname="splittingTextSourceFile">
    </text-splitter>

    <collection-view v-else-if="status === 'collection-view'">
    </collection-view>

    <all-dialogues v-else
                   v-bind:alreadyVisited="alreadyVisited"
                   v-bind:activeCollection="activeCollection"
                   v-bind:userName="userName">
    </all-dialogues>
  `


})
