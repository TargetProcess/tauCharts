(function () {
    function absolute(value, base) {
        return value > 0 ? value : base + value;
    }

    /** @class */
    var Layout = Class.extend({
        /** @constructs */
        init: function (svg, width, height) {
            this._svg = svg;

            this._width = width || svg.layout('width');
            this._height = height || svg.layout('height');

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
            }
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
        var node = d3_element[0][0]; // TODO: add constraints
        node.parentNode.appendChild(node);
    };

    var paddedBox = function(d3_element, padding){
        var box = d3_element[0][0].getBoundingClientRect();
        var layout = new tau.svg.Layout(d3_element, box.width, box.height);
        layout.row(padding.top);
        layout.row(-padding.bottom);
        layout.col(padding.left);

        return layout.col(-padding.right);
    };

    tau.svg = {
        bringOnTop: bringOnTop,
        paddedBox: paddedBox,
        Layout: Layout
    };
})();