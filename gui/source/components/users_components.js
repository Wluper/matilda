Vue.component("users-view", {

    data() {
        return {
            changesSaved: "",
            allUsers:[],
            guiMessages,
        }
    },

    mounted () {
        this.init()
    },
    created (){
        //
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

        user_create() {
            let newUser = document.getElementById("create_username").value;
            let newPassword = document.getElementById("create_password").value;
            let newMail = document.getElementById("create_email").value;
            if ((newPassword == '') || (newUser == '')) {
                alert("A username and a password are required")
                return;
            }
            if (newMail == '')
                newMail = "email not provided";
            backend.create_user(newUser,newPassword,newMail) 
                .then( (response) => {
                    console.log();
                    this.get_all_users();
                })
        },

        clicked_entry(clickedEntry) {
            console.log(event.target.id)
            let name = clickedEntry;
            console.log(name) 
        },

        show_password(event) {
            event.target.setAttribute("type","text");
            event.target.setAttribute("onclick","javascript:this.setAttribute('type','password'); this.onclick = null")
        },

        delete_entry(event) {
            let name = event.target.parentNode.parentNode.id;
            backend.del_db_entry_async(name,"users")
                .then( (response) => {
                    console.log(response);
                    if (response.data.status == "success") {
                        this.init();
                    } else {
                        return
                    }
            });
        }
    },
    template:
    `
        <div id="users-page">
           <div class="users-list-title-container">
                <h2 class="all-dialogues-list-title">{{guiMessages.selected.admin.userButton}}</h2>

                <div class="config-container">
                    <div class="inner-form">
                        <label for="create_username">Username:</label>
                        <input id="create_username" type="text">

                        <label for="create_password">Password:</label>
                        <input id="create_password" type="text">

                        <label for="create_email">Email:</label>
                        <input id="create_email" type="text">

                        <button id="create_user" v-on:click="user_create()" class="button btn btn-sm">{{guiMessages.selected.admin.createButton}}</button>
                    </div>
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
                                    <input v-on:click="show_password($event)" id="user_password" type="password" :value="name.password">
                                </div>

                                <div class="user-email">
                                    {{name.email}}
                                </div>
                            </div>

                            <div class=del-dialogue-button v-on:click="delete_entry($event)">
                                {{guiMessages.selected.lida.button_delete}}
                            </div>
                                
                        </div>
                    </li>
                </ul>
            </div>
        </div>
    `
});