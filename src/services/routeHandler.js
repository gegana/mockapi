const util = require('util')

module.exports = class RouteHandler {
    constructor(route) {
        this.__route = route
    }

    /**
     * Process middleware request
     * @param {object} req - Express js middleware request object.
     * @param {object} res - Express js middleware response object.
     * @param {object} next - Express js middleware next object.
     * @param {object} params - Dictionary of request URL parameters keyed by parameter name
     */
    async processRequest(req, res, next, params, query) {
        try {
            var params = params || req.params
            var query = query || req.query
            var body = this.__processBodyTokens(params, query)
            await this.__processResponseDelay()
            res.status(this.__route.status).send(body)
        } catch (err) {
            next(err)
        }
    }

    /**
     * Populate tokens in route body template with values from params and query
     * @param {object} params - Request url parameters keyed by parameter name
     * @param {object} query - Request querystring parameters keyed by parameter name
     */
    __processBodyTokens(params, query) {
        if (!this.__route.body) {
            return {}
        }
        var s = JSON.stringify(this.__route.body)
        for (let k in params) {
            var regex = new RegExp('\{(' + k + ')\}')
            s = s.replace(regex, params[k])
        }
        for (let k in query) {
            var regex = new RegExp('\{(' + k + ')\}')
            s = s.replace(regex, query[k])
        }
        return JSON.parse(s)
    }

    async __processResponseDelay() {
        if (this.__route.responseDelay) {
            return await timeout(this.__route.responseDelay)
        }
        return false
    }
}

/**
 * Javascript setTimeout does not use Promises so it doesn't work with async/await operators
 * @param {number} ms 
 */
function timeout(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}