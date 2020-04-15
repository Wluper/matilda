Vue.component("login-view", {

    data() {
        return {
            guiMessages,
            loginName: ''
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
        start : function(){
            console.log("==================================");
            console.log("==================================");
            console.log("==================================");
            annotationAppEventBus.$emit("go_back", event);
        },
        login() {
            this.loginName = document.getElementById("login_input").value;
            if (this.loginName.length < 1) {
                console.log("EMPTY USERNAME FIELD")
                alert('Insert a username')
                return;
            } else {
                console.log('---- CHECKING USERNAME ----');
                backend.login(this.loginName)
                    .then( (response) => {
                        if (response.data.status == "success") {
                            console.log("Username is valid");
                            this.updateUsername(this.loginName);
                        } else {
                            (response.data.status == "fail")
                            alert("User doesn't exist")
                        }
                });

            }
        },
        updateUsername(nuovoNome) {
            console.log(nuovoNome);
            backend.put_name("USER_"+nuovoNome+".json")
            .then( (response) => {
                if (response) {
                    console.log("Name Changed");
                } else {
                    alert('Server error, name not changed.');
                }
            this.start();
            this.setCookie(nuovoNome);
            })
        },
        setCookie(nuovoNome) {
            console.log("Log in name set in cookies");
            localStorage.setItem("remember", nuovoNome);
        }
    },
    template:
    `
        <div id="login-view">
            <div class="login_block">
                <h1>{{guiMessages.selected.login.welcome}}</h1>
                <div class="login_form">
                    <input id="login_input" class="login_input" type="text" name="login_username" v-bind:value="loginName">
                    <button type="button" @click="login()" class="login_button">{{guiMessages.selected.login.send}}</button>
                </div>
            </div>
        </div>
    `
});