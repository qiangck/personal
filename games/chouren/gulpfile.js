/**
 * Created by rechie on 14-9-17.
 */
// 引入 gulp
// 引入 gulp
var gulp = require('gulp');

// 引入组件
var jshint = require('gulp-jshint');
var sass = require('gulp-sass');
var concat = require('gulp-concat');
var uglify = require('gulp-uglify');
var rename = require('gulp-rename');
var minifyCSS = require('gulp-minify-css');

// 检查脚本
gulp.task('lint', function() {
    gulp.src('./js/*.js')
        .pipe(jshint())
        .pipe(jshint.reporter('default'));
});

// 编译Sass
gulp.task('sass', function() {
    gulp.src('./scss/*.scss')
        .pipe(sass())
        .pipe(gulp.dest('./css'));
});

gulp.task('css', function() {
    gulp.src('./*.css')
        .pipe(minifyCSS({keepBreaks:true}))
        .pipe(rename('dist/css/page.min.css'))
        .pipe(gulp.dest('./'))
});

// 合并，压缩文件
gulp.task('scripts', function() {
    gulp.src(['js/zepto.js', 'js/RC.js', 'js/game.js', 'js/WeixinApi.js', 'js/soundjs-0.5.2.min.js', 'js/app.js'])
        .pipe(concat('all.js'))
        .pipe(gulp.dest('./dist/js'))
        .pipe(rename('all.min.js'))
        .pipe(uglify())
        .pipe(gulp.dest('dist/js'));
});

// 默认任务
gulp.task('default', function(){
    gulp.run( 'css', 'scripts');

    // 监听文件变化
    gulp.watch('./js/*.js', function(){
        gulp.run('css', 'scripts');
    });
});