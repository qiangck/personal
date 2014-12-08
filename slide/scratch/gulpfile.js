var gulp = require("gulp");
var amdOptimize = require("amd-optimize");
var concat = require("gulp-concat");
var uglify = require("gulp-uglify");
gulp.task("scripts", function () {

  return gulp.src("**/**/*.js")
    // Traces all modules and outputs them in the correct order.
    .pipe(amdOptimize.src("src/main-scratch",{
      wrapShim : true,
      paths: {
        'core/Slide': '../../core/Slide',
        'util/MathUtil': '../../util/MathUtil',
        'util/ElemUtil': '../../util/ElemUtil',
        'ft/Game': '../Game'
      },
      loader : amdOptimize.loader(
        // Used for turning a moduleName into a filepath glob.
        function (moduleName) {  return moduleName + ".js" }
      )
    }))
    .pipe(concat("app.js"))
  // .pipe(uglify())
    .pipe(gulp.dest("dist/"));

});