'use strict';

const gulp = require('gulp');
const uglify = require('gulp-uglify');
const util = require('gulp-util');
const clean = require('gulp-clean');
const nodemon = require('gulp-nodemon');
const browserify = require('browserify');
const source = require('vinyl-source-stream');
const buffer = require('vinyl-buffer');

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

gulp.task('browserify', ['clean'], () => {
  const bundler = browserify({ entries: './client/game.js' });
  const stream = bundler.bundle();
  stream.pipe(source('game.js'))
        .pipe(buffer())
        .pipe(uglify())
        .pipe(uglify().on('error', util.log))
        .pipe(gulp.dest("./public/js"));
});


gulp.task('js', ['clean', 'browserify', 'lib']);

gulp.task('server', ['js'], () => {
  return nodemon({
    script: 'index.js',
    watch: 'server/*.js'
  });
});
