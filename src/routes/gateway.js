const PathToRegexp = require('path-to-regexp'),
    GatewayHandler = require('../services/gatewayHandler')

module.exports = {
    method: '*',
    path: '/*',
    handler: function (req, res, next, routeRepository) {
        const h = new GatewayHandler(routeRepository)
        h.processRequest(req, res, next).then().catch((err) => {
            next(err)
        })
    }
}