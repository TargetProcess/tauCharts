define(function () {
    var saveAsCallbacks = [];
    var printCallbacks = [];
    window.saveAs = function () {
        saveAsCallbacks.forEach(function (callback) {
            callback();
        });
    };
    window.print = function() {
        printCallbacks.forEach(function(callback){
            callback();
        });
    };
    return {
        saveAsCallbacks: saveAsCallbacks,
        printCallbacks: printCallbacks
    };
});