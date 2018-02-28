const {BannerPlugin} = require('webpack');
const banner = () => {
    const package = require('../package.json');
    const now = new Date();
    const today = require('d3-time-format').utcFormat('%Y-%m-%d')(now);
    const year = now.getUTCFullYear();
    return [
        `/*`,
        `${package.name}@${package.version} (${today})`,
        `Copyright ${year} ${package.author.name}`,
        `Licensed under ${package.licenses.map(x => x.type).join(', ')}`,
        `*/`,
        ``
    ].join('\n');
};
module.exports = new BannerPlugin({
    banner: banner(), // the banner as string, it will be wrapped in a comment
    raw: false, // if true, banner will not be wrapped in a comment
    entryOnly: true, // if true, the banner will only be added to the entry chunks
});
