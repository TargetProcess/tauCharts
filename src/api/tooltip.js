// jshint ignore: start
var classes = function (el) {
    return {
        add: function (name) {
            el.classList.add(name);
        },
        remove: function (name) {
            el.classList.remove(name);
        }
    };
};



var indexOf = function (arr, obj) {
    return arr.indexOf(obj);
};

/**
 * Globals.
 */
var win = window;
var doc = win.document;
var body = doc.body;
var docEl = doc.documentElement;
var verticalPlaces = ['top', 'bottom'];

/**
 * Poor man's shallow object extend.
 *
 * @param {Object} a
 * @param {Object} b
 *
 * @return {Object}
 */
function extend(a, b) {
    for (var key in b) { // jshint ignore:line
        a[key] = b[key];
    }
    return a;
}

/**
 * Checks whether object is window.
 *
 * @param {Object} obj
 *
 * @return {Boolean}
 */
function isWin(obj) {
    return obj && obj.setInterval != null;
}

/**
 * Returns element's object with `left`, `top`, `bottom`, `right`, `width`, and `height`
 * properties indicating the position and dimensions of element on a page.
 *
 * @param {Element} element
 *
 * @return {Object}
 */
function position(element) {
    var winTop = win.pageYOffset || docEl.scrollTop;
    var winLeft = win.pageXOffset || docEl.scrollLeft;
    var box = { left: 0, right: 0, top: 0, bottom: 0, width: 0, height: 0 };

    if (isWin(element)) {
        box.width = win.innerWidth || docEl.clientWidth;
        box.height = win.innerHeight || docEl.clientHeight;
    } else if (docEl.contains(element) && element.getBoundingClientRect != null) {
        extend(box, element.getBoundingClientRect());
        // width & height don't exist in <IE9
        box.width = box.right - box.left;
        box.height = box.bottom - box.top;
    } else {
        return box;
    }

    box.top = box.top + winTop - docEl.clientTop;
    box.left = box.left + winLeft - docEl.clientLeft;
    box.right = box.left + box.width;
    box.bottom = box.top + box.height;

    return box;
}
/**
 * Parse integer from strings like '-50px'.
 *
 * @param {Mixed} value
 *
 * @return {Integer}
 */
function parsePx(value) {
    return 0 | Math.round(String(value).replace(/[^\-0-9.]/g, ''));
}

/**
 * Get computed style of element.
 *
 * @param {Element} element
 *
 * @type {String}
 */
var style = win.getComputedStyle;

/**
 * Returns transition duration of element in ms.
 *
 * @param {Element} element
 *
 * @return {Integer}
 */
function transitionDuration(element) {
    var duration = String(style(element, transitionDuration.propName));
    var match = duration.match(/([0-9.]+)([ms]{1,2})/);
    if (match) {
        duration = Number(match[1]);
        if (match[2] === 's') {
            duration *= 1000;
        }
    }
    return 0 | duration;
}
transitionDuration.propName = (function () {
    var element = doc.createElement('div');
    var names = ['transitionDuration', 'webkitTransitionDuration'];
    var value = '1s';
    for (var i = 0; i < names.length; i++) {
        element.style[names[i]] = value;
        if (element.style[names[i]] === value) {
            return names[i];
        }
    }
}());
var objectCreate = Object.create;
/**
 * Tooltip construnctor.
 *
 * @param {String|Element} content
 * @param {Object}         options
 *
 * @return {Tooltip}
 */
function Tooltip(content, options) {
    if (!(this instanceof Tooltip)) {
        return new Tooltip(content, options);
    }
    this.hidden = 1;
    this.options = extend(objectCreate(Tooltip.defaults), options);
    this._createElement();
    this.content(content);
}

/**
 * Creates a tooltip element.
 *
 * @return {Void}
 */
Tooltip.prototype._createElement = function () {
    this.element = doc.createElement('div');
    this.classes = classes(this.element);
    this.classes.add(this.options.baseClass);
    var propName;
    for (var i = 0; i < Tooltip.classTypes.length; i++) {
        propName = Tooltip.classTypes[i] + 'Class';
        if (this.options[propName]) {
            this.classes.add(this.options[propName]);
        }
    }
};

/**
 * Changes tooltip's type class type.
 *
 * @param {String} name
 *
 * @return {Tooltip}
 */
Tooltip.prototype.type = function (name) {
    return this.changeClassType('type', name);
};

/**
 * Changes tooltip's effect class type.
 *
 * @param {String} name
 *
 * @return {Tooltip}
 */
Tooltip.prototype.effect = function (name) {
    return this.changeClassType('effect', name);
};

/**
 * Changes class type.
 *
 * @param {String} propName
 * @param {String} newClass
 *
 * @return {Tooltip}
 */
Tooltip.prototype.changeClassType = function (propName, newClass) {
    propName += 'Class';
    if (this.options[propName]) {
        this.classes.remove(this.options[propName]);
    }
    this.options[propName] = newClass;
    if (newClass) {
        this.classes.add(newClass);
    }
    return this;
};

/**
 * Updates tooltip's dimensions.
 *
 * @return {Tooltip}
 */
