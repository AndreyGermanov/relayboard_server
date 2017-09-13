module.exports = {
    apps : [
        {
            name: 'RelayBoardServer',
            script: 'index.js',
            watch: true,
            ignore_watch: ['app/client','public'],
            watch_options: {
                usePolling: true,
                persistent: true,
                ignoreInitial: true,
                alwaysStat: true,
                useFsEvents: false
            },
            interpreter: 'babel-node',
            env: {
                COMMON_VARIABLE: 'true'
            },
            env_production : {
                NODE_ENV: 'production'
            }
        }
    ]
}

