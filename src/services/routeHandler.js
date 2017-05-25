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
            var tokens = {}

            merge(tokens, params)
            merge(tokens, query)
            merge(tokens, flattenObject(req.body), 'body.')
            tokens.calls = this.__processPageViews(req)
            tokens.random = getRandomIntInclusive(1, 100)
            tokens.timestamp = Date.now()

            var status = this.__route.status,
                body = this.__processBodyTokens(this.__route.body, tokens)

            if (this.__route.conditionalBehaviors && Array.isArray(this.__route.conditionalBehaviors) && this.__route.conditionalBehaviors.length > 0) {
                var behavior = await this.__processConditionalBehaviors(tokens, status, body)
                if (behavior) {
                    status = behavior.status
                    body = behavior.body
                }
            }

            await this.__processResponseDelay()
            res.status(status).send(body)
        } catch (err) {
            next(err)
        }
    }

    /**
     * Process the number of page views to the base url on a session basis
     * @param {object} req - Express js middleware request object.
     */
    __processPageViews(req) {
        var views = req.session.views
        if (!views) {
            views = req.session.views = {}
        }
        var pathname = req.baseUrl

        views[pathname] = (views[pathname] || 0) + 1

        return views[pathname]
    }

    /**
     * Populate tokens in route body template with values from params and query
     * @param {object} body - Route body template
     * @param {object} tokens - Request url parameters, querystring parameters, and other info related to the request
     */
    __processBodyTokens(body, tokens) {
        if (!body) {
            return {}
        }
        var s = JSON.stringify(body)
        s = parseTokens(s, tokens)
        return JSON.parse(s)
    }

    async __processResponseDelay() {
        if (this.__route.responseDelay) {
            return await timeout(this.__route.responseDelay)
        }
        return false
    }

    /**
     * Process conditional behaviors by their priority order and returning the first behavior where the condition evaluates to true
     * @param {object} tokens - Request url parameters, querystring parameters, and other info related to the request
     */
    async __processConditionalBehaviors(tokens) {
        for (var i in this.__route.conditionalBehaviors) {
            var behavior = this.__route.conditionalBehaviors[i]
            var condition = behavior.condition
            condition = parseTokens(condition, tokens)
            if (eval(condition) == true) {
                if (behavior.responseDelay) {
                    await timeout(behavior.responseDelay)
                }
                return {
                    status: behavior.status,
                    body: this.__processBodyTokens(behavior.body, tokens)
                }
            }
        }
    }
}

/**
 * Javascript setTimeout does not use Promises so it doesn't work with async/await operators
 * @param {number} ms 
 */
function timeout(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Merge properties from src to obj
 * @param {object} obj 
 * @param {object} src 
 * @param {string} prependKey
 */
function merge(obj, src, prependKey = '') {
    for (let k in src) {
        obj[prependKey + k] = src[k]
    }
}

/**
 * Parse the tokens in a string
 * @param {string} s 
 * @param {array} tokens 
 */
function parseTokens(s, tokens) {
    for (let k in tokens) {
        var regex = new RegExp('\{(' + k + ')\}')
        s = s.replace(regex, tokens[k])
    }
    return s
}

/**
 * Get a random integer between min and max inclusive of both
 * @param {number} min 
 * @param {number} max 
 */
function getRandomIntInclusive(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

/**
 * Flattens an object into single-depth
 * @param {object} ob 
 */
function flattenObject(ob) {
    var toReturn = {}
    for (var i in ob) {
        if (!ob.hasOwnProperty(i)) continue
        if ((typeof ob[i]) == 'object') {
            var flatObject = flattenObject(ob[i])
            for (var x in flatObject) {
                if (!flatObject.hasOwnProperty(x)) continue
                toReturn[i + '.' + x] = flatObject[x]
            }
        } else {
            toReturn[i] = ob[i]
        }
    }
    return toReturn
}