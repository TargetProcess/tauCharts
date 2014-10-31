var utils = {
    clone: (obj) => JSON.parse(JSON.stringify(obj)),
    isArray: (obj)=>Array.isArray(obj)
};

export {utils};