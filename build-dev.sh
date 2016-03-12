dist_dir=dist/js

# nim-finder.js
## resolve require
browserify "$dist_dir"/nim-finder.js "$dist_dir"/analytics.js -o "$dist_dir"/nim-finder.bundle.min.js


# nim-finder-report.js
## resolve require
browserify "$dist_dir"/nim-finder-report.js -o "$dist_dir"/nim-finder-report.min.js
