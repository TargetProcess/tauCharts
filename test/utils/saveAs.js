    var callbacksItems = {items:[function(){}]};
    var saveAs = function() {
        callbacksItems.items.forEach(function(item){
            item();
        });
    };
    saveAs.callbacks  = callbacksItems;
export {saveAs};