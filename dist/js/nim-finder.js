var Search = function() {

	var STUDENT_OBJECT = Parse.Object.extend("Student");
	var RESULTS_PER_PAGE = 20;
	var MIN_SEARCH_TOKEN_LENGTH = 1;

	this.search = function(query, callback) {
		console.log(JSON.stringify(query));
		var parseQuery = getQuery(query);
		var promiseFind = parseQuery.find();
		var promiseCount = parseQuery.count();

		var callCallbackSuccess = function(results, count) {
			callback({
				query: query,
				results: {
					data: results,
					count: count,
					start: getNumSkipped(query.page) + 1,
					end: getNumSkipped(query.page) + results.length,
					page: query.page || 1,
					numPages: getNumPages(count)
				}
			});
		};
		var callCallbackFailure = function(errors) {
			callback({
				query: query,
				errors: errors
			});
		};

		Parse.Promise
				.when(promiseFind, promiseCount)
				.then(callCallbackSuccess, callCallbackFailure);
	};

	var getQuery = (function(query) {
		var searchTokens = splitQuery(query.query.toLowerCase());

		return getNimFilterQuery(query.filters)
				.containsAll("search_token", searchTokens)
				.limit(RESULTS_PER_PAGE)
				.skip(getNumSkipped(query.page));
	});

	var getNimFilterQuery = (function(filters) {
		if (filters instanceof Array && filters.length > 0) {
			var filterQueries = [];
			$.each(filters, function(i, filter) {
				var filterQuery = new Parse.Query(STUDENT_OBJECT);
				filterQuery.startsWith("nim", filter);
				filterQueries.push(filterQuery);
			});
			return Parse.Query.or.apply(null, filterQueries);
		} else {
			return new Parse.Query(STUDENT_OBJECT);
		}
	});

	var getNumSkipped = (function(page) {
		if (!page) {
			return 0;
		} else {
			return (page - 1) * RESULTS_PER_PAGE;
		}
	});

	var getNumPages = (function(count) {
		return Math.ceil(count / RESULTS_PER_PAGE);
	});

	var splitQuery = (function(rawQuery) {
		var result = [];
		$.each(rawQuery.split(/\s/), function(i, word) {
			if (word.length >= MIN_SEARCH_TOKEN_LENGTH) {
				result.push(word);
			}
		});
		return result;
	});
};

// Only for study program codes filter. Probably will add more filters in the
// future (batch, for example)
var Filter = function() {
	var COOKIE_KEY = "nf_filter";
	var filters = {};
	var that = this;

	var loadFromCookies = (function() {
		var cookie = JSON.parse(Cookies(COOKIE_KEY));
		if (cookie) {
			$.each(cookie, function(i, code) {
				filters[code] = true;
			});
		}
	});
	loadFromCookies();

	var updateCookie = (function() {
		Cookies.set(COOKIE_KEY, JSON.stringify(filters), {expires: Infinity});
	});

	this.getAll = function() {
		var filtersArray = [];
		$.each(filters, function(code, unused) {
			filtersArray.push(code);
		});
		return filtersArray;
	};

	this.add = function(code) {
		filters[code] = true;
		updateCookie();
		return that;
	};

	this.addAll = function(codes) {
		$.each(codes, function(i, code) {
			that.add(code);
		});
	};

	this.remove = function(code) {
		filters[code] = undefined;
		updateCookie();
		return that;
	};

	this.removeAll = function() {
		filters = {};
		updateCookie();
	}

	this.each = function(callback) {
		$.each(filters, function(i, code) {
			callback(code);
		});
	};
};

var filter = {};
var maxResult = 100;

$(function() {
	// List of supported faculties
	var faculties;

	var searchObject = new Search();
	var filters = new Filter();
	var chosen = null;

	$.ajax({
		dataType: "json",
		url: "./data/faculties.json",
		success: function(data) {
			faculties = data;

			// set up filters
			var select = $('#filter-select');
			$.each(faculties, function(i, faculty) {
				optgroup = '<optgroup label="' + faculty.name + '">'
				$.each(faculty.programs, function(j, program) {
					optgroup += '<option value="' + program.code + '">' + program.code + ' | ' + program.name + '</option>';
				});
				optgroup += '</optgroup>';
				select.append(optgroup);
			});
			filters.each(function(code) {
				$('#filter-select option[value="' + code + '"]').prop('selected', true);
			});
		}
	});

	function printResultsOnConsole(results) {
		if (results.results !== undefined) {
			console.log("Successfully retrieved " + results.results.length + " data");
			for (var i = 0; i < results.results.length; i++) {
				var object = results.results[i];
				console.log(object.get('nim') + ' - ' + object.get('name'));
			}
		} else if (results.error !== undefined) {
			console.log("Error: " + results.error.code + " " + results.error.message);
		}
	}

	function setupPagination(page, numPages, onPageClick) {
		$('#pagination').html('<ul></ul>');
		if (numPages > 0) {
			$('#pagination ul').twbsPagination({
				totalPages: numPages,
				visiblePages: 5,
				startPage: page,
				first: "&#x219E",
				prev: "&#x2190",
				next: "&#x2192",
				last: "&#x21A0",
				onPageClick: onPageClick
			});
		}
	}

	function showResult(result) {
		var searchResultDom = $('#search-result-box');
		searchResultDom.html('');
		var searchInfoDom = $('#search-info');
		searchInfoDom.html('');

		if (result.results !== undefined) {
			var results = result.results;
			$.each(results.data, function(i, data) {
				var template = '<div class="col-md-3 search-result">' + 
									'<a href="javascript:void(0)" class="btn btn-material-green btn-raised btn-block">' +
										'<h5><strong>' + data.get("nim") + '</strong></h5>' +
										'<h5>' + data.get("name") + '</h5>' +
									'</a>' + 
								'</div>';
				searchResultDom.append(template);
			});
			if (results.count > 0) {
				searchInfoDom.html('Showing result ' + results.start + ' to ' + results.end + ' of ' + results.count + ' for <strong>' + result.query.query + '</strong>');
			} else {
				searchInfoDom.html('No result found for <strong>' + result.query.query + '</strong>');
			}
			setupPagination(results.page, results.numPages, function(event, page) {
				var query = $.extend({}, result.query);
				query.page = page;
				searchObject.search(query, showResult);
			});
		} else if (result.error !== undefined) {
			$('#search-info').html('Error : ' + JSON.stringify(result.error));
		}
	}

	$('#search-query').on('change', function(e) {
		searchObject.search({
			query: $(this).val(),
			page: 1,
			filters: filters.getAll()
		}, showResult);
	});

	$('#filter-select').on('change', function(e) {
		s = $(this).val();
		filters.removeAll();
		if (s) $.each(s, function(i, code) {
			filters.add(code);
		});

		// change the search result
		searchObject.search({
			query: $("#search-query").val(),
			page: 1,
			filters: filters.getAll()
		}, showResult);
	});

	$('#toggle-filters').on('click', function(e) {
		$('#filters').collapse('toggle');
		if ($(this).data('status') === "hidden") {
			// introducing chosen.js
			if (chosen === null) {
				chosen = $('#filter-select').chosen({
					placeholder_text_multiple: " ",
					search_contains: true
				});
			}
			$(this).data('status', 'shown');
			$(this).text('Hide Filters ...');
		} else {
			$(this).data('status', 'hidden');
			$(this).text('Show Filters ...');
		}
	});
});
