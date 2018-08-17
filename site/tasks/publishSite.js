const ghpages = require('gh-pages');
const {resolve} = require('path');
const resolvePath = (relativePath) => resolve(__dirname, relativePath);

const build = resolvePath('../build');

async function publish() {
    return new Promise((resolve, reject) => {
        ghpages.publish(build, {
            branch: 'gh-pages'
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
    .then(() => console.log('publish to gh-pages branch success'))
    .catch((err) => {
        console.log('could not publish to gh-pages branch', err)
    });
