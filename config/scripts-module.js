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
                'node_modules',
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
