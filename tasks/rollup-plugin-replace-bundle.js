const MagicString = require('magic-string');

module.exports = function (replacers = {}) {
    return {
        name: 'replace-bundle',
        transformBundle(code) {
            const magicString = new MagicString(code);
            Object.entries(replacers).forEach(([find, replace]) => {
                let i;
                let j = 0;
                while ((i = code.indexOf(find, j)) >= 0) {
                    magicString.overwrite(i, i + find.length, replace);
                    j = i + replace.length;
                }
            });
            return {
                code: magicString.toString(),
                map: magicString.generateMap({hires: true})
            };
        }
    };
};
