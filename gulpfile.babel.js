import { task, src, dest, watch, series } from 'gulp'
import replace from 'gulp-replace'

import { ENV_VARS } from './env.vars.js'

const ENV = process.env.NODE_ENV || 'development'
 
function jsBuild(done) {
  const stream = src('src/**/*.js')
  
  for (const key in ENV_VARS[ENV]) {
    const regex = new RegExp(`\\$\\\{\\s*ENV\\.${key}\\s*\\}`, "g")
    stream.pipe(replace(regex, ENV_VARS[ENV][key])); 
  }
    
  stream.pipe(dest('dist'))

  done()
};

function cssBuild(done) {
  src('src/**/*.css')
    .pipe(dest('dist'))

  done()
};

function htmlBuild(done) {
  src('src/**/*.html')
    .pipe(dest('dist'))

  done()
};

task('build', done => {
  src('src/manifest.json')
    .pipe(dest('dist'))
  src('src/icons/*')
    .pipe(dest('dist/icons'))
  
  series(jsBuild, cssBuild, htmlBuild)()

  done()
})
 
task('watch', _ => {
  console.log("\nWatching changes to files...")

  watch('src/**/*.js', jsBuild)
  watch('src/**/*.css', cssBuild)
  watch('src/**/*.html', htmlBuild)
});

task('dev', _ => {
  series('build', 'watch')()
});