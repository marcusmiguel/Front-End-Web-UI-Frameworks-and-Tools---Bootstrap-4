//COURSERA: Front-End Web UI Frameworks and Tools: Bootstrap 4
//Week 4: Gulp Exercise 2
//disclaimer: I am not affiliated with the course instructors/mentors. I am only providing this for reference to fellow students.
//This page was extremely helpful in getting this to work:
//      https://goede.site/setting-up-gulp-4-for-automatic-sass-compilation-and-css-injection

"use strict";

//declare
var gulp = require("gulp"),
  watch = require("gulp"),
  series = require("gulp"),
  src = require("gulp"),
  dest = require("gulp"),
  sass = require("gulp-sass"),
  browserSync = require("browser-sync"),
  del = require("del"),
  imagemin = require("gulp-imagemin"),
  parallel = require("gulp"),
  uglify = require("gulp-uglify"),
  usemin = require("gulp-usemin"),
  rev = require("gulp-rev"),
  cleanCss = require("gulp-clean-css"),
  flatmap = require("gulp-flatmap"),
  htmlmin = require("gulp-htmlmin");

//compiles all scss to css
function sassFn() {
  return gulp
    .src("./css/*.scss")
    .pipe(sass())
    .on("error", sass.logError)
    .pipe(gulp.dest("./css"));
}

//browsersync. There is function done as argument...
//This is because Gulp 4 does not support synchronous functions
//Basically, you have to tell it that you are 'done'... Unless you have a 'return'.
//The argument's name does not matter, as long as it matches the call at the end of the function
//AFAIK you should use return whenever possible.
function browserSyncFn(done) {
  var files = ["./*.html", "./css/*.css", "./js/*.js", "./img/*.{png,jpg,gif}"];
  browserSync.init(files, {
    server: {
      baseDir: "./",
    },
  });
  done();
}

//this is your watch function
function sassWatch() {
  gulp.watch(["./css/*.scss"], sassFn);
}

//exported functions can be used in command line
//series means that these functions will be called in order
//for more info about series and parallel, please refer to Gulp API
exports.default = gulp.series(browserSyncFn, sassWatch);

//deletes dist folder
function clean() {
  return del(["dist"]);
}

//copies fonts
async function copyFonts() {
  return gulp
    .src("./node_modules/font-awesome/fonts/**/*.{ttf,woff,eof,svg}*")
    .pipe(gulp.dest("./dist/fonts"));
}

//imagemin
async function imageminFn() {
  return gulp
    .src("./img/*.{png,jpg,gif}")
    .pipe(imagemin({ optimization: 3, progressive: true, interlaced: true }))
    .pipe(gulp.dest("./dist/img"));
}

//usemin
async function useminFn() {
  return gulp
    .src("./*.html")
    .pipe(
      flatmap(function (stream, file) {
        return stream.pipe(
          usemin({
            css: [rev()],
            html: [
              function () {
                return htmlmin({ collapseWhitespace: true });
              },
            ],
            js: [uglify(), rev()],
            inlinejs: [uglify()],
            inlinecss: [cleanCss(), "concat"],
          })
        );
      })
    )
    .pipe(gulp.dest("dist/"));
}

//define and export the build task
exports.build = gulp.series(
  clean,
  gulp.parallel(copyFonts, imageminFn, useminFn)
);
