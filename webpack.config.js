var nohConfig = {
    mode: 'development',
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

module.exports = [nohConfig, nohDocConfig, nohExampleConfig]
