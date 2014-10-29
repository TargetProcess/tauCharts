function getDots() {
    return d3.selectAll('.dot')[0];
}
function getLine() {
    return d3.selectAll('.line')[0];
}

function getGroupBar() {
    return d3.selectAll('.i-role-bar-group')[0];
}

function attrib(el, prop) {
    return el.getAttribute(prop)
}

var hasClass = function (element, value) {
    return attrib(element, 'class').indexOf(value) !== -1;
};

function position(el) {
    return {x: attrib(el, 'cx'), y: attrib(el, 'cy')}
}