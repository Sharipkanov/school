/* DEV PLUGINS------------------------------------------------------------------
 ---------------------------------------------------------------------------- */
const gulp = require('gulp'),
    plumber = require('gulp-plumber'),
    pug = require('gulp-pug'),
    twig = require('gulp-twig'),
    babel = require('gulp-babel'),
    sass = require("gulp-sass"),
    prefix = require("gulp-autoprefixer"),
    gcmq = require('gulp-group-css-media-queries'),
    minifyCss = require('gulp-minify-css'),
    uglify = require('gulp-uglify'),
    sourcemaps = require("gulp-sourcemaps"),
    callback = require('gulp-callback'),
    clean = require('gulp-clean'),
    spritesmith = require("gulp.spritesmith"),
    browserSync = require('browser-sync');

/* PRODUCTION PLUGINS ----------------------------------------------------------
 ---------------------------------------------------------------------------- */
const useref = require('gulp-useref'),
    wiredep = require('wiredep').stream,
    gulpif = require('gulp-if');

/* SOURCES --------------------------------------------------------------------
 ---------------------------------------------------------------------------- */
const sources = {
    html: {
        src: 'app/*.html',
        dist: 'app/'
    },
    css: {
        src: 'app/css/*.css',
        dist: 'app/css'
    },
    js: {
        dist: 'app/js',
        watch: 'app/js/*.js',
        es6_watch: 'app/js/es6/*.js'
    },
    pug: {
        src: 'app/pug/*.pug',
        watch: 'app/pug/**/*.pug',
        dist: 'app/'
    },
    twig: {
        src: 'app/twig/*.twig',
        watch: 'app/twig/**/*.twig',
        temp_dist: 'app/.twig-temp/',
        temp_dist_html: 'app/.twig-temp/*.html',
        dist: 'app/'
    },
    sass: {
        src: 'app/sass/*.sass',
        watch: 'app/sass/**/*.sass',
        dist: 'app/sass'
    },
    bower: {src: 'app/bower_components'},
    images: {
        icons: {
            default: 'app/images/icons/*.png',
            retina: 'app/images/icons/*@2x.png'
        },
        dist: 'app/images'
    }
};

/* DEVELOPMENT GULP TASKS ------------------------------------------------------
 ---------------------------------------------------------------------------- */

/* Error Handler ---------------------------------------------------------------
 ---------------------------------------------------------------------------- */

const onError = function (err) {
    console.log(err);
    this.emit('end');
};

/* PUG ---------------------------------------------------------------------- */
gulp.task('pug', function () {
    gulp.src(sources.pug.src)
        .pipe(plumber({
            errorHandler: onError
        }))
        .pipe(pug({
            pretty: true
        }))
        .pipe(gulp.dest(sources.pug.dist))
        .pipe(browserSync.reload({stream: true}));
});

/* TWIG --------------------------------------------------------------------- */
gulp.task('twig', function () {
    gulp.src(sources.twig.src)
        .pipe(plumber({
            errorHandler: onError
        }))
        .pipe(twig({
            data: {
                benefits: [
                    'Fast',
                    'Flexible',
                    'Secure'
                ]
            }
        }))
        .pipe(gulp.dest(sources.twig.dist))
        .pipe(browserSync.reload({stream: true}));

    return null;
});

/* SASS --------------------------------------------------------------------- */
gulp.task('sass', function () {
    return gulp.src(sources.sass.src)
        .pipe(plumber({
            errorHandler: onError
        }))
        .pipe(sass({outputStyle: 'compressed'}))
        .pipe(prefix({
            browsers: ['>0%'],
            cascade: false
        }))
        .pipe(sourcemaps.init())
        .pipe(sourcemaps.write())
        .pipe(gulp.dest(sources.css.dist))
});

/* Combine media queries ----------------------------------------------------- */
gulp.task('gcmq', ['sass'], function () {
    gulp.src(sources.css.src)
        .pipe(plumber({
            errorHandler: onError
        }))
        .pipe(gcmq())
        .pipe(gulp.dest(sources.css.dist))
        .pipe(browserSync.reload({stream: true}));
});

/* Sprites ------------------------------------------------------------------- */
gulp.task('sprite', function () {
    const spriteData = gulp.src(sources.images.icons.default)
        .pipe(spritesmith({
            imgName: 'sprite.png',
            imgPath: '../images/sprite.png',
            cssName: '_sprite.sass'
        }));

    spriteData.css.pipe(gulp.dest(sources.sass.dist));
    spriteData.img.pipe(gulp.dest(sources.images.dist));
});

/* ES6 to ES5 ---------------------------------------------------------------- */
gulp.task('es6', function () {
    return gulp.src(sources.js.es6_watch)
        .pipe(plumber())
        .pipe(babel({
            "presets": ["es2015"]
        }))
        .pipe(gulp.dest(sources.js.dist));
});

/* BOWER --------------------------------------------------------------------- */
gulp.task('bower', function () {
    gulp.src(sources.html.src)
        .pipe(wiredep({
            directory: sources.bower.src
        }))
        .pipe(gulp.dest('app'));
});

/* BROWSER SYNC -------------------------------------------------------------- */
gulp.task('browser-sync', function () {
    browserSync.init({
        server: "./app"
    });
});

/* PRODUCTION GULP TASKS ------------------------------------------------------
 ---------------------------------------------------------------------------- */

/* SFTP --------------------------------------------------------------------- */
gulp.task('sftp', function () {
    gulp.src("dist/**/*")
        .pipe(sftp({
            host: "",
            user: "",
            pass: "",
            remotePath: ""
        }));
});

/* CLEAN -------------------------------------------------------------------- */
gulp.task('clean', function () {
    gulp.src('dist', {read: false})
        .pipe(clean());
});

/* BUILD -------------------------------------------------------------------- */
gulp.task('build', ["clean"], function () {
    setTimeout(function () {
        gulp.start('build_dist');
        gulp.start('fonts');
        gulp.start('images');
    }, 500);
});

gulp.task('build_dist', function () {
    gulp.src(sources.html.src)
        .pipe(useref())
        .pipe(gulpif('*.js', uglify()))
        .pipe(gulpif('*.css', minifyCss()))
        .pipe(useref())
        .pipe(gulp.dest('dist'));
});

gulp.task('fonts', function () {
    gulp.src([
        'app/bower_components/uikit/fonts/**',
        'app/fonts/**'
    ])
        .pipe(gulp.dest('dist/fonts'));
});

gulp.task('images', function () {
    gulp.src([
        'app/images/**',
        '!app/images/icons',
        '!app/images/icons-2x',
        '!app/images/icons/**',
        '!app/images/icons-2x/**'
    ])
        .pipe(gulp.dest('dist/images'));
});

/* DEFAULT AND GULP WATCHER ----------------------------------------------------
 ---------------------------------------------------------------------------- */
gulp.task('watch', function () {
    // gulp.watch('bower.json', ["bower"]);
    gulp.watch(sources.sass.watch, ['gcmq']);
    // gulp.watch(sources.pug.watch, ["pug"]);
    gulp.watch(sources.twig.watch, ["twig"]);
    gulp.watch(sources.js.es6_watch, ['es6']);
    gulp.watch(sources.js.watch).on('change', browserSync.reload);
});

gulp.task('default', ['browser-sync', 'es6', 'twig', 'gcmq', 'watch']);