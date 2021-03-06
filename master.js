(function () {

    function $$(selector, context) {
        context = context || document;
        var elements = context.querySelectorAll(selector);
        return Array.prototype.slice.call(elements);
    }

    var root = this;
    var app = {
        timers: {
            smallTimer: 1000,
            timer: 5 * 60 * 1000,   // five minutes
            worker: 30 * 1000,      // thirty seconds
        },
        debug: false,
        counter: 0,
        settings: {}
    };

    var selectors = {
        amountOfGoods: '#header > div > nav > ul > li.nav-item:first-child',
        good: '#swiper-hero > div.swiper-wrapper > div > div > div.thumb-details > div.thumb-title > a',
        goodLast: '#swiper-hero > div.swiper-wrapper > div:last-child > div > div.thumb-details > div.thumb-title > a', //take last good
        wantBuyButton: '#__next > div > div > main > section > div.product-info > div > div.product-row > div.product-meta > div.product-controls > button',
        mainPage: 'header > div > figure > a',
        header: '#header',
        statusPane: '#__next > div > div > main > section > div.product-info > div > div.product-row > div.product-meta > div.product-controls > div.status'
    };

    // Use in node or in browser
    if (typeof exports !== 'undefined') {
        module.exports = app;
    } else {
        root.app = app;
    }

    /*------------------------------------------------------------*/

    function init() {
        var timer = setTimeout(function () {
            onMessageReceive();
            onMainLogic();
            chrome.storage.local.get('froot_settings', function (result) {
                app.settings = result.froot_settings || {};
            });

            clearTimeout(timer);
            timer = null;
        }, app.timers.smallTimer);
        console.info('Script initiated');
    }

    /*------------------------------------------------------------*/

    function onMainLogic() {
        console.info('On main logic');
        if(!isDefined(app.settings.begin_button) || app.settings.begin_button !== "work"){
            console.info('App is turned off, skip next logic');
            return;
        }
        var systemReload = localStorage.getItem("system-reload") == "true";
        var reloadCycle = localStorage.getItem("reload-cycle") || 0;
        if (!!systemReload || app.debug) {
            console.info('Recover listener after reload, cycle =', reloadCycle);
            onWork({start: true});
        }
        window.localStorage.setItem("system-reload", false);

        setInterval(function () {
            window.localStorage.setItem("system-reload", true);
            if (reloadCycle > 3) {
                window.localStorage.setItem("reload-cycle", 0);
                click(selectors.mainPage);
            }

            window.localStorage.setItem("reload-cycle", reloadCycle++);
            location.reload();
        }, app.timers.timer);

        setInterval(function () {
            if (app.counter >= 10) app.counter = 0;
            console.info('Left to wait: ', (10 - app.counter++));
        }, (app.timers.timer * 0.10)); // 10% from normal timer
    }

    function takeTheMostPopular(list) {
        var v;
        var maxValue = 0;
        var maxIndex = 0;
        for (var i = 0; i < list.length; i++) {
            v = parseInt(list[i].innerHTML.replace(/[^\d]+/, ""));
            if (v > maxValue) {
                maxValue = v;
                maxIndex = i;
            }
        }
        var e = $$('.thumb.thumb--product:not(.no-auctions) .thumb-title .link')[maxIndex]
        click2(e);
    }

    function onWork(data) {
        console.info("On work logic");
        data = data || {};
        if (typeof app.refreshIntervalId != 'undefined') clearInterval(app.refreshIntervalId);
        $(selectors.header).removeClass('work');
        if (!data.start) return;

        $(selectors.header).addClass('work');

        app.refreshIntervalId = setInterval(function () {
            var list = $$('.thumb-meta .users');
            var amountOfGoods = list.length;//parseInt($(selectors.amountOfGoods).text().replace(/[^\d]+/, ""));
            var isDetalization = window.location.toString().indexOf("/product/") > -1;
            var containsButton = $(selectors.wantBuyButton).length > 0;
            var isButtonDisabled = $(selectors.wantBuyButton).hasClass('is-disabled');
            var statusPane = $(selectors.statusPane).length > 0;
            var isNotFroot = window.location.href.indexOf('marinatravel.kz') > -1;

            if (amountOfGoods === 0) {
                amountOfGoods = parseInt($(selectors.amountOfGoods).text().replace(/[^\d]+/, ""));
            }

            if (amountOfGoods > 0 && !isDetalization) {
                console.info("Go to goods page");

                if(isDefined(app.settings.most_popular_enable) && app.settings.most_popular_enable){
                    takeTheMostPopular(list);
                } else if (isDefined(app.settings.last_good_enable) && app.settings.last_good_enable) {
                    click(selectors.goodLast);
                } else {
                    click(selectors.good);
                }
            } else if (amountOfGoods > 1 && isDetalization && isButtonDisabled) {
                console.info("It's too late, we missed our chance");
                click(selectors.good);
            } else if (amountOfGoods > 0 && isDetalization && containsButton) {
                if (isButtonDisabled) {
                    console.warn("We missed stage 1 and can not participate in the draw");
                } else {
                    console.info("Click main button");
                    click(selectors.wantBuyButton);
                }
            } else if (isDetalization && statusPane) {
                console.info("We are engaged, awat 2 stage");
            } else if (isDetalization || isNotFroot) {
                console.info("Return to main page");
                openPage('https://thefroot.com/');
            } else {
                console.warn("Goods not found");
            }
        }, app.timers.worker);
    }

    function openPage(path) {
        window.localStorage.setItem("system-reload", true);
        window.location.href = path;
    }

    function click(selector) {
        $(selector).click();
        var id = uid();
        $(selector).attr('id', id);
        document.getElementById(id).click();
        $(selector).removeAttr('id');
        var timer = setTimeout(function () {
            $(selectors.header).removeClass('work').addClass('work');

            clearTimeout(timer);
            timer = null;
        }, app.timers.smallTimer);
    }

    function click2(element) {
        element.click();
        var id = uid();
        element.id = id;
        document.getElementById(id).click();
        element.id = "";
        var timer = setTimeout(function () {
            $(selectors.header).removeClass('work').addClass('work');

            clearTimeout(timer);
            timer = null;
        }, app.timers.smallTimer);
    }

    function uid() {
        var text = "";
        var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

        for (var i = 0; i < 5; i++)
            text += possible.charAt(Math.floor(Math.random() * possible.length));

        return text;
    }

    function onMessageReceive() {
        console.info("On message receive");
        chrome.extension.onMessage.addListener(function (request, sender, sendResponse) {
            console.info("Received message from popup, request: ", request);
            switch (request.type) {
                case "begin":
                    onWork(request.data);
                    break;
            }
            return true;
        });
    }

    function isDefined(object) {
        return ((typeof object !== 'undefined') && object !== null);
    }

    function sleep(milliseconds) {
        var start = new Date().getTime();
        for (var i = 0; i < 1e7; i++) {
            if ((new Date().getTime() - start) > milliseconds) {
                break;
            }
        }
    }

    /*------------------------------------------------------------*/

    init();

}());
