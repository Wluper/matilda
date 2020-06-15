Vue.component("users-view", {

    data() {
        return {
            changesSaved: "",
            allUsers:[],
            guiMessages,
            showCreation: false,
        }
    },

    mounted () {
        this.init()
    },
    created (){
        allDialoguesEventBus.$on( "users_updated", this.get_all_users )
    },

    beforeDestroyed() {
        console.log("==================================");
        console.log("I am being destroyed");
        console.log(this.entryId);
    },
    // METHODS
    methods:{
        init : function(){
            //Get USERS list
            this.get_all_users();
        },
        go_back : function(){
            console.log("==================================");
            console.log("==================================");
            console.log("==================================");
            annotationAppEventBus.$emit("go_back", event);
        },

        get_all_users() {
            backend.get_all_users()
                .then( (response) => {
                    console.log();
                    this.allUsers = response;
                    console.log(this.allUsers);
          });
        },

        show_password(event) {
            event.target.setAttribute("type","text");
            event.target.setAttribute("onclick","javascript:this.setAttribute('type','password'); this.onclick = null")
        },

        delete_user(event) {
            if (confirm(guiMessages.selected.admin.deleteConfirm)) {
                let name = event.target.parentNode.parentNode.id;
                backend.del_db_entry_async(name,"users")
                    .then( (response) => {
                        console.log(response);
                        if (response.data.status == "success") {
                            this.init();
                            this.changesSaved = 'true';
                        } else {
                            return
                        }
                });
            }
        }
    },
    template:
    `
        <div id="users-page">
           <div class="users-list-title-container">
                <h2 class="all-dialogues-list-title">{{guiMessages.selected.admin.userButton}}</h2>

                <div class="config-container">
                </div>

                <div class="help-button-container">
                    <button v-on:click="go_back($event)" class="back-button btn btn-sm">{{guiMessages.selected.annotation_app.backToAll}}</button>
                </div>
            </div>
            <div class="inner-wrap">

                <ul class="user-list">
                    <li class="listed-user" v-for="name in allUsers" v-bind:id="name._id">

                        <div class="user-list-single-item-container">

                            <div class="user-info">

                                <div class="user-id">
                                    <span>Username</span> {{name._id}}
                                </div>

                                <div class="user-password">
                                    <span>Password</span>
                                    <input v-on:click="show_password($event)" type="password" :value="name.password">
                                </div>

                                <div class="user-email" v-if="name.email != 'email not provided'">
                                    {{name.email}}
                                </div>
                            </div>

                            <div class=del-dialogue-button v-on:click="delete_user($event)">
                                {{guiMessages.selected.lida.button_delete}}
                            </div>
                                
                        </div>
                    </li>
                </ul>
                <button id="open_user_creation" v-on:click="showCreation = true" class="help-button btn btn-sm btn-primary">{{guiMessages.selected.admin.createUserButton}}</button>
                <div>
                    <span v-if="changesSaved == 'true'" class="is-saved">{{guiMessages.selected.database.saved}}</span>
                </div>
                <users-creation-modal v-if="showCreation" @close="showCreation = false"></users-creation-modal>
            </div>
        </div>
    `
});

Vue.component('users-creation-modal', {
    data() { 
        return {
            guiMessages
        }
    },
    methods: {
        user_create: function() {
            let newUser = document.getElementById("create_username").value;
            let newPassword = document.getElementById("create_password").value;
            let newMail = document.getElementById("create_email").value;
            if ((newPassword == '') || (newUser == '')) {
                alert(guiMessages.selected.login.warning)
                return;
            }
            if (newMail == '')
                newMail = "email not provided";
            backend.create_user(newUser,newPassword,newMail) 
                .then( (response) => {
                    console.log();
                    this.$emit('close');
                    allDialoguesEventBus.$emit("users_updated");
                })
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
              <strong>Creazione Utente</strong>
            </slot>
          </div>

          <hr>

          <div class="modal-body">
            <slot name="body">
                <div class="inner-form">
                    <label for="create_username">Username:</label>
                    <input class="user-creation" id="create_username" type="text">
                    <br>
                    <label for="create_password">Password:</label>
                    <input class="user-creation" id="create_password" type="text">
                    <br>
                    <label for="create_email">Email:</label>
                    <input class="user-creation" id="create_email" type="text">
                    <br><br>
                    <button id="create_user" v-on:click="user_create()" class="button btn btn-sm">{{guiMessages.selected.admin.createButton}}</button>
                </div>            
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
