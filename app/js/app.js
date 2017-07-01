'use strict';

(function () {

    function YOURAPPNAME(doc) {
        var _self = this;

        _self.doc = doc;
        _self.window = window;
        _self.html = _self.doc.querySelector('html');
        _self.body = _self.doc.body;
        _self.location = location;
        _self.hash = location.hash;
        _self.Object = Object;
        _self.scrollWidth = 0;

        _self.bootstrap();
    }

    YOURAPPNAME.prototype.bootstrap = function () {
        var _self = this;

        // Initialize window scollBar width
        _self.scrollWidth = _self.scrollBarWidth();
    };

    // Window load types (loading, dom, full)
    YOURAPPNAME.prototype.appLoad = function (type, callback) {
        var _self = this;

        switch (type) {
            case 'loading':
                if (_self.doc.readyState === 'loading') callback();

                break;
            case 'dom':
                _self.doc.onreadystatechange = function () {
                    if (_self.doc.readyState === 'complete') callback();
                };

                break;
            case 'full':
                _self.window.onload = function (e) {
                    callback(e);
                };

                break;
            default:
                callback();
        }
    };

    // Detect scroll default scrollBar width (return a number)
    YOURAPPNAME.prototype.scrollBarWidth = function () {
        var _self = this,
            outer = _self.doc.createElement("div");
        outer.style.visibility = "hidden";
        outer.style.width = "100px";
        outer.style.msOverflowStyle = "scrollbar";

        _self.body.appendChild(outer);

        var widthNoScroll = outer.offsetWidth;

        outer.style.overflow = "scroll";

        var inner = _self.doc.createElement("div");

        inner.style.width = "100%";
        outer.appendChild(inner);

        var widthWithScroll = inner.offsetWidth;

        outer.parentNode.removeChild(outer);

        return widthNoScroll - widthWithScroll;
    };

    YOURAPPNAME.prototype.initSwitcher = function () {
        var _self = this;

        var switchers = _self.doc.querySelectorAll('[data-switcher]');

        if (switchers && switchers.length > 0) {
            for (var i = 0; i < switchers.length; i++) {
                var switcher = switchers[i],
                    switcherOptions = _self.options(switcher.dataset["switcher"]),
                    switcherElems = switcher.children,
                    switcherTargets = _self.doc.querySelector('[data-switcher-target="' + switcherOptions.target + '"]').children,
                    switchersActive = [];

                for (var y = 0; y < switcherElems.length; y++) {
                    var switcherElem = switcherElems[y],
                        parentNode = switcher.children,
                        switcherTrigger = switcherElem.children.length ? switcherElem.children[0] : switcherElem,
                        switcherTarget = switcherTargets[y];

                    if (switcherElem.classList.contains('active')) {
                        for (var z = 0; z < parentNode.length; z++) {
                            parentNode[z].classList.remove('active');
                            switcherTargets[z].classList.remove('active');
                        }
                        switcherElem.classList.add('active');
                        switcherTarget.classList.add('active');
                    } else switchersActive.push(0);

                    switcherTrigger.addEventListener('click', function (elem, target, parent, targets) {
                        return function (e) {
                            e.preventDefault();

                            if (!elem.classList.contains('active')) {
                                for (var _z = 0; _z < elem.parentNode.children.length; _z++) {
                                    elem.parentNode.children[_z].classList.remove('active');
                                    targets[_z].classList.remove('active');
                                }
                                elem.classList.add('active');
                                target.classList.add('active');
                            }
                        };
                    }(switcherElem, switcherTarget, parentNode, switcherTargets));
                }

                if (switchersActive.length === switcherElems.length) {
                    switcherElems[0].classList.add('active');
                    switcherTargets[0].classList.add('active');
                }
            }
        }
    };

    YOURAPPNAME.prototype.str2json = function (str, notevil) {
        try {
            if (notevil) {
                return JSON.parse(str.replace(/([\$\w]+)\s*:/g, function (_, $1) {
                    return '"' + $1 + '":';
                }).replace(/'([^']+)'/g, function (_, $1) {
                    return '"' + $1 + '"';
                }));
            } else {
                return new Function("", "const json = " + str + "; return JSON.parse(JSON.stringify(json));")();
            }
        } catch (e) {
            return false;
        }
    };

    YOURAPPNAME.prototype.options = function (string) {
        var _self = this;

        if (typeof string !== 'string') return string;

        if (string.indexOf(':') !== -1 && string.trim().substr(-1) !== '}') {
            string = '{' + string + '}';
        }

        var start = string ? string.indexOf("{") : -1,
            options = {};

        if (start !== -1) {
            try {
                options = _self.str2json(string.substr(start));
            } catch (e) {}
        }

        return options;
    };

    YOURAPPNAME.prototype.popups = function (options) {
        var _self = this;

        var defaults = {
            reachElementClass: '.js-popup',
            closePopupClass: '.js-close-popup',
            currentElementClass: '.js-open-popup',
            changePopupClass: '.js-change-popup'
        };

        options = $.extend({}, options, defaults);

        var plugin = {
            reachPopups: $(options.reachElementClass),
            bodyEl: $('body'),
            topPanelEl: $('.top-panel-wrapper'),
            htmlEl: $('html'),
            closePopupEl: $(options.closePopupClass),
            openPopupEl: $(options.currentElementClass),
            changePopupEl: $(options.changePopupClass),
            bodyPos: 0
        };

        plugin.openPopup = function (popupName) {
            plugin.reachPopups.filter('[data-popup="' + popupName + '"]').addClass('opened');
            plugin.bodyEl.css('overflow-y', 'scroll');
            // plugin.topPanelEl.css('padding-right', scrollSettings.width);
            plugin.htmlEl.addClass('popup-opened');
        };

        plugin.closePopup = function (popupName) {
            plugin.reachPopups.filter('[data-popup="' + popupName + '"]').removeClass('opened');
            setTimeout(function () {
                plugin.bodyEl.removeAttr('style');
                plugin.htmlEl.removeClass('popup-opened');
                plugin.topPanelEl.removeAttr('style');
            }, 300);
        };

        plugin.changePopup = function (closingPopup, openingPopup) {
            plugin.reachPopups.filter('[data-popup="' + closingPopup + '"]').removeClass('opened');
            plugin.reachPopups.filter('[data-popup="' + openingPopup + '"]').addClass('opened');
        };

        plugin.init = function () {
            plugin.bindings();
        };

        plugin.bindings = function () {
            plugin.openPopupEl.on('click', function (e) {
                e.preventDefault();
                var pop = $(this).attr('data-popup-target');
                plugin.openPopup(pop);
            });

            plugin.closePopupEl.on('click', function (e) {
                e.preventDefault();

                var pop = void 0;
                if (this.hasAttribute('data-popup-target')) {
                    pop = $(this).attr('data-popup-target');
                } else {
                    pop = $(this).closest(options.reachElementClass).attr('data-popup');
                }

                plugin.closePopup(pop);
            });

            plugin.changePopupEl.on('click', function (e) {
                var closingPop = $(this).attr('data-closing-popup');
                var openingPop = $(this).attr('data-opening-popup');

                plugin.changePopup(closingPop, openingPop);
            });

            plugin.reachPopups.on('click', function (e) {
                var target = $(e.target);
                var className = options.reachElementClass.replace('.', '');
                if (target.hasClass(className)) {
                    plugin.closePopup($(e.target).attr('data-popup'));
                }
            });
        };

        if (options) plugin.init();

        return plugin;
    };

    YOURAPPNAME.prototype.parallax = function (selector) {
        var blocks = $(selector);

        function getOffset() {
            return parseInt($('.content').css('margin-left'));
        }

        function renderOffset() {
            blocks.each(function () {
                var $this = $(this);
                var $height = $this.outerHeight();

                $this.css({
                    left: $offset
                }).addClass('parallax-active');

                $this.next('[data-parallax-placeholder]').css({ height: $height });

                console.log($this.next('[data-parallax-placeholder]'));
            });
        }

        var $offset = getOffset();

        $(window).resize(function () {
            $offset = getOffset();
            renderOffset();
        });

        renderOffset();
    };

    var app = new YOURAPPNAME(document);

    app.appLoad('loading', function () {
        console.log('App is loading... Paste your app code here.');
        // App is loading... Paste your app code here. 4example u can run preloader event here and stop it in action appLoad dom or full
    });

    app.appLoad('dom', function () {
        console.log('DOM is loaded! Paste your app code here (Pure JS code).');
        // DOM is loaded! Paste your app code here (Pure JS code).
        // Do not use jQuery here cause external libs do not loads here...

        app.initSwitcher(); // data-switcher="{target: 'anything'}" , data-switcher-target="anything"
    });

    app.appLoad('full', function () {
        console.log('App was fully load! Paste external app source code here... For example if your use jQuery and something else');
        // App was fully load! Paste external app source code here... 4example if your use jQuery and something else
        // Please do not use jQuery ready state function to avoid mass calling document event trigger!

        app.popups();
        app.parallax('[data-parallax]');

        var $whyUsCarousel = $('#why-us-carousel');
        var $reviewsCarousel = $('#reviews-carousel');
        var $reviewsVkCarousel = $('#reviews-vk-carousel');
        var $reviewsVkThumbnailCarousel = $('#reviews-vk-thumbnail-carousel');

        $whyUsCarousel.owlCarousel({
            loop: true,
            nav: false,
            items: 1,
            dots: true
        });

        $reviewsCarousel.owlCarousel({
            loop: true,
            nav: false,
            items: 1,
            dots: false
        });

        $reviewsVkCarousel.owlCarousel({
            loop: true,
            nav: true,
            items: 1,
            dots: false,
            responsive: {
                0: {
                    nav: false,
                    dots: true
                },
                600: {
                    nav: true,
                    dots: false
                }
            }
        });

        $reviewsVkThumbnailCarousel.owlCarousel({
            loop: true,
            nav: true,
            responsive: {
                0: {
                    items: 1,
                    nav: false,
                    dots: true
                },
                600: {
                    items: 3
                },
                1000: {
                    items: 5
                }
            },
            margin: 20,
            dots: false
        });

        $reviewsCarousel.find('.owl-next').click(function (e) {
            e.preventDefault();

            $reviewsCarousel.trigger('next.owl.carousel');
        });

        $reviewsCarousel.find('.owl-prev').click(function (e) {
            e.preventDefault();

            $reviewsCarousel.trigger('prev.owl.carousel');
        });

        $(window).resize(function () {
            $whyUsCarousel.trigger('refresh.owl.carousel');
            $reviewsCarousel.trigger('refresh.owl.carousel');
            $reviewsVkThumbnailCarousel.trigger('refresh.owl.carousel');
        });

        $('.navigation__item.navigation__item--sub > .navigation__link').click(function (e) {
            e.preventDefault();

            var $link = $(this);
            var $parentListItem = $link.parent();
            var parentListItemClass = 'navigation__item--active';

            if ($parentListItem.hasClass(parentListItemClass)) {
                $parentListItem.removeClass(parentListItemClass);
            } else {
                $parentListItem.addClass(parentListItemClass);
            }
        });

        $('.navigation__item.navigation__item--back .navigation__link').click(function (e) {
            e.preventDefault();

            var $link = $(this);
            var $parentListItem = $link.closest('.navigation__item.navigation__item--sub');

            $parentListItem.removeClass('navigation__item--active');
        });
    });

    $('.header__toggle > a').click(function (e) {
        e.preventDefault();

        var $trigger = $(this);
        var $header = $trigger.closest('.header');
        var headerActiveClass = 'header--active';
        var $headerContent = $header.find('.header__content');
        var headerContentActiveClass = 'header__content--active';

        if ($headerContent.hasClass(headerContentActiveClass)) {
            $headerContent.removeClass(headerContentActiveClass);
            $header.removeClass(headerActiveClass);
            $(document.querySelector('html')).removeClass('menu-opened');
        } else {
            $headerContent.addClass(headerContentActiveClass);
            $header.addClass(headerActiveClass);
            $(document.querySelector('html')).addClass('menu-opened');
        }
    });
})();