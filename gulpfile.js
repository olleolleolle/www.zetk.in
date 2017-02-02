'use strict';

var babel = require('gulp-babel');
var concat = require('gulp-concat');
var del = require('del');
var gulp = require('gulp');
var imagemin = require('gulp-imagemin');
var newer = require('gulp-newer');
var sass = require('gulp-sass');
var shell = require('gulp-shell');
var rename = require('gulp-rename');
var runSequence = require('run-sequence');
var streamify = require('gulp-streamify');
var uglify = require('gulp-uglify');
var webpack = require('webpack');
var webpackConfig = require('./webpack.config.js');

const jsSrc = 'src/**/*.@(js|jsx)';
const jsDest = 'build/app';

gulp.task('cleanImages', function(cb) {
    return del([
        'build/static/images',
    ], cb);
});

gulp.task('cleanSass', function(cb) {
    return del([
        'build/static/css',
    ], cb);
});

gulp.task('cleanFonts', function(cb) {
    return del([
        'build/static/fonts',
    ], cb);
});

gulp.task('clean', function(cb) {
    return runSequence('cleanImages', 'cleanFonts', 'cleanSass', cb);
});

gulp.task('copyFonts', function() {
    return gulp.src('./static/fonts/**/*')
        .pipe(gulp.dest('./build/static/fonts'));
});

gulp.task('copyMessages', function() {
    return gulp.src('./locale/**/*')
        .pipe(gulp.dest('./build/locale'));
});

gulp.task('js', function() {
    const newerConfig = {
        dest: jsDest,
        ext: '.js'
    };

    return gulp.src(jsSrc)
        .pipe(newer(newerConfig))
        .pipe(babel())
        .pipe(gulp.dest(jsDest));
});

gulp.task('bundleJs', [ 'js' ], function(cb) {
    webpack(webpackConfig, function(err, stats) {
        if (err) {
            console.log('WEBPACK ERROR: ' + err);
        }

        cb();
    });
});

gulp.task('buildSass', [ 'cleanSass' ], function() {
    return gulp.src([
            'src/scss/_mixins.scss',
            'src/common/scss/_mixins.scss',
            'src/scss/_variables.scss',
            'src/scss/font-awesome/zetkin-font-awesome.scss',
            'src/scss/_global.scss',
            'src/!(scss)/**/*.scss',
        ])
        .pipe(concat('style.scss'))
        .pipe(sass())
        .pipe(gulp.dest('build/static/css'));
});

gulp.task('minifyImages', [ 'cleanImages' ], function() {
    return gulp.src('static/images/**/*')
        .pipe(imagemin())
        .pipe(gulp.dest('build/static/images'));
});

gulp.task('minify', function() {
    return gulp.src('build/static/js/main.js')
        .pipe(uglify())
        .pipe(gulp.dest('build/static/js'));
});

gulp.task('default', [ 'clean' ], function(cb) {
    return runSequence('bundleJs', 'buildSass',
        'minifyImages', 'copyFonts', 'copyMessages', cb);
});


gulp.task('watch', function() {
    var watch = require('gulp-watch');
    var watchOptions = {
        read: false,
        useFsEvents: true,
        interval: 1000,
        binaryInterval: 2000,
    };

    watch('src/**/*.@(js|jsx)', { read: false }, function() {
        return runSequence('bundleJs');
    });

    watch('src/**/*.scss', { read: false }, function() {
        return runSequence('buildSass');
    });

    watch('static/images/**/*', { read: false }, function() {
        return runSequence('minifyImages');
    });

    watch('static/fonts/**/*', { read: false }, function() {
        return runSequence('copyFonts');
    });

    watch('locale/**/*', { read: false }, function() {
        return runSequence('copyMessages');
    });
});

gulp.task('deploy', [ 'default' ], function(cb) {
    return runSequence('minify', cb);
});
