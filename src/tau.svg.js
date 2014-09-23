(function (tau, Class) {
    function absolute(value, base) {
        return value > 0 ? value : base + value;
    }

    /** @class */
    var Layout = Class.extend({
        /** @constructs */
        init: function (svg, box) {
            this._svg = svg;

            if (box){
                this._width = box.width;
                this._height = box.height;
            } else {
                this._width = svg.layout('width');
                this._height = svg.layout('height');
            }

            this._x = 0;
            this._y = 0;

            this._translateX = 0;
            this._translateY = 0;
        },

        _translate: function(d3_selection){
            if (this._translateX || this._translateY){
                d3_selection.attr('transform', 'translate(' + (this._translateX || 0) + ',' + (this._translateY || 0) + ')');
            }
        },

        _extend: function(d3_selection){
            var layout = {
                width: absolute(this._x - this._translateX, this._width),
                height: absolute(this._y - this._translateY, this._height)
            };

            d3_selection.layout = function(key){
                return layout[key];
            };
        },

        /**
         * @param [height]
         */
        row: function(height){
            this._translateX = 0;
            this._translateY = this._y;
            this._y = height ? this._y + absolute(height - this._y, this._height) : null; // TODO: handle several rows without specification
        },

        /**
         * @param [width]
         * @returns d3_selection
         */
        col: function(width){
            this._translateX = this._x;
            this._x = width ? this._x + absolute(width - this._x, this._width) : null; // TODO: handle several cols without specification
            return this._svg
                .append('g')
                .call(this._translate.bind(this))
                .call(this._extend.bind(this));
        }
    });

    var bringOnTop = function(d3_element){
        d3_element.node().parentNode.appendChild(d3_element.node());
    };

    var getSVGLengthValue = function(element, property){
        var value = element[property].baseVal;

        switch(value.unitType){
            case 1: // SVG_LENGTHTYPE_NUMBER
                return value.value;
            case 2: // SVG_LENGTHTYPE_PERCENTAGE
                return (element.parentNode[property] || element.parentNode.getBoundingClientRect()[property]) * value.valueInSpecifiedUnits / 100;
            default:
                throw new Error('unitType ' + value.unitType + ' is not supported');
        }
    };

    var getBBox = function(svgElement) {
        return {
            width: getSVGLengthValue(svgElement, 'width'),
            height: getSVGLengthValue(svgElement, 'height')
        };
    };

    var paddedBox = function(d3_element, padding){
        var layout = new tau.svg.Layout(d3_element, getBBox(d3_element.node()));
        layout.row(padding.top);
        layout.row(-padding.bottom);
        layout.col(padding.left);

        return layout.col(-padding.right);
    };

    tau.svg = {
        getBBox: getBBox,
        bringOnTop: bringOnTop,
        paddedBox: paddedBox,
        Layout: Layout
    };
})(tau, Class);