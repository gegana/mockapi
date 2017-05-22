const PathToRegexp = require('path-to-regexp'),
    GatewayHandler = require('../services/gatewayHandler')

module.exports = {
    method: '*',
    path: '/*',
    handler: function (req, res, next, memorycache, mongodb) {
        const h = new GatewayHandler(memorycache, mongodb)
        h.processRequest(req, res, next).then().catch((err) => {
            next(err)
        })
    }
}