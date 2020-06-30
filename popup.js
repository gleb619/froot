(function () {

    var root = this;
    var app = {
        settings: {
            last_good_enable: false,
            most_popular_enable: false,
            begin_button: "wait"
        }
    };

    // Use in node or in browser
    if (typeof exports !== 'undefined') {
        module.exports = app;
    } else {
        root.app = app;
    }

    /*------------------------------------------------------------*/

    function init() {
        document.addEventListener("DOMContentLoaded", function () {
            registerClickListener();
            loadSettings();
        });
    }

    function loadSettings() {
        chrome.storage.local.get('froot_settings', function (result) {
            if (isNotDefined(result) || isNotDefined(result.froot_settings)) return;
            var timer = setTimeout(function () {
                Object.keys(result.froot_settings).forEach(function (key) {
                    app.settings[key] = result.froot_settings[key];
                });

                Object.keys(app.settings).forEach(function (id) {
                    writeValue(id, app.settings[id]);
                });

                clearTimeout(timer);
                timer = null;
            }, 20);
        });
    }

    function paramChanged(id, value) {
        app.settings[id] = value;
        chrome.storage.local.set({'froot_settings': app.settings});
    }

    function writeValue(id, value) {
        var element = document.getElementById(id);
        if (element != null) {
            if (element.type == "checkbox") {
                return element.checked = value;
            } else if (element.type == "button") {
                return element.className += " " + value;
            } else {
                return element.value = value;
            }
        }

        element = null;
    }

    function isNotDefined(object) {
        return ((typeof object == 'undefined') || object == null);
    }

    function registerClickListener() {
        var beginButton = document.getElementById("begin_button");

        if (beginButton != null) {
            beginButton.addEventListener("click", function () {
                beginButton.className = beginButton.className == "wait" ? "work" : "wait";
                paramChanged("begin_button", beginButton.className);

                if (typeof chrome == 'undefined' || typeof chrome.tabs == 'undefined') return;

                chrome.tabs.query({active: true, currentWindow: true}, function (tabs) {
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

    function log(message) {
        var log = document.getElementById("log");
        log.innerHTML += '<p>' + message + '</p>'
        log = null;
    }

    /*------------------------------------------------------------*/

    init();

}());
