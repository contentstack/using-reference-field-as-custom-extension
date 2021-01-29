const gulp = require('gulp');
const gulpStylelint = require('gulp-stylelint');
const eslint = require('gulp-eslint');
const rename = require('gulp-rename');
var inlinesource = require('gulp-inline-source');

gulp.task('lint-js', () => {
  return gulp.src('source/*.js')
    .pipe(eslint())
    .pipe(eslint.format())
    .pipe(eslint.failAfterError());
});

gulp.task('lint-css', () => {
  return gulp
    .src('source/*.css')
    .pipe(gulpStylelint({
      config: {
        extends: 'stylelint-config-standard'
      },
      reporters: [{
        formatter: 'string',
        console: true
      }],
      failAfterError: false
    }));
});

gulp.task('inline', () => {
  return gulp.src('./source/index.html')
    .pipe(inlinesource())
    .pipe(rename(path => {
      path.basename = 'index';
      path.extname = '.html';
    }))
    .pipe(gulp.dest('./'));
});

gulp.task('inline-redirect', () => {
  return gulp.src('./source/window.html')
    .pipe(inlinesource())
    .pipe(gulp.dest('./'));
});

gulp.task('build', gulp.series('lint-js', 'lint-css', 'inline', 'inline-redirect'));

gulp.task('watch', () => {
  gulp.watch('source/*', gulp.series('build'));
});

gulp.task('default', gulp.series('build'));
