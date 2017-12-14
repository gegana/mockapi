const RouteHandler = require('../services/routeHandler'),
    PathToRegexp = require('path-to-regexp'),
    util = require('util')

module.exports = class GatewayHandler {
    constructor(routeRepository) {
        this.__routeRepository = routeRepository
    }

    /**
     * Process middleware request
     * @param {object} req - Express js middleware request object.
     * @param {object} res - Express js middleware response object.
     * @param {object} next - Express js middleware next object.
     */
    async processRequest(req, res, next) {
        var routes = this.__getRoutes(req.method)
        if (!routes || routes.length == 0) {
            next()
        } else {
            for (let i in routes) {
                var route = routes[i]
                var regex_keys = []
                var regex = PathToRegexp(route.path, regex_keys)
                var regex_result = regex.exec(req.baseUrl)
                if (regex_result) {
                    regex_result.splice(0, 1)
                    var params = {}
                    for (let i in regex_keys) {
                        var k = regex_keys[i],
                            v = regex_result[i]
                        params[k.name] = v
                    }
                    var route = this.__getRoute(route._id)
                    var h = new RouteHandler(route)
                    await h.processRequest(req, res, next, params)
                    return true
                }
            }
            next()
        }
    }

    /**
     * Return an array of routes for a particular http verb.
     * @param {string} httpVerb - Ex. GET, POST, PUT, DELETE.
     */
    __getRoutes(httpVerb) {
        return this.__routeRepository.getRoutes(httpVerb)
    }

    /**
     * Get a route document by its id.
     * @param {string} id - mongodb document id of the route.
     */
    __getRoute(id) {
        return this.__routeRepository.getRoute(id)
    }
}