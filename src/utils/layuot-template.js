import {CSS_PREFIX} from '../const';
var getLayout = function () {
    var layout = document.createElement('div');
    layout.classList.add(CSS_PREFIX + 'layout');
    var header = document.createElement('div');
    header.classList.add(CSS_PREFIX + 'layout__header');
    var centerContainer = document.createElement('div');
    centerContainer.classList.add(CSS_PREFIX + 'layout__container');
    var content = document.createElement('div');
    content.classList.add(CSS_PREFIX + 'layout__content');
    var m = document.createElement('div');
    content.appendChild(m);
    var leftSidebar = document.createElement('div');
    leftSidebar.classList.add(CSS_PREFIX + 'layout__sidebar');
    var rightSidebar = document.createElement('div');
    rightSidebar.classList.add(CSS_PREFIX + 'layout__sidebar-right');
    var bottom = document.createElement('div');
    bottom.classList.add(CSS_PREFIX + 'layout__footer');
    layout.appendChild(header);
    layout.appendChild(centerContainer);
    layout.appendChild(bottom);
    centerContainer.appendChild(leftSidebar);
    centerContainer.appendChild(content);
    content = m;
    centerContainer.appendChild(rightSidebar);
    /* jshint ignore:start */
    return {
        layout,
        header,
        content,
        leftSidebar,
        rightSidebar,
        bottom
    };
    /* jshint ignore:end */
};


export {getLayout};

