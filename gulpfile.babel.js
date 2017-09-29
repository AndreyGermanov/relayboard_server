var gulp = require('gulp'),
    babelify = require('babelify'),
    browserify = require('browserify'),
    glob = require('glob'),
    source = require('vinyl-source-stream'),
    connect = require('gulp-connect'),
    server = require('gulp-develop-server'),
    jshint = require('gulp-jshint');


function get_files(path,callback) {
    glob(path, function(err, files) {
        if (!err) { 
            callback(files);
        } else {
            console.log(err);
        }
    })
}

gulp.task( 'server:start', function() {
    server.listen( {path:'./index.js'} );
});

gulp.task('bundle', function() {
    return get_files('./app/client/**/*.*', function(files) {
        return browserify(files)
            .transform(babelify,{presets: ["es2015", "react"]})
            .bundle()
            .pipe(source('app.min.js'))
            .pipe(gulp.dest('./public/js'))
    })
})

gulp.task('lint', function() {
    return get_files('./app/**/*.*', function (files) {
        return gulp.src(files)
            .pipe(jshint())
            .pipe(jshint.reporter('default'))
    })
})

// run server
gulp.task( 'default', ['bundle'], function() {
    get_files('./app/client/**/*.*', function(files) {
        return gulp.watch(files,['bundle']);
    })

});