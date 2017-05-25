module.exports = [
    '$scope',
    '$http',
    function ($scope, $http) {
        $scope.route = {}
        $scope.route.conditionalBehaviors = []
        $scope.httpVerbs = [
            'GET',
            'POST',
            'PUT',
            'DELETE'
        ]
        $scope.httpStatusCodes = [{
                code: 100,
                description: 'Continue'
            },
            {
                code: 101,
                description: 'Switching Protocols'
            },
            {
                code: 102,
                description: 'Processing'
            },
            {
                code: 200,
                description: 'OK'
            },
            {
                code: 201,
                description: 'Created'
            },
            {
                code: 202,
                description: 'Accepted'
            },
            {
                code: 203,
                description: 'Non-Authoritative Information'
            },
            {
                code: 204,
                description: 'No Content'
            },
            {
                code: 205,
                description: 'Reset Content'
            },
            {
                code: 206,
                description: 'Partial Content'
            },
            {
                code: 207,
                description: 'Multi-Status'
            },
            {
                code: 208,
                description: 'Already Reported'
            },
            {
                code: 226,
                description: 'IM Used'
            },
            {
                code: 300,
                description: 'Multiple Choices'
            },
            {
                code: 301,
                description: 'Moved Permanently'
            },
            {
                code: 302,
                description: 'Found'
            },
            {
                code: 303,
                description: 'See Other'
            },
            {
                code: 304,
                description: 'Not Modified'
            },
            {
                code: 305,
                description: 'Use Proxy'
            },
            {
                code: 306,
                description: 'Switch Proxy'
            },
            {
                code: 307,
                description: 'Temporary Redirect'
            },
            {
                code: 308,
                description: 'Permanent Redirect'
            },
            {
                code: 400,
                description: 'Bad Request'
            },
            {
                code: 401,
                description: 'Unauthorized'
            },
            {
                code: 402,
                description: 'Payment Required'
            },
            {
                code: 403,
                description: 'Forbidden'
            },
            {
                code: 404,
                description: 'Not Found'
            },
            {
                code: 405,
                description: 'Method Not Allowed'
            },
            {
                code: 406,
                description: 'Not Acceptable'
            },
            {
                code: 407,
                description: 'Proxy Authentication Required'
            },
            {
                code: 408,
                description: 'Request Timeout'
            },
            {
                code: 409,
                description: 'Conflict'
            },
            {
                code: 410,
                description: 'Gone'
            },
            {
                code: 411,
                description: 'Length Required'
            },
            {
                code: 412,
                description: 'Precondition Failed'
            },
            {
                code: 413,
                description: 'Request Entity Too Large'
            },
            {
                code: 414,
                description: 'Request-URI Too Long'
            },
            {
                code: 415,
                description: 'Unsupported Media Type'
            },
            {
                code: 416,
                description: 'Requested Range Not Satisfiable'
            },
            {
                code: 417,
                description: 'Expectation Failed'
            },
            {
                code: 419,
                description: 'Authentication Timeout'
            },
            {
                code: 420,
                description: 'Enhance Your Calm'
            },
            {
                code: 422,
                description: 'Unprocessable Entity'
            },
            {
                code: 423,
                description: 'Locked'
            },
            {
                code: 424,
                description: 'Failed Dependency'
            },
            {
                code: 426,
                description: 'Upgrade Required'
            },
            {
                code: 428,
                description: 'Precondition Required'
            },
            {
                code: 429,
                description: 'Too Many Requests'
            },
            {
                code: 431,
                description: 'Request Header Fields Too Large'
            },
            {
                code: 444,
                description: 'No Response'
            },
            {
                code: 449,
                description: 'Retry With'
            },
            {
                code: 450,
                description: 'Blocked by Windows Parental Controls'
            },
            {
                code: 451,
                description: 'Redirect'
            },
            {
                code: 494,
                description: 'Request Header Too Large'
            },
            {
                code: 495,
                description: 'Cert Error'
            },
            {
                code: 496,
                description: 'No Cert'
            },
            {
                code: 497,
                description: 'HTTP to HTTPS'
            },
            {
                code: 500,
                description: 'Internal Server Error'
            },
            {
                code: 501,
                description: 'Not Implemented'
            },
            {
                code: 502,
                description: 'Bad Gateway'
            },
            {
                code: 503,
                description: 'Service Unavailable'
            },
            {
                code: 504,
                description: 'Gateway Timeout'
            },
            {
                code: 505,
                description: 'HTTP Version Not Supported'
            },
            {
                code: 506,
                description: 'Variant Also Negotiates'
            },
            {
                code: 507,
                description: 'Insufficient Storage'
            },
            {
                code: 508,
                description: 'Loop Detected'
            },
            {
                code: 509,
                description: 'Bandwidth Limit Exceeded'
            },
            {
                code: 510,
                description: 'Not Extended'
            },
            {
                code: 511,
                description: 'Network Authentication Required'
            }
        ]

        $http.get('/mockapi/route').then(function (response) {
            $scope.routes = response.data
        })

        $scope.remove = (route) => {
            $http.delete('/mockapi/route/' + route._id).then(function (response) {
                $http.get('/mockapi/route').then(function (response) {
                    $scope.routes = response.data
                    $scope.$apply
                })
            })
        }
        $scope.addConditionalBehavior = () => {
            $scope.route.conditionalBehaviors.push({})
            $scope.$apply
        }
        $scope.removeConditionalBehavior = (index) => {
            $scope.route.conditionalBehaviors.splice(index, 1)
            $scope.$apply
        }
        $scope.send = (route) => {
            $scope.sendClicked = true
            var parsedRoute = Object.assign({}, route)
            if ($scope.routeForm.$valid) {
                if (parsedRoute.body) {
                    try {
                        parsedRoute.body = JSON.parse(parsedRoute.body)
                        $scope.jsonParseError = false
                    } catch (err) {
                        $scope.jsonParseError = true
                        return
                    }
                }
                for (var key in parsedRoute.conditionalBehaviors) {
                    if (parsedRoute.conditionalBehaviors[key].body) {
                        try {
                            parsedRoute.conditionalBehaviors[key].body = JSON.parse(parsedRoute.conditionalBehaviors[key].body)
                            $scope.jsonParseError = false
                        } catch (err) {
                            $scope.jsonParseError = true
                            return
                        }
                    }
                }
                $http({
                    method: 'POST',
                    url: '/mockapi/route',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    data: parsedRoute
                }).then(function (response) {
                    $http.get('/mockapi/route').then(function (response) {
                        $scope.routes = response.data
                        $scope.$apply
                    })
                    $scope.route = {
                        conditionalBehaviors: []
                    }
                    $scope.routeForm.$setUntouched()
                    $scope.routeForm.$setPristine()
                    $scope.sendClicked = false
                })
            }
        }
    }
]