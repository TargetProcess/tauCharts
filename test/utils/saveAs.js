define(function() {
    var callbacksItems = {items:[function(){}]};
    var saveAs = function() {
        console.log('run');
        callbacksItems.items.forEach(function(item){
            item();
        });
    };
    saveAs.callbacks  = callbacksItems;
    return saveAs;
});