Tooltip.prototype.updateSize = function () {
    if (this.hidden) {
        this.element.style.visibility = 'hidden';
        body.appendChild(this.element);
    }
    this.width = this.element.offsetWidth;
    this.height = this.element.offsetHeight;
    if (this.spacing == null) {
        this.spacing = this.options.spacing != null ? this.options.spacing : parsePx(style(this.element, 'top'));
    }
    if (this.hidden) {
        body.removeChild(this.element);
        this.element.style.visibility = '';
    } else {
        this.position();
    }
    return this;
};

/**
 * Change tooltip content.
 *
 * When tooltip is visible, its size is automatically
 * synced and tooltip correctly repositioned.
 *
 * @param {String|Element} content
 *
 * @return {Tooltip}
 */
Tooltip.prototype.content = function (content) {
    if (typeof content === 'object') {
        this.element.innerHTML = '';
        this.element.appendChild(content);
    } else {
        this.element.innerHTML = content;
    }
    this.updateSize();
    return this;
};

/**
 * Pick new place tooltip should be displayed at.
 *
 * When the tooltip is visible, it is automatically positioned there.
 *
 * @param {String} place
 *
 * @return {Tooltip}
 */
Tooltip.prototype.place = function (place) {
    this.options.place = place;
    if (!this.hidden) {
        this.position();
    }
    return this;
};

/**
 * Attach tooltip to an element.
 *
 * @param {Element} element
 *
 * @return {Tooltip}
 */
Tooltip.prototype.attach = function (element) {
    this.attachedTo = element;
    if (!this.hidden) {
        this.position();
    }
    return this;
};

/**
 * Detach tooltip from element.
 *
 * @return {Tooltip}
 */
Tooltip.prototype.detach = function () {
    this.hide();
    this.attachedTo = null;
    return this;
};

/**
 * Pick the most reasonable place for target position.
 *
 * @param {Object} target
 *
 * @return {Tooltip}
 */
Tooltip.prototype._pickPlace = function (target) {
    if (!this.options.auto) {
        return this.options.place;
    }
    var winPos = position(win);
    var place = this.options.place.split('-');
    var spacing = this.spacing;

    if (~indexOf(verticalPlaces, place[0])) {
        if (target.top - this.height - spacing <= winPos.top) {
            place[0] = 'bottom';
        } else if (target.bottom + this.height + spacing >= winPos.bottom) {
            place[0] = 'top';
        }
        switch (place[1]) {
            case 'left':
                if (target.right - this.width <= winPos.left) {
                    place[1] = 'right';
                }
                break;
            case 'right':
                if (target.left + this.width >= winPos.right) {
                    place[1] = 'left';
                }
                break;
            default:
                if (target.left + target.width / 2 + this.width / 2 >= winPos.right) {
                    place[1] = 'left';
                } else if (target.right - target.width / 2 - this.width / 2 <= winPos.left) {
                    place[1] = 'right';
                }
        }
    } else {
        if (target.left - this.width - spacing <= winPos.left) {
            place[0] = 'right';
        } else if (target.right + this.width + spacing >= winPos.right) {
            place[0] = 'left';
        }
        switch (place[1]) {
            case 'top':
                if (target.bottom - this.height <= winPos.top) {
                    place[1] = 'bottom';
                }
                break;
            case 'bottom':
                if (target.top + this.height >= winPos.bottom) {
                    place[1] = 'top';
                }
                break;
            default:
                if (target.top + target.height / 2 + this.height / 2 >= winPos.bottom) {
                    place[1] = 'top';
                } else if (target.bottom - target.height / 2 - this.height / 2 <= winPos.top) {
                    place[1] = 'bottom';
                }
        }
    }

    return place.join('-');
};

/**
 * Position the element to an element or a specific coordinates.
 *
 * @param {Integer|Element} x
 * @param {Integer}         y
 *
 * @return {Tooltip}
 */
Tooltip.prototype.position = function (x, y) {
    if (this.attachedTo) {
        x = this.attachedTo;
    }
    if (x == null && this._p) {
        x = this._p[0];
        y = this._p[1];
    } else {
        this._p = arguments;
    }
    var target = typeof x === 'number' ? {
        left: 0 | x,
        right: 0 | x,
        top: 0 | y,
        bottom: 0 | y,
        width: 0,
        height: 0
    } : position(x);
    var spacing = this.spacing;
    var newPlace = this._pickPlace(target);

    // Add/Change place class when necessary
    if (newPlace !== this.curPlace) {
        if (this.curPlace) {
            this.classes.remove(this.curPlace);
        }
        this.classes.add(newPlace);
        this.curPlace = newPlace;
    }

    // Position the tip
    var top, left;
    switch (this.curPlace) {
        case 'top':
            top = target.top - this.height - spacing;
            left = target.left + target.width / 2 - this.width / 2;
            break;
        case 'top-left':
            top = target.top - this.height - spacing;
            left = target.right - this.width;
            break;
        case 'top-right':
            top = target.top - this.height - spacing;
            left = target.left;
            break;

        case 'bottom':
            top = target.bottom + spacing;
            left = target.left + target.width / 2 - this.width / 2;
            break;
        case 'bottom-left':
            top = target.bottom + spacing;
            left = target.right - this.width;
            break;
        case 'bottom-right':
            top = target.bottom + spacing;
            left = target.left;
            break;

        case 'left':
            top = target.top + target.height / 2 - this.height / 2;
            left = target.left - this.width - spacing;
            break;
        case 'left-top':
            top = target.bottom - this.height;
            left = target.left - this.width - spacing;
            break;
        case 'left-bottom':
            top = target.top;
            left = target.left - this.width - spacing;
            break;

        case 'right':
            top = target.top + target.height / 2 - this.height / 2;
            left = target.right + spacing;
            break;
        case 'right-top':
            top = target.bottom - this.height;
            left = target.right + spacing;
            break;
        case 'right-bottom':
            top = target.top;
            left = target.right + spacing;
            break;
    }

    // Set tip position & class
    this.element.style.top = Math.round(top) + 'px';
    this.element.style.left = Math.round(left) + 'px';

    return this;
};

