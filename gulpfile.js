const gulp = require('gulp');
const uglify = require('gulp-uglify');
const util = require('gulp-util');
const watch = require('gulp-watch');
const clean = require('gulp-clean');

gulp.task('uglify', () => {
  gulp.src('client/*.js')
      .pipe(uglify().on('error', util.log))
      .pipe(gulp.dest('public/js'));
});

gulp.task('clean', () => {
  return gulp.src('public/js', { read: false })
             .pipe(clean());
});

gulp.task('js', ['clean', 'uglify']);

gulp.task('watch', () => {
  gulp.watch('client/*.js', ['uglify']);
});
