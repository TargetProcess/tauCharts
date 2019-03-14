const {resolve} = require('path');

module.exports = {
    rules: [
        {
            loader: 'css-loader',
            test: /\.css$/
        },
        {
            loader: 'ts-loader',
            test: /\.(js|ts)$/,
            exclude: [
                resolve(__dirname, '../node_modules'),
            ],
            options: {
                compilerOptions: {
                    sourceMap: true
                },
                transpileOnly: true
            }
        },
    ],
};
