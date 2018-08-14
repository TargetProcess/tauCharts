const ghpages = require('gh-pages');
const {resolve, join} = require('path');
const resolvePath = (relativePath) => resolve(__dirname, relativePath);
const fs = require('fs-extra');

const dist = resolvePath('../dist');
const prepared = resolvePath('../prepared');
const examples = resolvePath('../examples');
const license = resolvePath('../LICENSE');
const readme = resolvePath('../README.md');
const types = resolvePath('../types');
const packagejson = resolvePath('../package.json');

async function publish() {
    await fs.remove(prepared);
    await fs.copy(dist, join(prepared, 'dist'));
    await fs.copy(examples, join(prepared, 'examples'));
    await fs.copy(types, join(prepared, 'types'));
    await fs.copy(license, join(prepared, 'LICENSE'));
    await fs.copy(readme, join(prepared, 'README.md'));
    await fs.copy(packagejson, join(prepared, 'package.json'));
    return new Promise((resolve, reject) => {
        ghpages.publish(prepared, {
            branch: 'release'
        }, function (err) {
            if (err) {
                reject(err);
            } else {
                resolve();
            }
        });
    })
}

publish()
    .then(() => console.log('publish to release branch success'))
    .catch((err) => {
        console.log('could not publish to release branch', err)
    });
