    var printCallbacks = [];
    window.Blob = function() {

    };
    window.print = function() {
        printCallbacks.forEach(function(callback){
            callback();
        });
    };
    export default {
        printCallbacks: printCallbacks
    };
