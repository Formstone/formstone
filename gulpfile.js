let autoprefixer = require('gulp-autoprefixer');
let clean = require('gulp-clean');
let beautify = require('gulp-beautify');
let cleanCSS = require('gulp-clean-css');
let dayjs = require('dayjs');
let fs = require('fs');
let gulp = require('gulp');
let header = require('gulp-header');
let less = require('gulp-less');
let rename = require('gulp-rename');
// let strip = require('gulp-strip-comments');
let stripCssComments = require('gulp-strip-css-comments').default;
var removeEmptyLines = require('gulp-remove-empty-lines');
let webpack = require('webpack-stream');

let scss = require('./tasks/scss.js');

// Vars
let pkg = require('./package.json');
let date = dayjs().format('YYYY-MM-DD');
let banner = '/*! <%= pkg.name %> v<%= pkg.version %> [<%= filename %>] <%= date %> |' +
  ' <%= pkg.license %> License | <%= pkg.homepage_short %> */\n';

// Clean

gulp.task('clean', () => {
  return gulp.src(['dist/*', /*, 'docs/*',*/ 'src/css/*', 'src/scss/*' ], { read: false })
    .pipe(clean());
});

// Beautify Scripts
gulp.task('beautify-scripts', () => {
  return gulp.src(['./src/js/*'])
    .pipe(beautify({
      indent_size: 2,
    }))
    .pipe(gulp.dest('./src/js'));
});

// Beautify Scripts jQuery
gulp.task('beautify-scripts-jq', () => {
  return gulp.src(['./src/jquery/*'])
    .pipe(beautify({
      indent_size: 2,
    }))
    .pipe(gulp.dest('./src/jquery'));
});

// Beautify Styles
gulp.task('beautify-styles', () => {
  return gulp.src(['./src/less/*'])
    .pipe(beautify.css({
      indent_size: 2,
    }))
    .pipe(gulp.dest('./src/less'));
});

// Less
gulp.task('bundle-styles', () => {
  return gulp.src('./src/less/index.less')
    .pipe(less({
      // plugins: [ new lessImportNPM() ],
      // globalVars: pkg.src.vars
    }))
    .pipe(autoprefixer())
    .pipe(cleanCSS({
      // compatibility: 'ie10'
    }))
    .pipe(header(banner, {
      pkg: pkg,
      date: date
    }))
    .pipe(rename('formstone.css'))
    .pipe(gulp.dest('./dist/'));
});

// JS
gulp.task('bundle-scripts', () => {
  return gulp.src('./src/js/index.js')
    .pipe(webpack({
      mode: process.env.NODE_ENV || 'production',
      entry: './src/js/index.js',
      output: {
        path: __dirname + '/dist/js',
        filename: 'formstone.js',
        globalObject: 'window',
        library: {
          name: 'Formstone',
          type: 'umd'
        }
      }
    }))
    .pipe(header(banner, {
      pkg: pkg,
      date: date
    }))
    .pipe(gulp.dest('./dist'));
});

// jQuery
gulp.task('bundle-scripts-jq', () => {
  return gulp.src('./src/jquery/index.js')
    .pipe(webpack({
      mode: process.env.NODE_ENV || 'production',
      entry: './src/jquery/index.js',
      externals: {
        jquery: 'jQuery'
      },
      output: {
        path: __dirname + '/dist/js',
        filename: 'formstone.jquery.js',
        globalObject: 'window',
        library: {
          name: 'Formstone',
          type: 'umd'
        }
      }
    }))
    .pipe(header(banner, {
      pkg: pkg,
      date: date
    }))
    .pipe(gulp.dest('./dist'));
});

// Convert Less to CSS
gulp.task('convert-css', () => {
  return gulp.src(['./src/less/**/*.less'])
    .pipe(less({
      // plugins: [ new lessImportNPM() ],
      // globalVars: pkg.src.vars
    }))
    .pipe(stripCssComments())
    .pipe(removeEmptyLines())
    .pipe(beautify.css({
      indent_size: 2,
    }))
    .pipe(header(banner, {
      pkg: pkg,
      date: date
    }))
    .pipe(gulp.dest('./src/css'));
});

// Convert Less to SCSS (see tasks/scss.js)
gulp.task('convert-scss', () => {
  return gulp.src(['./src/less/**/*.less'])
    .pipe(scss.convert())
    .pipe(beautify.css({
      indent_size: 2,
    }))
    .pipe(header(banner, {
      pkg: pkg,
      date: date
    }))
    .pipe(gulp.dest('./src/scss'));
});

// Verify SCSS (see tasks/scss.js)
gulp.task('verify-scss', () => {
  return scss.verify('./src/less', './src/scss');
});

// License
gulp.task('license', function(done) {
  return fs.readFile('tasks/gpl.txt', function(err, data) {
    let content = 'Formstone \n\n' +
      'Copyright ' + dayjs().format('YYYY') + ' ' + pkg.author.name + ' \n\n' +
      data;

    fs.writeFile('license.txt', content, function() {});

    done();
  });
});

// Tasks

gulp.task('default', gulp.series([
  'clean',
  'beautify-scripts',
  'beautify-styles',
  'bundle-scripts',
  'bundle-styles',
  //
  'beautify-scripts-jq',
  'bundle-scripts-jq',
  //
  'convert-css',
  'convert-scss',
  'verify-scss',
  'license',
]));

gulp.task('dev', gulp.series(['default', (done) => {
  gulp.watch('./src/less/**/*.less', { cwd: './' }, gulp.series(['bundle-styles']));
  gulp.watch(['./src/js/**/*.js','./src/jquery/**/*.js'], { cwd: './' }, gulp.series(['bundle-scripts', 'bundle-scripts-jq']));
}]));