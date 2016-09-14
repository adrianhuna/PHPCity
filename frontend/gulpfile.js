const gulp = require('gulp');
const browserify = require('browserify');
const source = require('vinyl-source-stream');
const watchify = require('watchify');
const tsify = require('tsify');
const uglify = require('gulp-uglify');
const sourcemaps = require('gulp-sourcemaps');
const buffer = require('vinyl-buffer');
const gutil = require('gulp-util');
const mainBowerFiles = require('gulp-main-bower-files');
const filter = require('gulp-filter');
const concat = require('gulp-concat');
const cleanCSS = require('gulp-clean-css');
const del = require('del');
const sass = require('gulp-sass');
const rev = require('gulp-rev');
const revReplace = require('gulp-rev-replace');

var paths = {
  pages: ['src/*.html', 'src/*.ico'],
  css: ['src/css/*.css']
};

var watchedBrowserify = watchify(browserify({
  basedir: '.',
  debug: true,
  entries: [
    'src/scripts/blocks.ts',
    'src/scripts/helpers.ts',
    'src/scripts/histogram.ts',
    'src/scripts/interfaces.ts',
    'src/scripts/main.ts',
    'src/scripts/preprocessor.ts',
    'src/scripts/scene_manager.ts',
    'src/scripts/stats.ts',
  ],
  cache: {},
  packageCache: {}
}).plugin(tsify));

gulp.task('copy-html', function () {
  return gulp.src(paths.pages)
    .pipe(gulp.dest('dist'));
});

gulp.task('styles', function () {
  return gulp.src('src/**/*.scss')
    .pipe(sass().on('error', sass.logError))
    .pipe(gulp.dest('dist/'));
});

gulp.task('copy-fonts', function () {
  return gulp.src('./bower_components/font-awesome/fonts/**.*')
    .pipe(gulp.dest('dist/fonts'));
});

gulp.task('vendor-css', function () {
  return gulp.src('./bower.json')
    .pipe(mainBowerFiles())
		.pipe(filter('**/*.css'))
		.pipe(concat('vendor.min.css'))
		.pipe(cleanCSS())
		.pipe(gulp.dest('dist/css'));
});

gulp.task('vendor-js', function () {
  return gulp.src('./bower.json')
    .pipe(mainBowerFiles())
    .pipe(filter('**/*.js'))
    .pipe(concat('vendor.min.js'))
    .pipe(uglify())
    .pipe(gulp.dest('dist/js'));
});

gulp.task('clean', function (done) {
  return del(['./dist/**/*', '!./dist/data/', '!./dist/data{,/**}'], { force: true }, done);
});

gulp.task('watch', function() {
  gulp.watch('src/**/*.scss', ['styles']);
  gulp.watch('src/**/*.html', ['copy-html']);
});

gulp.task("revision", ['build'], function(){
  return gulp.src(["dist/**/*.css", "dist/**/*.js"])
    .pipe(rev())
    .pipe(gulp.dest('dist'))
    .pipe(rev.manifest())
    .pipe(gulp.dest('dist'))
})

gulp.task("revreplace", ['revision'], function(){
  var manifest = gulp.src("./dist/rev-manifest.json");

  return gulp.src('src/index.html')
    .pipe(revReplace({manifest: manifest}))
    .pipe(gulp.dest('dist'));
});

function bundle() {
  gulp.start('build');

  return watchedBrowserify
    .bundle()
    .pipe(source('bundle.js'))
    .pipe(buffer())
    .pipe(sourcemaps.init({loadMaps: true}))
    .pipe(uglify())
    .pipe(sourcemaps.write('./'))
    .pipe(gulp.dest('dist/js'));
}

function dist() {
  watchedBrowserify
    .bundle()
    .pipe(source('bundle.js'))
    .pipe(buffer())
    .pipe(sourcemaps.init({loadMaps: true}))
    .pipe(uglify())
    .pipe(sourcemaps.write('./'))
    .pipe(gulp.dest('dist/js'));

  gulp.start('revreplace');
}

gulp.task('default', ['clean'], bundle);
gulp.task('build:dist', ['clean'], dist);

gulp.task('build', ['watch', 'copy-html', 'styles', 'copy-fonts', 'vendor-css', 'vendor-js']);

watchedBrowserify.on('update', bundle);
watchedBrowserify.on('log', gutil.log);
