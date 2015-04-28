define(function() {
    var callbacksItems = {items:[function(){}]};
    var saveAs = function() {
        callbacksItems.items.forEach(function(item){
            item();
        });
    };
    saveAs.callbacks  = callbacksItems;
    return saveAs;
});