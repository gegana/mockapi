module.exports = function (req, res, next) {
    var error = new Error('Not Found')
    error.status = 404
    next(error)
}