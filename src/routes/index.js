const version = require('../../package.json').version

module.exports = {
  method: 'GET',
  path: '/',
  handler: function (req, res, next, mongodb) {
    res.render('index', {
      title: 'Mockapi v' + version
    })
  }
}