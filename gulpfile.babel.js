var gulp = require('gulp'),
    babelify = require('babelify'),
    browserify = require('browserify'),
    glob = require('glob'),
    source = require('vinyl-source-stream'),
    connect = require('gulp-connect'),
    server = require('gulp-develop-server');

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
    return get_files('./public/js/app/client/**/*.*', function(files) {
        return browserify(files)
            .transform(babelify,{presets: ["es2015", "react"]})
            .bundle()
            .pipe(source('app.min.js'))
            .pipe(gulp.dest('./public/js'))
    })
})

// run server
gulp.task( 'default', ['server:start'], function() {
    get_files('./public/js/app/client/**/*.*', function(files) {
        return gulp.watch(files,['bundle']);
    })
    get_files('./public/js/app/server/**/*.*', function(files) {
        return gulp.watch(files,server.restart);
    })

});