const gulp = require('gulp');

gulp.task('copy', () => {
  gulp.src('client/*.js')
      .pipe(gulp.dest('public/js'));
});
