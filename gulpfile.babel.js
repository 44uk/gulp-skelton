'use strict';
gulp.task('default', ['sync']);
gulp.task('sync', ['build', 'serv'] , watch);
// TODO: replace run-sequence to gulp.parallel when gulp4 released.
// @see http://qiita.com/joe-re/items/e04010ed03826fb94a16
gulp.task('build', (cb) => { return rs(
  'sprite',
  [
    'jade',
    'styl',
    'coffee',
    'babel'
  ],
  'copy',
  cb
)});
gulp.task('release', (cb) => { return rs(
  'production',
  'clean',
  'build',
  cb
)});
gulp.task('minify', ['uglify', 'csso']);

gulp.task('jade', jade);
gulp.task('styl', styl);
gulp.task('coffee', coffee);
gulp.task('babel', babel);
gulp.task('copy', copy);
gulp.task('sprite', sprite);
gulp.task('uglify', uglify);
gulp.task('csso', csso);

gulp.task('conv', conv);
gulp.task('capture', capture);
gulp.task('validate', validate);
gulp.task('clean', clean);

gulp.task('nil', nil);
gulp.task('watch', watch);
gulp.task('serv', bsInit);
gulp.task('serv:reload', bsReload);
gulp.task('production', production);

import del from 'del';
import path from 'path';
import rs from 'run-sequence';
import browserSync from 'browser-sync';
import autoprefixer from 'autoprefixer';
import mqpacker from 'css-mqpacker';
import gulp from 'gulp';
import gIf from 'gulp-if';
import gPlumber from 'gulp-plumber';
import gNotify from 'gulp-notify';
import gStyl from 'gulp-stylus';
import gJade from 'gulp-jade';
import gPostcss from 'gulp-postcss';
import gCsso from 'gulp-csso';
// import gMmq from 'gulp-merge-media-queries';
import gCoffee from 'gulp-coffee';
import gBabel from 'gulp-babel';
import gUglify from 'gulp-uglify';
import gSprite from 'gulp.spritesmith';
import gRename from 'gulp-rename';
import gConv from 'gulp-convert-encoding';
import gReplace from 'gulp-replace';
import gWebshot from 'gulp-webshot';
import gHtmlhint from 'gulp-htmlhint';
import gSourcemap from 'gulp-sourcemaps';
import conf from './gulpconf.json';

var isProd = false;
var root = process.cwd();
var bs = null;

function jade () {
  let srcPath = [
    path.join('!' + conf.general.srcPath, "__partials/**/*.jade"),
    path.join(conf.general.srcPath, "**/!(_)*.jade")
  ];
  let options = Object.assign(conf.jade.options, {
    "basedir": conf.general.srcPath
  });

  gulp.src(srcPath)
    .pipe(notify())
    .pipe(gJade(options))
    .pipe(gulp.dest(conf.general.dstPath))
  ;
}

function styl () {
  let srcPath = [
    path.join(conf.general.srcPath, "**/!(_)*.{styl,css}")
  ];
  let options = Object.assign(conf.styl.options, {
  });
  let processors = [
    autoprefixer({browsers: ['last 2 version']}),
    mqpacker
  ]

  gulp.src(srcPath)
    .pipe(notify())
    .pipe(gSourcemap.init())
    .pipe(gStyl(options))
    .pipe(gPostcss(processors))
    .pipe(gIf(isProd, gSourcemap.write('.'), gSourcemap.write()))
    .pipe(gulp.dest(conf.general.dstPath))
  ;
}

function coffee () {
  let srcPath = [
    path.join(conf.general.srcPath, "**/!(_)*.coffee")
  ];
  let options = Object.assign(conf.coffee.options, {
  });

  gulp.src(srcPath)
    .pipe(notify())
    .pipe(gSourcemap.init())
    .pipe(gCoffee(options))
    .pipe(gIf(isProd, gSourcemap.write('.'), gSourcemap.write()))
    .pipe(gulp.dest(conf.general.dstPath))
  ;
}

