dist_dir=dist/js

# nim-finder.js
## resolve require
browserify "$dist_dir"/nim-finder.js -o "$dist_dir"/nim-finder.required.js

## uglify & obfuscate it
uglifyjs --compress --mangle -o "$dist_dir"/nim-finder.required.min.js -- "$dist_dir"/nim-finder.required.js
jsobfuscate -o encodeNumbers=false "$dist_dir"/nim-finder.required.min.js > "$dist_dir"/nim-finder.obfuscated.min.js

## combine with others
browserify "$dist_dir"/material.min.js "$dist_dir"/chosen.jquery.min.js "$dist_dir"/jquery.twbsPagination.min.js "$dist_dir"/nim-finder.obfuscated.min.js -o "$dist_dir"/nim-finder.bundle.min.js

## clean up
rm "$dist_dir"/nim-finder.required.js
rm "$dist_dir"/nim-finder.required.min.js
rm "$dist_dir"/nim-finder.obfuscated.min.js


# nim-finder-report.js
## resolve require
browserify "$dist_dir"/nim-finder-report.js -o "$dist_dir"/nim-finder-report.required.js

## uglify & obfuscate it
uglifyjs --compress --mangle -o "$dist_dir"/nim-finder-report.required.min.js -- "$dist_dir"/nim-finder-report.required.js
jsobfuscate -o encodeNumbers=false "$dist_dir"/nim-finder-report.required.min.js > "$dist_dir"/nim-finder-report.obfuscated.min.js

## combine with others
browserify "$dist_dir"/material.min.js "$dist_dir"/nim-finder-report.obfuscated.min.js -o "$dist_dir"/nim-finder-report.min.js

## clean up
rm "$dist_dir"/nim-finder-report.required.js
rm "$dist_dir"/nim-finder-report.required.min.js
rm "$dist_dir"/nim-finder-report.obfuscated.min.js
