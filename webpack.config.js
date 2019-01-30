var nohConfig = {
    mode: 'production',
    entry: './noh.js',
    output: {
        path: __dirname,
        filename: 'noh_bundle.js'
    }
}

var nohDocConfig = {
    mode: 'development',
    entry: './noh_doc.js',
    output: {
        path: __dirname,
        filename: 'noh_doc_bundle.js'
    }
}

var nohExampleConfig = {
    mode: 'development',
    entry: './noh_example.js',
    output: {
        path: __dirname,
        filename: 'noh_example_bundle.js'
    }
}

var nohTestsConfig = {
    mode: 'production',
    entry: './noh_tests.js',
    output: {
        path: __dirname,
        filename: 'noh_tests_bundle.js'
    }
}

var nohTestsDevConfig = {
    mode: 'development',
    entry: './noh_tests.js',
    output: {
        path: __dirname,
        filename: 'noh_tests_dev_bundle.js'
    }
}

module.exports = [nohConfig, nohDocConfig, nohExampleConfig, nohTestsConfig, nohTestsDevConfig]
