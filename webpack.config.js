var path = require('path');

var distpath = path.resolve(__dirname, 'dist');

var rules = [
    {
        test: /.*\.css$/,
        use: [ 'style-loader', 'css-loader' ]
    }
];

var nohConfig = {
    mode: 'production',
    entry: './src/noh.js',
    output: { path: distpath, filename: 'noh.js' },
    module: { rules: rules }
};

var nohDocConfig = {
    mode: 'development',
    entry: './src/noh_doc.js',
    output: { path: distpath, filename: 'noh_doc.js' },
    module: { rules: rules }
};

var nohExampleConfig = {
    mode: 'development',
    entry: './src/noh_example.js',
    output: { path: distpath, filename: 'noh_example.js' },
    module: { rules: rules }
};

var nohTestsConfig = {
    mode: 'production',
    entry: './src/noh_tests.js',
    output: { path: distpath, filename: 'noh_tests.js' },
    module: { rules: rules }
};

var nohTestsDevConfig = {
    mode: 'development',
    entry: './src/noh_tests.js',
    output: { path: distpath, filename: 'noh_tests_dev.js' },
    module: { rules: rules }
};

module.exports = [nohConfig, nohDocConfig, nohExampleConfig, nohTestsConfig, nohTestsDevConfig];
