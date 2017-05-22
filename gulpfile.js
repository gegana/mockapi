var gulp = require('gulp'),
    bundler = require('browserify'),
    source = require('vinyl-source-stream'),
    nodemon = require('gulp-nodemon')

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

gulp.task('node', function () {
  nodemon({
    script: './bin/www'
  })
})

gulp.task('run', ['build', 'node'])