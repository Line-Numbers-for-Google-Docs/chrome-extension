import { task, src, dest, watch, series } from 'gulp'
import replace from 'gulp-replace'

import { ENV_VARS } from './env.vars.js'

const ENV = process.env.NODE_ENV || 'development'

function replaceEnvVars(stream) {
  for (const key in ENV_VARS[ENV]) {
    const regex = new RegExp(`\\$\\\{\\s*ENV\\.${key}\\s*\\}`, "g")
    stream.pipe(replace(regex, ENV_VARS[ENV][key]));
  }
}

function manifestBuild(done) {
  const stream = src('src/manifest.json')
  replaceEnvVars(stream)
  stream.pipe(dest('dist'))

  done()
}

function jsBuild(done) {
  const stream = src('src/**/*.js')
  replaceEnvVars(stream)
  stream.pipe(dest('dist'))

  done()
}

function cssBuild(done) {
  src('src/**/*.css')
    .pipe(dest('dist'))

  done()
}

function htmlBuild(done) {
  src('src/**/*.html')
    .pipe(dest('dist'))

  done()
}

function staticBuild(done) {
  src('src/icons/*')
    .pipe(dest('dist/icons'))

  done()
}

task('build', done => {  
  series(manifestBuild, staticBuild, jsBuild, cssBuild, htmlBuild)()

  done()
})
 
task('watch', _ => {
  console.log("\nWatching changes to files...")

  watch(['src/manifest.json', 'env.vars.js'], manifestBuild)
  watch(['src/**/*.js', 'env.vars.js'], jsBuild)
  watch('src/**/*.css', cssBuild)
  watch('src/**/*.html', htmlBuild)
});

task('dev', _ => {
  series('build', 'watch')()
});