const angular = require('angular'),
    aria = require('angular-aria'),
    animate = require('angular-animate'),
    messages = require('angular-messages'),
    material = require('angular-material'),
    formController = require('./formController'),
    hyperwatch = require('hyperwatch')({
        mini: {
            position: 'bottom left',
            size: '100x100',
            fontSize: 3
        }
    })

var app = angular.module('mockapi', ['ngMaterial'])
    .config(function ($interpolateProvider) {
        $interpolateProvider.startSymbol('{[{').endSymbol('}]}')
    })
    .config(function ($mdThemingProvider) {
        $mdThemingProvider.theme('default')
            .primaryPalette('amber')
            .accentPalette('light-green')
            .dark()
    })
    .controller('FormController', formController)