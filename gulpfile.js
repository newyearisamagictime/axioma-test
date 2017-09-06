let gulp = require('gulp');
let stylus = require('gulp-stylus');
let concat = require('gulp-concat');
let rename = require('gulp-rename');
let pug = require('gulp-pug');
let postcss = require('gulp-postcss');
let autoprefixer = require('autoprefixer');

function wrapPipe(taskFn) {
    return function(done) {
        let onSuccess = function() {
            done();
        };
        let onError = function(err) {
            done(err);
        };
        let outStream = taskFn(onSuccess, onError);
        if(outStream && typeof outStream.on === 'function') {
            outStream.on('end', onSuccess);
        }
    }
}



/** ---------- html ---------- **/

gulp.task('merge-components', wrapPipe(function (success, error) {
    return gulp.src('./src/components/**/component.pug')
        .pipe(concat('components.pug').on('error', error))
        .pipe(gulp.dest('./src/components/'));
}));

gulp.task('render-pages', wrapPipe(function (success, error) {
    return gulp.src('./src/pages/*/page.pug')
        .pipe(rename(function (path) {
            path.basename = path.dirname;
            path.dirname = './public/';
            path.extname = ".html"
        }).on('error', error))
        .pipe(pug({
            pretty: true
        }).on('error', error))
        .pipe(gulp.dest('./'));
}));

gulp.task('components-watch', function() {
    return gulp.watch('./src/components/**/component.pug', ['merge-components']);
});

gulp.task('pages-watch', function() {
    return gulp.watch([
        './src/components/components.pug',
        './src/pages/**/page.pug',
        './src/layouts/**/layout.pug'
    ], ['render-pages']);
});

gulp.task('templates-watch', ['components-watch', 'pages-watch']);


/** ---------- css ---------- **/

gulp.task('merge-components-stylesheets', wrapPipe(function (success, error) {
    return gulp.src('./src/components/**/style.styl')
        .pipe(concat('styles.styl').on('error', error))
        .pipe(gulp.dest('./src/components/'));
}));

gulp.task('convert-layouts-stylesheets', wrapPipe(function (success, error) {
    return gulp.src('./src/layouts/*/style.styl')
        .pipe(stylus().on('error', error))
        .pipe(postcss([ autoprefixer({
            browsers: [
                '> 5%',
                'ff > 1',
                'Chrome > 20',
                'ie > 7',
                'Opera > 10'
            ]
        }) ]))
        .pipe(rename(function (path) {
            path.basename = path.dirname;
            path.dirname = './public/css/';
            path.extname = ".css"
        }).on('error', error))
        .pipe(gulp.dest('./'));
}));


gulp.task('components-stylesheets-watch', function() {
    return gulp.watch('./src/components/**/*.styl', ['merge-components-stylesheets']);
});

gulp.task('layouts-stylesheets-watch', function() {
    return gulp.watch([
        './src/components/styles.styl',
        './src/layouts/*/*.styl'
    ], ['convert-layouts-stylesheets']);
});

gulp.task('stylesheet-watch', ['components-stylesheets-watch', 'layouts-stylesheets-watch']);


gulp.task('watch', ['templates-watch', 'stylesheet-watch']);
