var gulp = require('gulp'),
    connect = require('gulp-connect');
    watch = require('gulp-watch');
    clean = require('gulp-clean');
    less = require('gulp-less');
    path = require('path');
    cleanCSS = require('gulp-clean-css');//压缩css
    imagemin = require('gulp-imagemin');//压缩图片
    cache = require('gulp-cache'), //解决缓存的图片不在加载
    notify = require("gulp-notify");//提示信息
    uglify = require('gulp-uglify'),//压缩js
    fileinclude  = require('gulp-file-include'); // 模板文件嵌入
    htmlmin = require('gulp-htmlmin'),//html压缩
 
gulp.task('webserver', function() {
    connect.server({
        port: 2222,
        root:'dist/',
        livereload: true
    });
});
//编译less
gulp.task('less', function() {
    return gulp.src('src/css/**/*.less')
    .pipe(less())
    .pipe(gulp.dest('dist/css'))
    .pipe(connect.reload())
});
//编译image
gulp.task('image', function() {
    return gulp.src('src/image/**/*.{png,gif,jpg,jpeg}')
    .pipe(gulp.dest('dist/image'))
    .pipe(connect.reload())
});
//编译js
gulp.task('js', function() {
    return gulp.src('src/js/**/*.js')
    .pipe(gulp.dest('dist/js'))
    .pipe(connect.reload())
});
// 启动监视
gulp.task('watch', function() {
    watch('src/**/*.html',function() {
        gulp.start(['fileinclude']);
    });
    watch('src/css/**/*.less', function() {
        gulp.start(['less']);
    });
    watch('src/js/**/*.js', function() {
        gulp.start(['js']);
    });
    watch('src/image/**/*.{png,gif,jpg,jpeg}', function() {
        gulp.start(['image']);
    });
});
//配置任务流
function swallowError(error) {
    // If you want details of the error in the console
  console.error(error.toString())
  notify.onError({
      title: 'Gulp',
      subtitle: 'Failure!',
      message: 'Error: <%= error.message %>',
      sound: 'Beep'
    })(error);
  this.emit('end')
}
//文件内嵌
gulp.task('fileinclude',['fileinclude_view'],function() {
    gulp.src(['src/index.html', '!src/componet/*.html'])
        .pipe(fileinclude({
          prefix: '@@',
          basepath: '@file'
        }))
    .on('error', swallowError)
    .pipe(htmlmin({collapseWhitespace: false}))
    .pipe(gulp.dest('dist/'))
    .pipe(connect.reload())
});
gulp.task('fileinclude_view',function() {
    gulp.src(['src/view/**/*.html', '!src/componet/*.html'])
        .pipe(fileinclude({
          prefix: '@@',
          basepath: '@file'
        }))
    .on('error', swallowError)
    .pipe(htmlmin({collapseWhitespace: false}))
    .pipe(gulp.dest('dist/view'))
    .pipe(connect.reload())
});
// 清空dist
gulp.task('clean', function() {
    return gulp.src('dist/')
    .pipe(clean());
});
gulp.task('dev', ['clean'],function(){
    gulp.start(['js','image',
                'less','webserver','watch',
                'fileinclude']);
});
//***********************************************************************
// gulp product 压缩css/js/图片等文件，进行减少文件大小，但也会大大减弱文件可读性
//编译压缩less
gulp.task('less_min', function() {
    return gulp.src('src/css/**/*.less')
    .pipe(less())
    .pipe(cleanCSS())
    .pipe(gulp.dest('dist/css'))
    .pipe(connect.reload())

});
//编译压缩image
gulp.task('image_min', function() {
    return gulp.src('src/image/**/*.{png,gif,jpg,jpeg}')
    .pipe(cache(imagemin({
        optimizationLevel: 5, //类型：Number  默认：3  取值范围：0-7（优化等级）
        progressive: true, //类型：Boolean 默认：false 无损压缩jpg图片
        interlaced: true, //类型：Boolean 默认：false 隔行扫描gif进行渲染
        multipass: true //类型：Boolean 默认：false 多次优化svg直到完全优化
     })))
     .on('error', swallowError)
     .pipe(gulp.dest('dist/image'))
     .pipe(connect.reload())
});
//编译压缩js
gulp.task('js_min', function() {
    return gulp.src('src/js/**/*.js')
    .pipe(uglify())
    .pipe(gulp.dest('dist/js'))
    .pipe(connect.reload())
});
// 启动监视
gulp.task('watch_min', function() {
    watch('src/**/*.html',function() {
        gulp.start(['fileinclude']);
    });
    watch('src/css/**/*.less', function() {
        gulp.start(['less_min']);
    });
    watch('src/js/**/*.js', function() {
        gulp.start(['js_min']);
    });
    watch('src/image/**/*.{png,gif,jpg,jpeg}', function() {
        gulp.start(['image_min']);
    });
});
gulp.task('product', ['clean'],function(){//压缩了css/js/图片
    gulp.start(['fileinclude','image_min','less_min',
                'js_min','webserver','watch_min']);
});  