'use strict';

const gulp = require('gulp');
const uglify = require('gulp-uglify');
const util = require('gulp-util');
const watch = require('gulp-watch');
const clean = require('gulp-clean');
const nodemon = require('gulp-nodemon');

gulp.task('uglify', ['clean'], () => {
  return gulp.src('client/*.js')
      .pipe(uglify().on('error', util.log))
      .pipe(gulp.dest('public/js'));
});

gulp.task('lib', ['clean'], () => {
  return gulp.src('lib/*.js')
      .pipe(gulp.dest('public/js'));
});

gulp.task('clean', () => {
  return gulp.src('public/js', { read: false })
             .pipe(clean());
});

gulp.task('js', ['clean', 'uglify', 'lib']);

gulp.task('server', ['js'], () => {
  return nodemon({
    script: 'index.js',
    watch: 'server/*.js'
  });
});
