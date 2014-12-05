var getLayout = function () {
    var container = document.createElement('div');
    var top = document.createElement('div');
    var centerContainer = document.createElement('div');
    var center = document.createElement('div');
    var left = document.createElement('div');
    var right = document.createElement('div');
    var bottom = document.createElement('div');
    container.appendChild(top);
    container.appendChild(centerContainer);
    container.appendChild(bottom);
    centerContainer.appendChild(left);
    centerContainer.appendChild(center);
    centerContainer.appendChild(right);
    /* jshint ignore:start */
    return {
        container,
        top,
        center,
        left,
        right,
        bottom
    };
    /* jshint ignore:end */
};


export {getLayout};

