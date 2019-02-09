var path = require('path');

var nohConfig = {
    mode: 'production',
    entry: './src/noh.js',
    output: {
        path: path.resolve(__dirname, 'dist'),
        filename: 'noh.js'
    }
};

var nohDocConfig = {
    mode: 'development',
    entry: './src/noh_doc.js',
    output: {
        path: path.resolve(__dirname, 'dist'),
        filename: 'noh_doc.js'
    }
};

var nohExampleConfig = {
    mode: 'development',
    entry: './src/noh_example.js',
    output: {
        path: path.resolve(__dirname, 'dist'),
        filename: 'noh_example.js'
    }
};

var nohTestsConfig = {
    mode: 'production',
    entry: './src/noh_tests.js',
    output: {
        path: path.resolve(__dirname, 'dist'),
        filename: 'noh_tests.js'
    }
};

var nohTestsDevConfig = {
    mode: 'development',
    entry: './src/noh_tests.js',
    output: {
        path: path.resolve(__dirname, 'dist'),
        filename: 'noh_tests_dev.js'
    }
};

module.exports = [nohConfig, nohDocConfig, nohExampleConfig, nohTestsConfig, nohTestsDevConfig];
