Vue.component("login-view", {

    data() {
        return {
            guiMessages,
            insertedName: 'username',
            insertedPass: 'password',
            role: 'user'
        }
    },

    mounted() {
        //detects if admin page
        let title = document.getElementsByTagName("title")[0].textContent;
        if (title != " LIDA ") {
            this.role = "admin";
            this.insertedName = this.role;
        }
    },

    beforeDestroyed() {
        console.log("==================================");
        console.log("I am being destroyed");
    },
    // METHODS
    methods:{
        init : function(){
            //
        },
        login() {
            this.insertedName = document.getElementById("login_input").value;
            this.insertedPass = document.getElementById("password_input").value;
            if (this.insertedName.length < 1) {
                console.log("EMPTY USERNAME FIELD")
                alert('Insert a username')
                return
            } else {
                this.check_credentials()
            }
        },
        check_credentials() {
            console.log('---- CHECKING USERNAME ----');
            if (this.check_if_first_start(this.insertedName, this.insertedPass)) {
                console.log("Default combination")
                if (this.role != "admin") {
                    allDialoguesEventBus.$emit("update_username", "admin", this.insertedPass);
                } else { 
                    annotationAppEventBus.$emit("go_back");
                }
                return;
            }
            backend.login(this.insertedName,this.insertedPass)
                .then( (response) => {
                    if (response.data.status == "success") {
                        console.log("Username and password is valid");
                        if (this.role != "admin")
                            allDialoguesEventBus.$emit("update_username", this.insertedName, this.insertedPass);
                        else
                            annotationAppEventBus.$emit("go_back");
                    } else {
                        alert(guiMessages.selected.login.fail)
                    }
                }
            );
        },
        check_if_first_start(name,pass) {
            if ((this.role == "admin") && (DEFAULT_ADMIN_PASSWORD != undefined)) {
                if (DEFAULT_ADMIN_PASSWORD == pass)
                    return true;

            } else if (DEFAULT_USER_COMBINATION.active == true) {
                if ((name == DEFAULT_USER_COMBINATION.username) && (pass == DEFAULT_USER_COMBINATION.password))
                    return true
                
            } else {
                return false
            }
        }
    },
    template:
    `
        <div id="login-view">
            <div class="login_block">
                <img src="assets/images/lida_favicon.png" class="login_logo"> <h1> 2.0</h1>
                <div class="login_form">
                    <input v-if="role != 'admin'" id="login_input" class="login_input" type="text" name="login_username" v-bind:value="insertedName" onclick="this.value= null; this.onclick = null">
                    <input v-if="role == 'admin'" id="login_input" class="admin_input" type="text" name="login_username" v-bind:value="insertedName" placeholder="admin" value="admin" readonly>
                    <input id="password_input" class="password_input" type="password" name="login_password" v-bind:value="insertedPass" onclick="this.value= null; this.onclick = null" v-on:keyup.enter="login()">
                    <button type="button" @click="login()" class="login_button">{{guiMessages.selected.login.send}}</button>
                </div>
            </div>
        </div>
    `
});