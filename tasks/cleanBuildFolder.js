const fs = require('fs');
const {resolve, join} = require('path');
const resolvePath = (relativePath) => resolve(__dirname, relativePath);

const deleteWebpackStylesJsFiles = (folder) => {
    fs.readdirSync(resolvePath(folder)).forEach((file) => {
        if(file.endsWith('.styles.js')) {
            fs.unlinkSync(resolvePath(join(folder, file)));
        }
    });
};

deleteWebpackStylesJsFiles('../dist/plugins');
deleteWebpackStylesJsFiles('../dist');