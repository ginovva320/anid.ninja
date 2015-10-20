'use strict';

const gulp    = require(`gulp`),
      jade    = require(`gulp-jade`),
      sass    = require(`gulp-sass`),
      connect = require(`gulp-connect`),
      publish = require(`gulp-awspublish`);

gulp.task(`connect`, () => {
    connect.server({
        root: `dist`,
        livereload: true
    });
});

gulp.task(`jade`, () => {
    const gaId    = process.env.GA_ID,
          gaLocal = gaId ? false : true;

    gulp.src(`./src/*.jade`)
        .pipe(jade({
            locals: {
                gaId,
                gaLocal
            }
        }))
        .pipe(gulp.dest(`./dist/`))
        .pipe(connect.reload());
});

gulp.task(`scss`, () => {
    gulp.src(`./src/scss/*.scss`)
        .pipe(sass({
            outputStyle: `compressed`
        }).on(`error`, sass.logError))
        .pipe(gulp.dest(`./dist`))
        .pipe(connect.reload());
});

gulp.task(`watch`, function() {
    gulp.watch([`./src/*.jade`], [`jade`]);
    gulp.watch([`./src/scss/*.scss`], [`scss`]);
});

gulp.task(`s3`, [`jade`, `scss`], () => {
    var publisher = publish.create({
        params: {
            Bucket: process.env.S3_BUCKET
        },
        accessKeyId: process.env.AWS_ID,
        secretAccessKey: process.env.AWS_SECRET
    });

    return gulp.src('dist/**/*')
        .pipe(publish.gzip())
        .pipe(publisher.publish())
        .pipe(publish.reporter());
});

gulp.task(`default`, [`jade`, `scss`, `connect`, `watch`]);