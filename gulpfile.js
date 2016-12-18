const gulp = require('gulp');
const sass = require('gulp-ruby-sass');
const autoprefixer = require('gulp-autoprefixer');
const cssnano = require('gulp-cssnano');
const jshint = require('gulp-jshint');
const uglify = require('gulp-uglify');
const imagemin = require('gulp-imagemin');
const rename = require('gulp-rename');
const concat = require('gulp-concat');
const notify = require('gulp-notify');
const cache = require('gulp-cache');
const livereload = require('gulp-livereload');
const del = require('del');
const inject = require('gulp-inject');
const order = require("gulp-order");



gulp.task('styles', function() {
    return sass('src/styles/main.scss', { style: 'expanded' })
        .pipe(autoprefixer('last 2 version'))
        .pipe(gulp.dest('dist/styles'))
        .pipe(rename({suffix: '.min'}))
        .pipe(cssnano())
        .pipe(gulp.dest('dist/styles'))
        .pipe(notify({ message: 'Styles task complete' }));
});

gulp.task('html', function() {
    return gulp.src('src/**/*.html')
        .pipe(gulp.dest('dist'))
        .pipe(notify({message: "HTML moved"}));
});

gulp.task('scripts', function() {
    return gulp.src('src/scripts/**/*.js')
        .pipe(order([
            "src/scripts/lib/**/*.js",
            "src/scripts/**/*.js"
        ]))
        // .pipe(jshint('.jshintrc'))
        // .pipe(jshint.reporter('default'))
        .pipe(concat('main.js'))
        .pipe(gulp.dest('dist/scripts'))
        .pipe(rename({suffix: '.min'}))
        // .pipe(uglify())
        .pipe(gulp.dest('dist/scripts'))
        .pipe(notify({ message: 'Scripts task complete' }));
});

gulp.task('images', function() {
    return gulp.src('src/images/**/*')
        .pipe(imagemin({ optimizationLevel: 3, progressive: true, interlaced: true }))
        .pipe(gulp.dest('dist/assets/img'))
        .pipe(notify({ message: 'Images task complete' }));
});

gulp.task('clean', function() {
    return del(['dist/assets/css', 'dist/assets/js', 'dist/assets/img']);
});

gulp.task('default', ['clean'], function() {
    gulp.start('styles', 'scripts', 'images', 'html', 'index');
});

gulp.task('index', function () {
    const target = gulp.src('./dist/index.html');
    // It's not necessary to read the files (will speed up things), we're only after their paths:
    const sources = gulp.src(['./dist/**/*.min.js', './dist/**/*.min.css'], {read: false});

    return target.pipe(inject(sources, {relative: true}))
        .pipe(gulp.dest('./dist'));
});

gulp.task('watch', function() {
    gulp.start('default');
    // Watch .scss files
    gulp.watch('src/styles/**/*.scss', ['styles']);
    // Watch .js files
    gulp.watch('src/scripts/**/*.js', ['scripts']);
    // Watch image files
    gulp.watch('src/images/**/*', ['images']);
    // Watch HTML files
    gulp.watch('src/**/*.html', ['html']);
    // Create LiveReload server
    livereload.listen();
    // Watch any files in dist/, reload on change
    gulp.watch(['dist/**']).on('change', livereload.changed);
});

