const gulp = require('gulp');
const uglify = require('gulp-uglify');
const util = require('gulp-util');

gulp.task('js', () => {
  gulp.src('client/*.js')
      .pipe(uglify().on('error', util.log))
      .pipe(gulp.dest('public/js'));
});
