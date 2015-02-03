define(function () {
    var printCallbacks = [];
    window.Blob = function() {

    };
    window.print = function() {
        printCallbacks.forEach(function(callback){
            callback();
        });
    };
    return {
        printCallbacks: printCallbacks
    };
});