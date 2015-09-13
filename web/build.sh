dist_dir=dist/js

# resolve require
browserify "$dist_dir"/nim-finder.js -o "$dist_dir"/nim-finder.required.js

# uglify it
uglifyjs --compress --mangle -o "$dist_dir"/nim-finder.required.min.js -- "$dist_dir"/nim-finder.required.js

# combine with others
browserify "$dist_dir"/material.min.js "$dist_dir"/chosen.jquery.min.js "$dist_dir"/jquery.twbsPagination.min.js "$dist_dir"/nim-finder.required.min.js -o "$dist_dir"/nim-finder.bundle.min.js

# clean up
rm "$dist_dir"/nim-finder.required.js
rm "$dist_dir"/nim-finder.required.min.js
