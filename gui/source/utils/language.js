/************************************
* Language Options
*************************************/

const gui_languages = {
  options:["English", "Italian"],
  selectedOption:"English"
}

new Vue({
  el:"#language-selector",
  data:{
    gui_languages
  },
  template: 

  `
  	<div class="language-list-title-container">
  		<label for="droplist_language_selector">Interface Language:</label>
  		<select class="droplist_language_selector">
  			<option v-for="option in gui_languages.options" :value="option">{{ option }}</option>
  		</select>
  	</div>

  `
})