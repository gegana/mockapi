const util = require('util')

var counter = {}

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

            if (!(req.originalUrl in counter)) {
                counter[req.originalUrl] = 0
            }
            counter[req.originalUrl] += 1

            tokens.calls = counter[req.originalUrl]

            var status = this.__route.status,
                body = this.__processBodyTokens(this.__route.body, tokens)

            if (this.__route.conditionalBehaviors && Array.isArray(this.__route.conditionalBehaviors)) {
                var behavior = this.__processConditionalBehaviors(tokens, status, body)
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
    __processConditionalBehaviors(tokens) {
        for (var i in this.__route.conditionalBehaviors) {
            var behavior = this.__route.conditionalBehaviors[i]
            var condition = behavior.condition
            condition = parseTokens(condition, tokens)
            if (eval(condition) == true) {
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
 */
function merge(obj, src) {
    for (let k in src) {
        obj[k] = src[k]
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