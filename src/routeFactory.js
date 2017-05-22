"use strict"

const getParameterNames = require('get-parameter-names')

module.exports = class RouteFactory {
    constructor() {
        this.__router = require('express').Router() // instantiate a new router
        this.__services = {}
    }

    /**
     * Express js router instance
     */
    get router() {
        return this.__router
    }

    /**
     * All service dependencies
     */
    get services() {
        return this.__services
    }

    /**
     * Register a route 
     * @param {string} method - The following: GET, POST, PUT, DELETE, or *.
     * @param {string|RegExp|(string|RegExp)[]} path  - An expression matching a path.
     * @param {object} handler - Function that resolves a route request.
     */
    register(method, path, handler) {
        var parameters = getParameterNames(handler)
        parameters.splice(0, 3)
        var args = []
        for (let key in parameters) {
            var param = parameters[key]
            var arg = this.__services[param]
            if (!arg) {
                throw new Error('Cannot resolve dependency ' + param)
            }
            args.push(arg)
        }
        switch (method) {
            case 'GET':
                this.__router.get(path, function (req, res, next) {
                    handler.apply(null, [req, res, next].concat(args))
                })
                break
            case 'POST':
                this.__router.post(path, function (req, res, next) {
                    handler.apply(null, [req, res, next].concat(args))
                })
                break
            case 'PUT':
                this.__router.put(path, function (req, res, next) {
                    handler.apply(null, [req, res, next].concat(args))
                })
                break
            case 'DELETE':
                this.__router.delete(path, function (req, res, next) {
                    handler.apply(null, [req, res, next].concat(args))
                })
                break
            case '*':
                this.__router.use(path, function (req, res, next) {
                    handler.apply(null, [req, res, next].concat(args))
                })
                break
            default:
                throw new Error('Un-supported method ' + method)
        }
    }

    /**
     * Define a service dependency, if not already defined
     * @param {string} key 
     * @param {object} service 
     */
    tryUseService(key, service) {
        if (!(key in this.__services)) {
            this.__services[key] = service
        }
    }

    /**
     * Define a service dependency or overwrite existing
     * @param {string} key 
     * @param {object} service 
     */
    useService(key, service) {
        this.__services[key] = service
    }
}