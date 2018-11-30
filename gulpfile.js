const del = require("del");
const path = require("path");
const gulp = require('gulp');
const yargs = require("yargs");
const {execSync, exec} = require('child_process');
const tslint = require('gulp-tslint');
const inlinesource = require('gulp-inline-source');

const args =  yargs.argv;

const distFolder = 'dist';

gulp.task('clean', gulp.series(() => {
    return del(["dist", "*.vsix", "vss-extension-release.json", "src/*js", "libs"]);
}));

gulp.task('tslint', gulp.series(() => {
    return gulp.src(["src/**/*ts", "src/**/*tsx"])
        .pipe(tslint({
            formatter: "verbose",
            fix: true,
        }))
        .pipe(tslint.report());
}));
gulp.task('styles', gulp.parallel(async () => {
    execSync("node ./node_modules/sass/sass.js src:dist", {
        stdio: [null, process.stdout, process.stderr]
    });
}
));

gulp.task('copy', gulp.parallel(() => {
    return gulp.src(['node_modules/vss-web-extension-sdk/lib/VSS.SDK.min.js', '*.md'])
        .pipe(gulp.dest(distFolder));
}, () => {
    return gulp.src("img").pipe(gulp.dest(path.join(distFolder, "img")));
}));

gulp.task('build', gulp.series(gulp.parallel('styles', 'tslint', 'copy'), () => {
    const option = yargs.argv.release || yargs.argv.buildRelease ? "-p" : "-d";
    execSync(`node ./node_modules/webpack-cli/bin/cli.js ${option} --progress --colors --output-path ./dist`, {
        stdio: [null, process.stdout, process.stderr]
    });
    return gulp.src("*.html")
        .pipe(inlinesource())
        .pipe(gulp.dest(distFolder));
}));

gulp.task('package', gulp.series('clean', 'build', async () => {
    const overrides = {}
    if (yargs.argv.release) {
        overrides.public = true;
    } else {
        const manifest = require('./vss-extension.json');
        overrides.name = manifest.name + ": Development Edition";
        overrides.id = manifest.id + "-dev";
    }
    const overridesArg = `--override "${JSON.stringify(overrides).replace(/"/g, '\\"')}"`;
    const manifestsArg = `--manifests vss-extension.json`;

    exec(`tfx extension create ${overridesArg} ${manifestsArg} --rev-version`,
        (err, stdout, stderr) => {
            if (err) {
                console.log(err);
            }

            console.log(stdout);
            console.log(stderr);
            
        });
}));

gulp.task('default', gulp.series('package'));