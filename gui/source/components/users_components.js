Vue.component("users-view", {

    props: ["userName"],

    data() {
        return {
            changesSaved: "",
            allUsers:[],
            guiMessages,
            showCreation: false,
            showUsersHelp: false,
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
    <div class="users-view">
          <div class="all-dialogues-container">

        <div class="dialogue-list-title-container">
            <div class="all-dialogues-list-title">
              <h2>
                {{guiMessages.selected.admin.userButton}}
              </h2>
            </div>

            <user-bar v-bind:userName="userName"></user-bar>

          <div class="help-button-container">
                <button class="help-button btn btn-sm" @click="log_out()">{{ guiMessages.selected.lida.logOut }}</button>
                <button class="help-button btn btn-sm" @click="showUsersHelp = true">{{ guiMessages.selected.database.showHelp }}</button>
                <button v-on:click="go_back($event)" class="back-button btn btn-sm btn-primary">{{guiMessages.selected.annotation_app.backToAll}}</button>
          </div>
        </div>
            <div class="inner-wrap">
                <ul class="user-list">
                    <li class="listed-user" v-for="name in allUsers" v-bind:id="name._id">

                        <div class="user-list-single-item-container">

                            <div class="user-info">

                                <div class="user-id">
                                    <span class="user-span">Username</span> {{name._id}}
                                </div>

                                <div class="user-password">
                                    <span class="user-span">Password</span>
                                    <input v-on:click="show_password($event)" type="password" :value="name.password" autocomplete="off" readonly>
                                </div>

                                <div class="user-email">
                                  <template v-if="name.email == ''">email not provided</template>
                                  <template v-else>{{name.email}}</template>
                                </div>

                                <div class="user-role">
                                   <span class="user-span">Role</span>
                                   <span class="user-admin" v-if="name.role == 'administrator'">ADMN</span> 
                                   <span class="user-annt" v-else>ANNT</span> 
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
                <users-help-modal v-if="showUsersHelp" @close="showUsersHelp = false"></users-help-modal>
            </div>
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
            let newRole = document.getElementById("select_role").value;
            if ((newPassword == '') || (newUser == '') || (newRole == '')) {
                alert(guiMessages.selected.login.warning)
                return;
            }
            if (newMail == undefined)
                newMail = "";
            backend.create_user(newUser,newPassword,newRole,newMail) 
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
                    <br>
                    <label for="select_role">Role:</label>
                    <select class="modal-select" id="select_role">
                        <option disabled value="">Role</option>
                        <option value="annotator">Annotator</option>
                        <option value="administrator">Administrator</option>
                    </select>
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

Vue.component('users-help-modal', {

  data() { 
    return {
      guiMessages,
      role:''
    }
  },

  mounted() {
    this.role = mainApp.role;
  },

  template:
  `
  <transition name="modal">
    <div class="modal-mask">
      <div class="modal-wrapper">
        <div class="modal-container">

          <div class="modal-header">
            <slot name="header">
              <strong>{{guiMessages.selected.modal_collectionInfo[0]}}</strong>
            </slot>
          </div>

          <hr>

          <div class="modal-body">
            <slot name="body">
            {{guiMessages.selected.modal_collectionInfo[1]}}
            <br><br>
            {{guiMessages.selected.modal_collectionInfo[2]}}
            <br><br>
            {{guiMessages.selected.modal_collectionInfo[3]}}
            <br><br>
            {{guiMessages.selected.modal_collectionInfo[4]}}
            {{guiMessages.selected.modal_collectionInfo[5]}}
              <ul>
                <li v-if="role == 'admin'"> 
                  <strong>{{guiMessages.selected.collection.create}}:</strong><br> {{guiMessages.selected.modal_collectionButtons[0]}}
                </li>
                <li> 
                  <strong>{{guiMessages.selected.collection.importColl}}:</strong><br> {{guiMessages.selected.modal_collectionButtons[1]}}
                </li>
                <li> 
                  <strong>{{guiMessages.selected.collection.update}}:</strong><br> {{guiMessages.selected.modal_collectionButtons[2]}}
                </li>
              </ul>
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

