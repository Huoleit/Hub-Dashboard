"use strict";

// Load plugins
require('dotenv').config();
const autoprefixer = require("gulp-autoprefixer");
const browsersync = require("browser-sync").create();
const cleanCSS = require("gulp-clean-css");
const del = require("del");
const gulp = require("gulp");
const header = require("gulp-header");
const merge = require("merge-stream");
const plumber = require("gulp-plumber");
const rename = require("gulp-rename");
const sass = require("gulp-sass");
const uglify = require("gulp-uglify");
const babel = require("gulp-babel");
const concat = require('gulp-concat');
const nodemon = require('gulp-nodemon');
const replace = require('gulp-replace');

// Load package.json for banner
const pkg = require('./package.json');

// Set the banner content
const banner = ['/*!\n',
  ' * TREE - <%= pkg.title %> v<%= pkg.version %>\n',
  ' * Copyright 2020-' + (new Date()).getFullYear(), ' <%= pkg.author %>\n',
  ' */\n',
  '\n'
].join('');

// BrowserSync
function browserSync(done) {
  browsersync.init({
    // server: {
    //   baseDir: "./"
    // },
    proxy: "http://localhost:" + (process.env.SERVER_PORT || 8000),
    port: process.env.SYNC_PORT || 1234,
  });
  done();
}

// BrowserSync reload
function browserSyncReload(done) {
  browsersync.reload();
  done();
}

// Clean vendor
function clean() {
  return del(["./public/vendor/"]);
}

// Bring third party dependencies from node_modules into vendor directory
function modules() {
  // Bootstrap JS
  var bootstrapJS = gulp.src('./node_modules/bootstrap/dist/js/*')
    .pipe(gulp.dest('./public/vendor/bootstrap/js'));
  // Bootstrap SCSS
  var bootstrapSCSS = gulp.src('./node_modules/bootstrap/scss/**/*')
    .pipe(gulp.dest('./public/vendor/bootstrap/scss'));
  // ChartJS
  var chartJS = gulp.src('./node_modules/chart.js/dist/*.js')
    .pipe(gulp.dest('./public/vendor/chart.js'));
  var routerJS = gulp.src('./node_modules/vanilla-router/dist/*.js')
    .pipe(gulp.dest('./public/vendor/vanilla-router'));
  var Handlebars = gulp.src('./node_modules/handlebars/dist/*.js')
    .pipe(gulp.dest('./public/vendor/handlebars'));
  var socketio = gulp.src('./node_modules/socket.io-client/dist/*.js')
    .pipe(gulp.dest('./public/vendor/socket.io-client'));

  // dataTables
  var dataTables = gulp.src([
      './node_modules/datatables.net/js/*.js',
      './node_modules/datatables.net-bs4/js/*.js',
      './node_modules/datatables.net-bs4/css/*.css'
    ])
    .pipe(gulp.dest('./public/vendor/datatables'));
  // Font Awesome
  var fontAwesome = gulp.src('./node_modules/@fortawesome/**/*')
    .pipe(gulp.dest('./public/vendor'));
  // jQuery Easing
  var jqueryEasing = gulp.src('./node_modules/jquery.easing/*.js')
    .pipe(gulp.dest('./public/vendor/jquery-easing'));
  // jQuery
  var jquery = gulp.src([
      './node_modules/jquery/dist/*',
      '!./node_modules/jquery/dist/core.js'
    ])
    .pipe(gulp.dest('./public/vendor/jquery'));
  return merge(bootstrapJS, bootstrapSCSS, chartJS, dataTables, fontAwesome, jquery, jqueryEasing,routerJS, Handlebars, socketio);
}

// CSS task
function css() {
  return gulp
    .src("./scss/**/*.scss")
    .pipe(plumber())
    .pipe(sass({
      outputStyle: "expanded",
      includePaths: "./node_modules",
    }))
    .on("error", sass.logError)
    .pipe(autoprefixer({
      cascade: false
    }))
    .pipe(header(banner, {
      pkg: pkg
    }))
    .pipe(gulp.dest("./public/css"))
    .pipe(rename({
      suffix: ".min"
    }))
    .pipe(cleanCSS())
    .pipe(gulp.dest("./public/css"))
    .pipe(browsersync.stream());
}

// JS task
function js() {
  return gulp
    .src([
      './js/*.js',
      '!./js/*.min.js',
    ])
    .pipe(replace('SERVER_PORT', process.env.SERVER_PORT))
    .pipe(babel(
      {presets: ['@babel/env']}
    ))
    .pipe(concat('all.min.js'))
    .pipe(uglify())
    .pipe(header(banner, {
      pkg: pkg
    }))
    .pipe(gulp.dest('./public/js'))
    .pipe(browsersync.stream());
}

// Watch files
function watchFiles(done) {
  gulp.watch("./scss/**/*", css);
  gulp.watch(["./js/**/*", "!./js/**/*.min.js"], js);
  gulp.watch("./**/*.html", browserSyncReload);
  done();
}
// Start server
function expressServer(done) {

  var started = false;
  nodemon({script: 'server.js'})
    .on('start', () => {
    
    if (!started) {
      done();
      started = true;
    }
    else
    {
      browsersync.reload();
    }
    
  });
}
// Define complex tasks
const vendor = gulp.series(clean, modules);
const build = gulp.series(vendor, gulp.parallel(css, js));
const watch = gulp.series(build, gulp.parallel(watchFiles, gulp.series(expressServer, browserSync)));

// Export tasks
exports.css = css;
exports.js = js;
exports.clean = clean;
exports.vendor = vendor;
exports.build = build;
exports.watch = watch;
exports.default = build;
