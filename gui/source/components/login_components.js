Vue.component("login-view", {

    data() {
        return {
            guiMessages,
            insertedName: 'username',
            insertedPass: 'password'
        }
    },

    mounted () {
        //
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
                return;
            } else if ((this.insertedName == "user") && (this.insertedPass = "user")){
                //accepted jolly combination
                allDialoguesEventBus.$emit("update_username", "1");
            } else {
                console.log('---- CHECKING USERNAME ----');
                backend.login(this.insertedName,this.insertedPass)
                    .then( (response) => {
                        if (response.data.status == "success") {
                            console.log("Username and password is valid");
                            allDialoguesEventBus.$emit("update_username", this.insertedName);
                        } else {
                            (response.data.status == "fail")
                            alert("User password combination invalid")
                        }
                });
            }
        },
    },
    template:
    `
        <div id="login-view">
            <div class="login_block">
                <h1>{{guiMessages.selected.login.welcome}}</h1>
                <div class="login_form">
                    <input id="login_input" class="login_input" type="text" name="login_username" v-bind:value="insertedName" onclick="this.value= null; this.onclick = null">
                    <input id="password_input" class="password_input" type="password" name="login_password" v-bind:value="insertedPass" onclick="this.value= null; this.onclick = null">
                    <button type="button" @click="login()" class="login_button">{{guiMessages.selected.login.send}}</button>
                </div>
            </div>
        </div>
    `
});