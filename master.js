(function() {

	var root = this;
	var app = {
		/*timers: {
			smallTimer: 1000,
			timer: 7 * 60 * 1000,  // seven minutes
			worker: 1 * 60 * 1000, // one minute
		}*/
		timers: {
			smallTimer: 1000,
			timer: 2 * 60 * 1000,  // seven minutes
			worker: 15 * 1000, // one minute
		},
		debug: true
	};
	
	var selectors = {
		amountOfGoods: '#header > div > nav > ul > li.nav-item:first-child',
		good: '#swiper-hero > div.swiper-wrapper > div > div > div.thumb-details > div.thumb-title > a',
		wantBuyButton: '#__next > div > div > main > section > div.product-info > div > div.product-row > div.product-meta > div.product-controls > button',
		mainPage: 'header > div > figure > a',
		header: '#header'
	};

	// Use in node or in browser
	if (typeof exports !== 'undefined') {
		module.exports = app;
	} else {
		root.app = app;
	}
  
  /*------------------------------------------------------------*/
  
	function init(){
		var timer = setTimeout(function() {
			onMessageReceive();
			onMainLogic();
			
			clearTimeout(timer);
			timer = null;
		}, app.timers.smallTimer);
		console.info('Script initiated');
	}

	/*------------------------------------------------------------*/
	
	function onMainLogic(){
		console.info('On main logic');
		var systemReload = localStorage.getItem("system-reload") == "true";
		var reloadCycle = localStorage.getItem("reload-cycle") || 0;
		if(!!systemReload || app.debug) {
			console.info('Recover listener after reload, cycle =', reloadCycle);
			onWork({ start: true });
		}
		window.localStorage.setItem("system-reload", false);
		
		setInterval(function(){			
			window.localStorage.setItem("system-reload", true);
			if(reloadCycle > 3){
				window.localStorage.setItem("reload-cycle", 0);
				click(selectors.mainPage);
			} 
			
			window.localStorage.setItem("reload-cycle", reloadCycle++);
			location.reload();	
		}, app.timers.timer); 
	}
	
	function onWork(data){
		console.info("On work logic");
		data = data || {};
		if(typeof app.refreshIntervalId != 'undefined') clearInterval(app.refreshIntervalId);
		$(selectors.header).removeClass('work');
		if(!data.start) return;
		
		$(selectors.header).addClass('work');
		
		app.refreshIntervalId = setInterval(function(){			
			var amountOfGoods = parseInt($(selectors.amountOfGoods).text().replace(/[^\d]+/, ""));
			var isDetalization = window.location.toString().indexOf("/product/") > -1;
			var containsButton = $(selectors.wantBuyButton).length > 0;
			var isButtonDisabled = $(selectors.wantBuyButton).hasClass('is-disabled');
			
			if(amountOfGoods > 0 && !isDetalization){
				console.info("Go to goods page");
				click(selectors.good);
			} else if(amountOfGoods > 1 && isDetalization && isButtonDisabled){
				console.info("It's too late, we missed our chance");
				click(selectors.good);
			} else if(amountOfGoods > 0 && isDetalization && containsButton){
				if(isButtonDisabled){
					console.warn("We missed stage 1 and can not participate in the draw");	
				} else {
					console.info("Click main button");
					click(selectors.wantBuyButton);	
				}
			} else if(isDetalization){
				console.info("Return to main page");
				openPage('/');
			} else {
				console.warn("Goods not found");
			}
		}, app.timers.worker); 
	}
  
    function openPage(path){
		window.localStorage.setItem("system-reload", true);
		window.location.href = path;
	}
	
	function click(selector){
		$(selector).click();
		var id = uid();
		$(selector).attr('id', id);
		document.getElementById(id).click();
		$(selector).removeAttr('id');
	}
	
	function uid() {
		var text = "";
		var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

		for (var i = 0; i < 5; i++)
		text += possible.charAt(Math.floor(Math.random() * possible.length));

		return text;
	}
  
	function onMessageReceive(){
		console.info("On message receive");
		chrome.extension.onMessage.addListener(function(request, sender, sendResponse) {
			console.info("Received message from popup, request: ", request);
			switch(request.type) {
				case "begin":
					onWork(request.data);
				break;
			}
			return true;
		});
	}

	function loadSettings(){
		loadSetingsData(function (result) {	
			render(result.remaster_settings);
		});
	}

	function parseTime(text) {
		var now = moment();
		var date = moment(text, 'mm:ss');
	}
	
	function sleep(milliseconds) {
	  var start = new Date().getTime();
	  for (var i = 0; i < 1e7; i++) {
		if ((new Date().getTime() - start) > milliseconds){
		  break;
		}
	  }
	}
	
	function loadSetingsData(callback){
		chrome.storage.local.get('remaster_settings', callback);
	}
  
  /*------------------------------------------------------------*/
  
  init();

}());