/**
 * Show the tooltip.
 *
 * @param {Integer|Element} x
 * @param {Integer}         y
 *
 * @return {Tooltip}
 */
Tooltip.prototype.show = function (x, y) {
    x = this.attachedTo ? this.attachedTo : x;

    // Clear potential ongoing animation
    clearTimeout(this.aIndex);

    // Position the element when requested
    if (x != null) {
        this.position(x, y);
    }

    // Stop here if tip is already visible
    if (this.hidden) {
        this.hidden = 0;
        body.appendChild(this.element);
    }

    // Make tooltip aware of window resize
    if (this.attachedTo) {
        this._aware();
    }

    // Trigger layout and kick in the transition
    if (this.options.inClass) {
        if (this.options.effectClass) {
            void this.element.clientHeight;
        }
        this.classes.add(this.options.inClass);
    }

    return this;
};
Tooltip.prototype.getDom = function (x, y) {
    return this.element;
};

/**
 * Hide the tooltip.
 *
 * @return {Tooltip}
 */
Tooltip.prototype.hide = function () {
    if (this.hidden) {
        return;
    }

    var self = this;
    var duration = 0;

    // Remove .in class and calculate transition duration if any
    if (this.options.inClass) {
        this.classes.remove(this.options.inClass);
        if (this.options.effectClass) {
            duration = transitionDuration(this.element);
        }
    }

    // Remove tip from window resize awareness
    if (this.attachedTo) {
        this._unaware();
    }

    // Remove the tip from the DOM when transition is done
    clearTimeout(this.aIndex);
    this.aIndex = setTimeout(function () {
        self.aIndex = 0;
        body.removeChild(self.element);
        self.hidden = 1;
    }, duration);

    return this;
};

Tooltip.prototype.toggle = function (x, y) {
    return this[this.hidden ? 'show' : 'hide'](x, y);
};

Tooltip.prototype.destroy = function () {
    clearTimeout(this.aIndex);
    this._unaware();
    if (!this.hidden) {
        body.removeChild(this.element);
    }
    this.element = this.options = null;
};

/**
 * Make the tip window resize aware.
 *
 * @return {Void}
 */
Tooltip.prototype._aware = function () {
    var index = indexOf(Tooltip.winAware, this);
    if (!~index) {
        Tooltip.winAware.push(this);
    }
};

/**
 * Remove the window resize awareness.
 *
 * @return {Void}
 */
Tooltip.prototype._unaware = function () {
    var index = indexOf(Tooltip.winAware, this);
    if (~index) {
        Tooltip.winAware.splice(index, 1);
    }
};

/**
 * Handles repositioning of tooltips on window resize.
 *
 * @return {Void}
 */
Tooltip.reposition = (function () {

    var rAF = window.requestAnimationFrame || window.webkitRequestAnimationFrame || function (fn) {
            return setTimeout(fn, 17);
        };
    var rIndex;

    function requestReposition() {
        if (rIndex || !Tooltip.winAware.length) {
            return;
        }
        rIndex = rAF(reposition, 17);
    }

    function reposition() {
        rIndex = 0;
        var tip;
        for (var i = 0, l = Tooltip.winAware.length; i < l; i++) {
            tip = Tooltip.winAware[i];
            tip.position();
        }
    }

    return requestReposition;
}());
Tooltip.winAware = [];

// Bind winAware repositioning to window resize event
window.addEventListener('resize', Tooltip.reposition);
window.addEventListener('scroll', Tooltip.reposition);

/**
 * Array with dynamic class types.
 *
 * @type {Array}
 */
Tooltip.classTypes = ['type', 'effect'];

/**
 * Default options for Tooltip constructor.
 *
 * @type {Object}
 */
Tooltip.defaults = {
    baseClass: 'tooltip', // Base tooltip class name.
    typeClass: null,      // Type tooltip class name.
    effectClass: null,      // Effect tooltip class name.
    inClass: 'in',      // Class used to transition stuff in.
    place: 'top',     // Default place.
    spacing: null,      // Gap between target and tooltip.
    auto: 0          // Whether to automatically adjust place to fit into window.
};

export {Tooltip}