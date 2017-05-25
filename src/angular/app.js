const angular = require('angular'),
    aria = require('angular-aria'),
    animate = require('angular-animate'),
    messages = require('angular-messages'),
    material = require('angular-material'),
    formController = require('./formController'),
    hyperwatch = require('hyperwatch')({
        mini: {
            position: 'top right',
            size: '100x100',
            fontSize: 3
        }
    })
/**
 * Initialize angular application
 */
var app = angular.module('supermockapi', ['ngMaterial'])
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
/**
 * Enable tabs in textareas
 */
var textareas = document.getElementsByTagName('textarea');
var count = textareas.length;
for (var i = 0; i < count; i++) {
    textareas[i].onkeydown = function (e) {
        if (e.keyCode == 9 || e.which == 9) {
            e.preventDefault();
            var s = this.selectionStart;
            this.value = this.value.substring(0, this.selectionStart) + "\t" + this.value.substring(this.selectionEnd);
            this.selectionEnd = s + 1;
        }
    }
}