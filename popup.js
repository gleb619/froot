(function() {

	var root = this;
	var app = {};

	// Use in node or in browser
	if (typeof exports !== 'undefined') {
		module.exports = app;
	} else {
		root.app = app;
	}

	/*------------------------------------------------------------*/
	
	function init(){
		document.addEventListener("DOMContentLoaded", function(){
			registerClickListener();
			/*
			registerChangeListner('main_color', 'main_color_text');
			registerChangeListner('header_color', 'header_color_text');
			registerChangeListner('panel_color', 'panel_color_text');
			registerChangeListner('header_font_color', 'header_font_color_text');
			registerChangeListner('panel_font_color', 'panel_font_color_text');
			registerChangeListner('card_color', 'card_color_text');
			registerChangeListner('freesale_card_color', 'freesale_card_color_text');
			*/
			
			//loadSetings();
		});
	}

	function loadInputIds(){
		return [
			'content_width',
			'card_width',
			'slider_enable',
			'footer_enable',
			'fullsize_enable',
			
			'main_color_text',
			'header_color_text',
			'panel_color_text',
			'header_font_color_text',
			'panel_font_color_text',
			
			'circled_image',
			'card_color_text',
			'freesale_card_color_text'
		];
	}
	
	function loadBindedIds(){
		return [{
			origin: 'main_color', 
			binded: 'main_color_text'
		},{
			origin: 'header_color', 
			binded: 'header_color_text',
		},{
			origin: 'panel_color', 
			binded: 'panel_color_text',
		},{
			origin: 'header_font_color', 
			binded: 'header_font_color_text',
		},{
			origin: 'panel_font_color', 
			binded: 'panel_font_color_text',
		},{
			origin: 'card_color', 
			binded: 'card_color_text',
		},{
			origin: 'freesale_card_color', 
			binded: 'freesale_card_color_text',
		}];
	}
	
	function loadSetings(){
		loadSetingsData(function (result) {
			var timer = setTimeout(function() {
				readValueFromObject(loadInputIds(), loadBindedIds(), result.remaster_settings);

				clearTimeout(timer);
				timer = null;
			}, 20);
		});
	}

	function dropSettings(){
		cleanForm();
		chrome.storage.local.clear(function() {
			var error = chrome.runtime.lastError;
			if (error) {
				console.error(error);
			}
		});  
	}
	
	function registerChangeListner(id, bindedId){
		var input = document.getElementById(id);
		var bindedinput = document.getElementById(bindedId);
		
		input.addEventListener('input', function() {
			bindedinput.value = input.value;
		});
	}
		
	function saveSetings(){
		var object = new Object();
		object = readValueToObject(loadInputIds());
		
		saveSetingsData(object);
		changeVisual(object);
		
		contentWidth = null;
		cardWidth= null;
		object = null;
	}
  
	function readValueToObject(ids){
		var object = new Object();
		
		for (var index in ids) {
			object[convertIdToName(ids[index])] = readValue(ids[index]);
		}
		
		return object;
	}
	
	function readValueFromObject(ids, bindedIds, object){
		for (var index in ids) {
			writeValue(ids[index], object[convertIdToName(ids[index])]);
		}
		
		for (index in bindedIds) {
			writeValue(bindedIds[index].origin, object[convertIdToName(bindedIds[index].binded)]);
		}
		
		return object;
	}
		
	function convertIdToName(id){
		var tempArray = id.split('_');
		var output = '';
		for(i = 0; i < tempArray.length; i++) {
			output += capitalize(tempArray[i]);
		}
		
		return uncapitalize(output);
	}
	
	function capitalize(string) {
		return string.charAt(0).toUpperCase() + string.slice(1);
	}
	
	function uncapitalize(string) {
		return string.charAt(0).toLowerCase() + string.slice(1);
	}
		
	function readValue(id){
		var element = document.getElementById(id);
		if(element != null){
			if(element.type == "checkbox"){
				return element.checked;
			}
			else {
				return element.value;
			}
		}
		
		element= null;
		return "";
	}
	
	function writeValue(id, value){
		var element = document.getElementById(id);
		if(element != null){
			if(element.type == "checkbox"){
				return element.checked = value;
			}
			else {
				return element.value = value;
			}
		}
		
		element= null;
	}
		
	function clearValue(id){
		var element = document.getElementById(id);
		if(element != null){
			if(element.type == "checkbox"){
				return element.checked = false;
			}
			else {
				return element.value = '';
			}
		}
		
		element= null;
	}
		
	function changeVisual(object){
	   chrome.tabs.query({ active: true, currentWindow: true }, function(tabs) {
			var tabId = tabs[0].id;
			chrome.tabs.sendMessage(tabId, {
				type: "repaint", 
				data: object
			});
		});
	}

	function loadSetingsData(callback){
		chrome.storage.local.get('remaster_settings', callback);
	}

	function saveSetingsData(settings){
	   chrome.storage.local.set({'remaster_settings': settings});
	}

	function cleanForm(){
		var array = loadInputIds();
		for (var index in array) {
			clearValue(array[index]);
		}
	}

	function registerClickListener(){
		var acceptButton = document.getElementById("acceptButton");
		var dropButton = document.getElementById("dropButton");
		var beginButton = document.getElementById("beginButton");
		
		if(dropButton != null){
			dropButton.addEventListener("click", function(){
				dropSettings();
			}, false);
		}
		
		if(acceptButton != null){
			acceptButton.addEventListener("click", function(){
				saveSetings();
			}, false);
		}
		
		if(beginButton != null){
			beginButton.addEventListener("click", function(){
				beginButton.className = beginButton.className == "wait" ? "work" : "wait";
				
				if(typeof chrome == 'undefined' || typeof chrome.tabs == 'undefined') return;
					
				chrome.tabs.query({ active: true, currentWindow: true }, function(tabs) {
					var tabId = tabs[0].id;
					console.info('prepare to send information into tab=', tabId, "tabs=", tabs[0]);
					chrome.tabs.sendMessage(tabId, {
						type: "begin", 
						data: {
							start: (beginButton.className == "work")
						}
					});
				});
			}, false);
		}
	}
  
  /*------------------------------------------------------------*/
    
	function log(message) {
		var log = document.getElementById("log");
		log.innerHTML += '<p>' + message + '</p>'
		log = null;
	}

/*------------------------------------------------------------*/
      
  init();

}());
