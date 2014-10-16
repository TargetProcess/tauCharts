var class2type = ["Boolean", "Number", "String", "Function", "Array", "Date", "RegExp", "Object", "Error"].reduce(function (class2type, name) {
    class2type["[object " + name + "]"] = name.toLowerCase();
    return class2type;
}, {});
var toString = {}.toString;

var utils = {
    clone: (obj) => JSON.parse(JSON.stringify(obj)),
    type: (obj) => {
        /* jshint eqnull:true*/
        if (obj == null) {
            return obj + "";
        }
        return typeof obj === "object" || typeof obj === "function" ?
        class2type[toString.call(obj)] || "object" :
            typeof obj;
    },
    isArray: (obj)=>Array.isArray(obj)
};

export {utils};