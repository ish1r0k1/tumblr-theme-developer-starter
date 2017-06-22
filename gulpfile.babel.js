import gulp from 'gulp'
import gulpLoadPlugins from 'gulp-load-plugins'
import browserify from 'browserify'
import babelify from 'babelify'
import watchify from 'watchify'
import source from 'vinyl-source-stream'
import buffer from 'vinyl-buffer'
import pngcrush from 'imagemin-pngcrush'
import minimist from 'minimist'
import runSequence from 'run-sequence'
import rimraf from 'rimraf'
import browserSync from 'browser-sync'

const $ = gulpLoadPlugins(),
      bs = browserSync.create(),
      reload = bs.reload,
      stream = bs.stream

let isProduction = false

const minimistOptions = {
  string: ['env'],
  default: {
    env: process.env.NODE_ENV || 'development'
  }
}

const options = minimist(process.argv.slice(2), minimistOptions)

if (options.env === 'production') {
  isProduction = true
}

$.util.log('[env]', $.util.colors.yellow(options.env), '[isProduction]', $.util.colors.yellow(isProduction))

const paths = {
  src: {
    html: 'src/',
    stylesheets: 'src/stylesheets/',
    javascripts: 'src/javascripts/',
    images: 'src/images/',
    fonts: 'src/fonts/'
  },
  dist: {
    html: 'build/',
    stylesheets: 'build/stylesheets/',
    javascripts: 'build/javascripts/',
    images: 'build/images/',
    fonts: 'build/fonts/'
  }
}

const dataPath = './data/data.json'

const autoprefixer_browser = ['last 2 versions']

gulp.task('serve', () => {
  return bs.init({
    server: {
      baseDir: paths.dist.html
    }
  })
})

gulp.task('styles', () => {
  return gulp.src(`${paths.src.stylesheets}/*.scss`)
    .pipe($.if(!isProduction, $.sourcemaps.init()))
    .pipe($.sass().on('erorr', $.sass.logError))
    .pipe($.autoprefixer({ browsers: autoprefixer_browser }))
    .pipe($.groupCssMediaQueries())
    .pipe($.csscomb())
    .pipe($.csso())
    .pipe($.if(!isProduction, $.sourcemaps.write('./')))
    .pipe(gulp.dest(paths.dist.stylesheets))
    .pipe(stream())
})

gulp.task('scripts', () => {
  let bundler

  const options = {
    entries: [`${paths.src.javascripts}index.js`],
    transform: [['babelify']]
  }

  const filename = 'bundle.js'

  if (isProduction) {
    bundler = browserify(options)
  } else {
    options.cache = {}
    options.packageCache = {}
    options.fullpaths = true
    options.debug = true
    bundler = watchify(browserify(options))
  }

  function bundle() {
    return bundler
      .bundle()
      .on('error', errorHandler)
      .pipe(source(filename))
      .pipe(buffer())
      .pipe($.if(isProduction, $.uglify()))
      .pipe(gulp.dest(paths.dist.javascripts))
      .on('end', () => {
        $.util.log('Finished', `'${$.util.colors.cyan('Browserify Bundled')}'`, $.util.colors.green(filename))
        if (!isProduction && bs.active) reload()
      })
  }

  bundler.on('update', bundle)
  return bundle()
})

gulp.task('images:min', () => {
  const imageminOption = {
    optimizationLevel: 7,
    progressive: true,
    interlaced: true,
    svgoPlugins: [{removeViewBox: false}],
    use: [pngcrush()]
  }

  return gulp.src([`${paths.src.images}**/*`])
    .pipe($.if(isProduction, $.imagemin(imageminOption)))
    .pipe(gulp.dest(paths.dist.images))
    .on('end', () => {
      if(!isProduction && bs.active) reload()
    })
})

gulp.task('copyFile', () => {
  return gulp.src([`${paths.src.fonts}**/*`])
    .pipe(gulp.dest(paths.dist.fonts))
    .on('end', () => {
      if(!isProduction && bs.active) reload()
    })
})

gulp.task('clean', (cb) => {
  return rimraf('build', cb)
})

gulp.task('build', () => {
  return gulp.src([`${paths.src.html}*.ejs`])
    .pipe($.ejs())
    .on('error', errorHandler)
    .pipe($.rename({ extname: '.html' }))
    .pipe($.if(!isProduction, $.tumblrThemeParser({ data: dataPath }).on('error', errorHandler)))
    .pipe(gulp.dest(paths.dist.html))
})

gulp.task('bs:reload', () => {
  return reload()
})

gulp.task('watch', () => {
  $.watch([`${paths.src.html}*.ejs`, dataPath], () => {
    runSequence('build', 'bs:reload')
  })

  $.watch(`${paths.src.stylesheets}**/*.scss`, () => {
    gulp.start('styles')
  })

  $.watch(`${paths.src.fonts}**/*`, () => {
    gulp.start('copyFile')
  })

  $.watch(`${paths.src.images}**/*`, () => {
    gulp.start('images:min')
  })
})

gulp.task('default', () => {
  if (!isProduction) {
    runSequence('clean', 'copyFile', ['styles', 'scripts', 'images:min', 'build'], 'serve', 'watch')
  } else {
    runSequence('clean', 'copyFile', ['styles', 'scripts', 'images:min', 'build'])
  }
})

const errorHandler = function(err) {
  $.util.log($.util.colors.red(`Error: ${err}`))
  this.emit('end')
}
