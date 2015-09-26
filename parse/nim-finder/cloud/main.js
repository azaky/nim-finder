// NIM Finder Cloud Code


var _ = require("underscore");

// Student beforeSave action:
// - Validate data (must have name and nim)
// - Add search_token and batch before saving a Student
(function() {

	Parse.Cloud.beforeSave("Student", function(request, response) {
		if (!request.object.has("name")) {
			response.error("name parameter is required for Student");
		} else if (!request.object.has("nim")) {
			response.error("nim parameter is required for Student");
		} else {
			var nim = request.object.get("nim");
			var name = request.object.get("name");

			var batch = getBatch(nim);
			var search_token = getSearchToken(nim + " " + name);
			request.object.set("batch", batch);
			request.object.set("search_token", search_token);

			response.success();
		}
	});

	function getBatch(nim) {
		if (nim.length < 8) {
			return 0;
		} else {
			return 2000 + parseInt(nim.substr(3, 2));
		}
	}

	function getSearchToken(data) {
		var tokens = [];
		var memo = {};

		_.each(data.split(' '), function(part) {
			addAllSubstrings(part, tokens, memo);
		});

		return tokens;
	}

	function addAllSubstrings(string, tokens, memo) {
		var lowercase = string.toLowerCase();
		for (var i = 0; i < lowercase.length; ++i) {
			for (var j = i + 1; j <= lowercase.length; ++j) {
				var substring = lowercase.substring(i, j);
				if (memo[substring] === undefined) {
					tokens.push(substring);
					memo[substring] = true;
				}
			}
		}
	}
})();


// Custom search function
// Requests are in format:
// {
// 	query: "query string",
// 	filter: ["faculty_codes", ...],
// 	page: 8
// }
// and the responses are in format:
// {
// 	query: {original_request...},
// 	results: {
// 		data: [Student1, ...],
// 		count: 156,
// 		start: 21,
// 		end: 40,
// 		page: 8,
// 		numPages: 20
// 	}
// }
(function() {javascript:void(0)

	var STUDENT_OBJECT = Parse.Object.extend("Student");
	var RESULTS_PER_PAGE = 10;
	var MIN_SEARCH_TOKEN_LENGTH = 1;

	Parse.Cloud.define("search", function(request, response) {
		var query = request.params;
		if (!query.query || !_.isString(query.query)) {
			response.error("query parameter is required!");
		} else {
			var parseQuery = getParseQuery(query);
			console.log(JSON.stringify(parseQuery));
			var promiseFind = parseQuery.find();
			var promiseCount = parseQuery.count();
		}
		Parse.Promise
				.when(promiseFind, promiseCount)
				.then(
			function(searchResult, count) {
				// ._.
				var newSearchResult = [];
				_.each(searchResult, function(student) {
					newSearchResult.push({
						name: student.get("name"),
						nim: student.get("nim"),
						batch: student.get("batch")
					})
				});
				response.success({
					query: query,
					results: {
						data: newSearchResult,
						count: count,
						start: getNumSkipped(query.page) + 1,
						end: getNumSkipped(query.page) + newSearchResult.length,
						page: query.page || 1,
						numPages: getNumPages(count)
					}
				});
			},
			function(errors) {
				var error = _.isArray(errors) ? errors[0] : errors;
				response.error(error.message + " (" + error.code + ") ");
			});
	});

	function getParseQuery(query) {
		var searchTokens = splitQuery(query.query.toLowerCase());

		return getNimFilterQuery(query.filters)
				.containsAll("search_token", searchTokens)
				.limit(RESULTS_PER_PAGE)
				.skip(getNumSkipped(query.page));
	}

	function getNimFilterQuery(filters) {
		if (filters instanceof Array && filters.length > 0) {
			var batchFilters = [];
			var nimRegexString = "";
			_.each(filters, function(filter) {
				if (filter.length && filter.length === 4) {
					var filterQuery = new Parse.Query(STUDENT_OBJECT);
					filterQuery.equalTo("batch", parseInt(filter));
					batchFilters.push(filterQuery);
				} else {
					if (nimRegexString.length) {
						nimRegexString += "|";
					}
					nimRegexString += "^" + filter;
				}
			});
			if (batchFilters.length > 0) {
				return Parse.Query.or.apply(null, batchFilters).matches("nim", new RegExp(nimRegexString));
			} else {
				return new Parse.Query(STUDENT_OBJECT).matches("nim", new RegExp(nimRegexString));
			}
		} else {
			return new Parse.Query(STUDENT_OBJECT);
		}
	}

	function getNumSkipped(page) {
		if (!page) {
			return 0;
		} else {
			return (page - 1) * RESULTS_PER_PAGE;
		}
	}

	function getNumPages(count) {
		return Math.ceil(count / RESULTS_PER_PAGE);
	}

	function splitQuery(rawQuery) {
		var result = [];
		_.each(rawQuery.split(/\s/), function(word) {
			if (word.length >= MIN_SEARCH_TOKEN_LENGTH) {
				result.push(word);
			}
		});
		return result;
	}

})();
