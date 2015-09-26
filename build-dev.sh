dist_dir=dist/js

# nim-finder.js
## resolve require
browserify "$dist_dir"/material.min.js "$dist_dir"/ripples.min.js "$dist_dir"/chosen.jquery.min.js "$dist_dir"/jquery.twbsPagination.min.js "$dist_dir"/nim-finder.js "$dist_dir"/analytics.js -o "$dist_dir"/nim-finder.bundle.min.js


# nim-finder-report.js
## resolve require
browserify "$dist_dir"/material.min.js "$dist_dir"/ripples.min.js "$dist_dir"/nim-finder-report.js -o "$dist_dir"/nim-finder-report.min.js
