Vue.component("users-view", {

    props: ["userName"],

    data() {
        return {
            changesSaved: "",
            allUsers:[],
            guiMessages,
            showCreation: false,
            activeUser:"",
        }
    },

    mounted () {
        this.init()
    },
    created (){
        adminEventBus.$on("users_updated", this.get_all_users );
        adminEventBus.$on("clean_active_user", this.clean_active_user );
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
            adminEventBus.$emit("go_back", event);
        },

        get_all_users() {
            backend.get_all_users()
                .then( (response) => {
                    console.log();
                    this.allUsers = response;
                    console.log(this.allUsers);
            });
        },

        clean_active_user() {
            this.activeUser = "";
        },

        clicked_user(name) {
          for (index in this.allUsers) {
            if (this.allUsers[index]["userName"] == name)
              this.activeUser = this.allUsers[index];
          }
          this.showCreation = true;
        },

        delete_user(event) {
            event.stopPropagation(); 
            if (confirm(guiMessages.selected.admin.deleteConfirm)) {
                let name = event.target.parentNode.parentNode.id;
                if (name == 'admin') {
                    alert(guiMessages.selected.admin.cantDeleteAdmin)
                    return
                }
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
                <button v-on:click="go_back($event)" class="back-button btn btn-sm btn-primary">{{guiMessages.selected.annotation_app.backToAll}}</button>
          </div>
        </div>
            <div class="inner-wrap">
                <div style="padding-bottom:10px;">
                    <button id="open_user_creation" v-on:click="showCreation = true" class="help-button btn btn-sm btn-primary">{{guiMessages.selected.admin.createUserButton}}</button>
                </div>
                <ul class="user-list">
                    <li class="listed-user" v-for="name in allUsers" v-bind:id="name.userName">

                        <div class="user-list-single-item-container">

                            <div class="user-info">

                                <div class="user-id">
                                    <span class="user-span">Username</span> {{name.userName}}
                                </div>

                                <div class="user-password">
                                    <span class="user-span">Password</span>
                                    <input type="password" :value="name.password" autocomplete="off" readonly>
                                </div>

                                <div class="user-email" v-if="name.email == ''">email not provided</div>
                                <div class="user-email long-mail" v-else-if="name.email.length > 27">{{name.email}}</div>
                                <div class="user-email" v-else>{{name.email}}</div>

                                <div class="user-role">
                                   <span class="user-span">Role</span>
                                   <span class="user-admin" v-if="name.role == 'administrator'">ADMN</span> 
                                   <span class="user-annt" v-else>ANNT</span> 
                                </div>
                            </div>

                            <div class="edit-dialogue-button" v-on:click="clicked_user(name.userName)">
                                {{guiMessages.selected.admin.editButton}}
                            </div>

                            <div class="del-dialogue-button" v-on:click="delete_user($event)">
                                {{guiMessages.selected.lida.button_delete}}
                            </div>
                        </div>
                    </li>
                </ul>
                <div>
                    <span v-if="changesSaved == 'true'" class="is-saved">{{guiMessages.selected.database.saved}}</span>
                </div>
                <users-creation-modal v-if="showCreation" @close="showCreation = false" v-bind:activeUser="activeUser"></users-creation-modal>
            </div>
        </div>
    </div>
    `
});

Vue.component('users-creation-modal', {

    props: ["activeUser"],

    data() { 
        return {
            guiMessages
        }
    },

    mounted () {
        this.init()
    },
    methods:{
        init : function(){
            if (this.activeUser != "") {
                console.log(this.activeUser);
                this.get_active_user(this.activeUser);
            }
        },

        get_active_user: function(user) {
          if (this.activeUser.userName != "") {
            document.getElementById("create_username").setAttribute("readonly",true);

          }
          document.getElementById("create_username").value = this.activeUser.userName;
          document.getElementById("create_password").value = this.activeUser.password;
          document.getElementById("select_role").value = this.activeUser.role;
          if (this.activeUser.mail != undefined)
            document.getElementById("create_email").value = this.activeUser.mail;
        },

        gather_parameters() {
            let newUser = document.getElementById("create_username").value;
            let newPassword = document.getElementById("create_password").value;
            let newMail = document.getElementById("create_email").value;
            let newRole = document.getElementById("select_role").value;
            if ((newPassword == '') || (newUser == '') || (newRole == '')) {
                alert(guiMessages.selected.login.warning);
                return;
            }
            if (newUser == 'admin') {
                //not allowed to downgrade default admin account
                newRole = "administrator";
            }
            if (newMail == undefined)
                newMail = "";

            var userParameters = { 
                "id":newUser,
                "userName":newUser,
                "password":newPassword, 
                "role":newRole, 
                "email":newMail
            }

            return userParameters;
        },

        user_create: function() {
            let userDetails =  this.gather_parameters();
            backend.create_user(userDetails) 
                .then( (response) => {
                    console.log(response.data);
                    if (response.data.status != "error") {
                        this.close();
                    } else {
                        var overwrite = confirm(guiMessages.selected.admin.confirmOverwriteUser);
                        if (overwrite == true) {
                            backend.create_user(userDetails,true)
                                .then( (response) => { this.close() });
                        }
                    }
                }
            );
        },

        user_update: function() {
            backend.create_user(this.gather_parameters(),true)
                .then( (response) => { 
                    this.close() 
                }
            );
        },

        show_password(event) {
            event.target.setAttribute("type","text");
            //event.target.setAttribute("onclick","javascript:this.setAttribute('type','password'); this.onclick = null")
        }, 

        close: function() {
            adminEventBus.$emit("clean_active_user");
            adminEventBus.$emit("users_updated");
            this.$emit('close');
        } 
    },  
    template:
`
  <transition name="modal">
    <div class="modal-mask">
      <div class="modal-wrapper">
        <div class="modal-container modal-user-creation">

          <div class="modal-header">
            <slot name="header">
              <strong>{{guiMessages.selected.admin.userCreation}}</strong>
            </slot>
          </div>

          <hr>

          <div class="modal-body">
            <slot name="body">
                <div class="inner-form">
                    <label for="create_username">Username:</label>
                    <input v-if="activeUser != ''" class="user-creation" id="create_username" type="text" readonly>
                    <input v-else class="user-creation" id="create_username" type="text">
                    <br>
                    <label for="create_password">Password:</label>
                    <input class="user-creation" id="create_password" type="password" v-on:click="show_password($event)">
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
                    
                    <button v-if="activeUser != ''" id="create_user" v-on:click="user_update()" class="button btn btn-sm">{{guiMessages.selected.annotation_app.save}}</button>
                    
                    <button v-else id="create_user" v-on:click="user_create()" class="button btn btn-sm">{{guiMessages.selected.admin.createButton}}</button>
                </div>
            </slot>
          </div>

          <hr>

          <div class="modal-footer">
            <slot name="footer">
              LIDA
              <button class="modal-default-button" @click="close()">
                {{guiMessages.selected.annotation_app.close}}
              </button>
            </slot>
          </div>
        </div>
      </div>
    </div>
  </transition>
  `
});

