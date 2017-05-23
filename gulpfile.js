var gulp = require('gulp'),
    bundler = require('browserify'),
    source = require('vinyl-source-stream'),
    nodemon = require('gulp-nodemon'),
    argv = require('yargs').argv

gulp.task('bundle', function () {
    return bundler('./src/angular/app.js')
        .bundle()
        .pipe(source('app.js'))
        .pipe(gulp.dest('./src/public/javascripts/'))
})

gulp.task('watch', function () {
    gulp.watch('./src/angular/*.js', ['bundle'])
})

gulp.task('build', ['bundle'])

gulp.task('default', ['build', 'watch'])

gulp.task('run', ['build'], function () {
    var args = []
    if (argv.f) {
        args.push('-f')
        args.push(argv.f)
    }
    if (argv.s) {
        args.push('-s')
    }
    nodemon({
        script: './bin/www',
        args: args
    })
})