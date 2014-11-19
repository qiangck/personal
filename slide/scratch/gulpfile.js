var gulp = require("gulp");
var amdOptimize = require("./require-gulp");
var concat = require("gulp-concat");
gulp.task("scripts", function () {

  return gulp.src("**/**/*.js")
    // Traces all modules and outputs them in the correct order.
    .pipe(amdOptimize("src/main-scratch"))
    .pipe(concat("main-scratch.js"))
    .pipe(gulp.dest("dist/"));

});