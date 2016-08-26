import {CSS_PREFIX} from '../const';
var createElement = function (cssClass, parent) {
    var tag = 'div';
    var element = document.createElement(tag);
    element.classList.add(CSS_PREFIX + cssClass);
    if (parent) {
        parent.appendChild(element);
    }
    return element;
};
var getLayout = function () {
    var layout = createElement('layout');
    var header = createElement('layout__header', layout);
    var centerContainer = createElement('layout__container', layout);
    var leftSidebar = createElement('layout__sidebar', centerContainer);
    var contentContainer = createElement('layout__content', centerContainer);
    var content = createElement('layout__content__wrap', contentContainer);
    var rightSidebarContainer = createElement('layout__sidebar-right', centerContainer);
    var rightSidebar = createElement('layout__sidebar-right__wrap', rightSidebarContainer);
    var footer = createElement('layout__footer', layout);
    /* jshint ignore:start */
    return {
        layout,
        header,
        content,
        contentContainer,
        leftSidebar,
        rightSidebar,
        footer
    };
    /* jshint ignore:end */
};

export {getLayout};