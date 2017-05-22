const RouteHandler = require('../services/routeHandler'),
    PathToRegexp = require('path-to-regexp'),
    ObjectId = require('mongodb').ObjectID,
    util = require('util'),
    cache_key_format_paths = '$paths_%s',
    cache_key_format_route = '$route_%s'

module.exports = class GatewayHandler {
    constructor(memorycache, mongodb) {
        this.__cache = memorycache
        this.__db = mongodb
        this.__collection = this.__db.collection('routes')
    }

    /**
     * Process middleware request
     * @param {object} req - Express js middleware request object.
     * @param {object} res - Express js middleware response object.
     * @param {object} next - Express js middleware next object.
     */
    async processRequest(req, res, next) {
        var paths = await this.__getRoutePaths(req.method)
        if (!paths || paths.length == 0) {
            next()
        } else {
            for (let i in paths) {
                var path = paths[i]
                var regex_keys = []
                var regex = PathToRegexp(path.path, regex_keys)
                var regex_result = regex.exec(req.baseUrl)
                if (regex_result) {
                    regex_result.splice(0, 1)
                    var params = {}
                    for (let i in regex_keys) {
                        var k = regex_keys[i],
                            v = regex_result[i]
                        params[k.name] = v
                    }
                    var route = await this.__getRoute(path._id)
                    var h = new RouteHandler(route)
                    await h.processRequest(req, res, next, params)
                    return true
                }
            }
            next()
        }
    }

    /**
     * Return an array of route paths for a particular http verb.
     * @param {string} httpVerb - Ex. GET, POST, PUT, DELETE.
     */
    async __getRoutePaths(httpVerb) {
        const cacheKey = util.format(cache_key_format_paths, httpVerb)
        var routes = this.__cache.get(cacheKey)
        if (!routes) {
            routes = await this.__collection.find({
                method: httpVerb
            }, {
                path: 1
            }).sort({
                timestamp: -1
            }).toArray()
            this.__cache.set(cacheKey, routes)
        }
        return routes
    }

    /**
     * Get a route document by its id.
     * @param {string} id - mongodb document id of the route.
     */
    async __getRoute(id) {
        const cacheKey = util.format(cache_key_format_route, id)
        var route = this.__cache.get(cacheKey)
        if (!route) {
            route = await this.__collection.findOne({
                '_id': new ObjectId(id)
            })
            this.__cache.set(cacheKey, route)
        }
        return route
    }
}