function babel () {
  let srcPath = [
    path.join(conf.general.srcPath, "**/!(_)*.babel.js")
  ];
  let options = Object.assign(conf.babel.options, {
  });

  gulp.src(srcPath)
    .pipe(notify())
    .pipe(gBabel(options))
    .pipe(gRename((path) => {
      path.basename = path.basename.replace(/\.babel$/, '');
    }))
    .pipe(gulp.dest(conf.general.dstPath))
  ;
}

function copy () {
  let srcPath = [
    path.join('!' + conf.general.srcPath, "**/*.babel.js"),
    path.join(conf.general.srcPath, "**/*." + conf.copy.options.ext)
  ];
  gulp.src(srcPath)
    .pipe(notify())
    .pipe(gulp.dest(conf.general.dstPath))
  ;
}

function sprite () {
  let srcPath = [
    path.join(conf.general.resPath, "**/*.{jpeg,jpg,gif,png}")
  ];
  let imgSheetPath = path.join(conf.general.srcPath, 'assets/css/');
  let cssSheetPath = path.join(conf.general.srcPath, 'assets/css/');
  let options = Object.assign(conf.sprite.options, {});
  let sprite = gulp.src(srcPath)
    .pipe(notify())
    .pipe(gSprite(options));

  sprite.img.pipe(gulp.dest(imgSheetPath));
  sprite.css.pipe(gulp.dest(cssSheetPath));
}

function csso () {
  let srcPath = [
    path.join(conf.general.dstPath, "**/*.css")
  ];

  gulp.src(srcPath)
    .pipe(notify())
    .pipe(gCsso())
    .pipe(gulp.dest(conf.general.dstPath))
  ;
}

function uglify () {
  let srcPath = [
    path.join(conf.general.dstPath, "**/*.js")
  ];

  gulp.src(srcPath)
    .pipe(notify())
    .pipe(gUglify(conf.uglify.options))
    .pipe(gulp.dest(conf.general.dstPath))
  ;
}

function watch () {
  let srcPath = conf.general.srcPath;
  let resPath = conf.general.resPath;
  let options = conf.watch.options;
  let reload = bs ? 'serv:reload' : 'nil';
  gulp.watch(path.join(srcPath, '**', '*' + options.jade),   ['jade', reload]);
  gulp.watch(path.join(srcPath, '**', '*' + options.styl),   ['styl', reload]);
  gulp.watch(path.join(srcPath, '**', '*' + options.coffee), ['coffee', reload]);
  gulp.watch(path.join(srcPath, '**', '*' + options.babel),  ['babel', reload]);
  gulp.watch(path.join(srcPath, '**', '*' + options.files),  ['copy', reload]);
  gulp.watch(path.join(resPath, '**', '*' + options.sprite), ['sprite', 'copy', reload]);
}

function bsInit () {
  let options = Object.assign(conf.browserSync.options, {
    "server": {
      "baseDir": conf.general.dstPath
    }
  });
  bs = browserSync.init(options);
}

function notify () {
  return gPlumber({errorHandler: gNotify.onError("Error: <%= error.message %>")});
}

function conv () {
  let srcPath = [
    path.join(conf.general.dstPath, "**/*.{html,htm}")
  ];
  let options = Object.assign(conf.conv.options, {
  });
  let pattern = new RegExp(conf.conv.pattern);

  gulp.src(srcPath)
    .pipe(notify())
    .pipe(gReplace(pattern, conf.conv.replace))
    .pipe(gConv(options))
    .pipe(gulp.dest(conf.general.dstPath, {overwrite: true}))
  ;
}

function capture () {
  let srcPath = [
    path.join(conf.general.dstPath, "**/*.{html,htm}")
  ];
  let options = Object.assign(conf.capture.options, {
    dest: conf.general.capPath
  });
  gulp.src(srcPath)
    .pipe(notify())
    .pipe(gWebshot(options))
  ;
}

function validate () {
  let srcPath = [
    path.join(conf.general.dstPath, "**/*.{html,htm}")
  ];
  gulp.src(srcPath)
    .pipe(gHtmlhint())
    .pipe(gHtmlhint.reporter())
  ;
}

function clean () {
  let dstPath = [
    path.join(conf.general.dstPath, "**/*.*"),
    path.join(conf.general.capPath, "**/*.*")
  ];
  del(dstPath);
}

function production () { isProd = true }
function bsReload () { bs.reload() }
function nil () {}
