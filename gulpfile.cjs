let beautify = require('gulp-beautify');
let fs = require('fs');
let gulp = require('gulp');
let header = require('gulp-header');
let less = require('gulp-less');
let path = require('path');
let rename = require('gulp-rename');
let stripCssComments = require('gulp-strip-css-comments').default;

let css = require('./tasks/css.cjs');
let js = require('./tasks/js.cjs');
let scss = require('./tasks/scss.cjs');

// Vars
let pkg = require('./package.json');
let now = new Date();
let year = now.getFullYear();
let date = [year, now.getMonth() + 1, now.getDate()].map((n) => String(n).padStart(2, '0')).join('-');
let banner = '/*! <%= pkg.name %> v<%= pkg.version %> [<%= filename %>] <%= date %> |' +
  ' <%= pkg.license %> License | <%= pkg.homepage_short %> */\n';

// Clean

gulp.task('clean', (done) => {
  for (let dir of ['dist', 'src/css', 'src/scss']) {
    for (let file of fs.readdirSync(dir)) {
      fs.rmSync(path.join(dir, file), { recursive: true, force: true });
    }
  }

  done();
});

// Keep dist/ CommonJS: the package is "type": "module", but the UMD bundles are loaded with require()
gulp.task('dist-scope', (done) => {
  fs.writeFileSync('dist/package.json', JSON.stringify({ type: 'commonjs' }, null, 2) + '\n');

  done();
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

// Less (see tasks/css.cjs)
gulp.task('bundle-styles', () => {
  return gulp.src('./src/less/index.less')
    .pipe(less({
      // plugins: [ new lessImportNPM() ],
      // globalVars: pkg.src.vars
    }))
    .pipe(css.minify())
    .pipe(header(banner, {
      pkg: pkg,
      date: date
    }))
    .pipe(rename('formstone.css'))
    .pipe(gulp.dest('./dist/'));
});

// Adds the banner to a built file in dist/
let bannerTask = (file) => {
  return () => {
    return gulp.src(`./dist/${file}`)
      .pipe(header(banner, {
        pkg: pkg,
        date: date
      }))
      .pipe(gulp.dest('./dist'));
  };
};

// JS (see tasks/js.cjs)
gulp.task('bundle-scripts', gulp.series(
  js.bundle({
    entry: './src/js/index.js',
    filename: 'formstone.js'
  }),
  bannerTask('formstone.js')
));

// jQuery (see tasks/js.cjs)
gulp.task('bundle-scripts-jq', gulp.series(
  js.bundle({
    entry: './src/jquery/index.js',
    filename: 'formstone.jquery.js',
    externals: {
      jquery: 'jQuery'
    }
  }),
  bannerTask('formstone.jquery.js')
));

// Convert Less to CSS
gulp.task('convert-css', () => {
  return gulp.src(['./src/less/**/*.less'])
    .pipe(less({
      // plugins: [ new lessImportNPM() ],
      // globalVars: pkg.src.vars
    }))
    .pipe(stripCssComments())
    .pipe(css.removeEmptyLines())
    .pipe(beautify.css({
      indent_size: 2,
    }))
    .pipe(header(banner, {
      pkg: pkg,
      date: date
    }))
    .pipe(gulp.dest('./src/css'));
});

// Convert Less to SCSS (see tasks/scss.cjs)
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

// Verify SCSS (see tasks/scss.cjs)
gulp.task('verify-scss', () => {
  return scss.verify('./src/less', './src/scss');
});

// License
gulp.task('license', function(done) {
  return fs.readFile('tasks/gpl.txt', function(err, data) {
    let content = 'Formstone \n\n' +
      'Copyright ' + year + ' ' + pkg.author.name + ' \n\n' +
      data;

    fs.writeFile('license.txt', content, function() {});

    done();
  });
});

// Tasks

gulp.task('default', gulp.series([
  'clean',
  'dist-scope',
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