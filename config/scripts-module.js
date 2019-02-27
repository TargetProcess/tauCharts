const {resolve} = require('path');

module.exports = {
    rules: [
        {
            loader: 'css-loader',
            test: /\.css$/
        },
        {
            loader: 'babel-loader',
            test: /\.(js|ts)$/,
            exclude: [
                resolve(__dirname, '../node_modules'),
            ],
            options: {
                babelrc: false,
                presets: [
                    require.resolve(`@babel/preset-typescript`)
                ],
                cacheDirectory: true,
            },
        },
    ],
};
