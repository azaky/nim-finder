var Search = function() {

	var STUDENT_OBJECT = Parse.Object.extend("Student");
	var RESULTS_PER_PAGE = 20;
	var MIN_SEARCH_TOKEN_LENGTH = 1;

	this.search = function(rawQuery, options, callback) {
		var query = getQuery(rawQuery, options);
		var promiseFind = query.find();
		var promiseCount = query.count();

		var callCallbackSuccess = function(results, count) {
			callback({
				query: rawQuery,
				results: results,
				count: count
			});
		};
		var callCallbackFailure = function(errors) {
			callback({
				query: rawQuery,
				errors: errors
			});
		};

		Parse.Promise
				.when(promiseFind, promiseCount)
				.then(callCallbackSuccess, callCallbackFailure);
	};

	var getQuery = (function(rawQuery, options) {
		var searchTokens = splitQuery(rawQuery.toLowerCase());

		return getNimFilterQuery(options.filters)
				.containsAll("search_token", searchTokens)
				.limit(RESULTS_PER_PAGE)
				.skip(getNumSkipped(options.page));
	});

	var getNimFilterQuery = (function(filters) {
		if (filters !== undefined) {
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

	var splitQuery = (function(rawQuery) {
		var result = [];
		$.each(rawQuery.split(/\s/), function(i, word) {
			if (word.length >= MIN_SEARCH_TOKEN_LENGTH) {
				result.push(word);
			}
		});
		return result;
	});

	var regexEscape = (function(regex) {
		return regex.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
	});
};

var filter = {};
var allData = {};
var maxResult = 100;

function loadData(code) {
	if (allData[code]) return;

	// perform ajax call
	$.ajax({
		dataType: "json",
		url: "./data/" + code + ".json",
		async: true,
		success: function(data) {
			allData[code] = data;
		}
	});
}

$(function() {
	// List of supported faculties
	var faculties;

	var done = false;

	var searchObject = new Search();

	$.ajax({
		dataType: "json",
		url: "./data/faculties.json",
		success: function(data) {
			faculties = data;

			// set up filters
			select = $('#filter-select');
			$.each(faculties, function(i, faculty) {
				optgroup = '<optgroup label="' + faculty.name + '">'
				$.each(faculty.programs, function(j, program) {
					optgroup += '<option value="' + program.code + '">' + program.code + ' | ' + program.name + '</option>';
				});
				optgroup += '</optgroup>';
				select.append(optgroup);
			});
			// if the cookie present, select it
			if (Cookies('nf_filter')) {
				s = JSON.parse(Cookies('nf_filter'));
				if (s) $.each(s, function(i, e) {
					$('#filter-select option[value="' + e + '"]').prop('selected', true);
					loadData(e);
					filter[e] = true;
				});
			}

			// introducing chosen.js
			select.chosen({
				placeholder_text_multiple: " ",
				search_contains: true
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

	function showResult(results) {
		searchResultDom = $('#search-result-box');
		searchResultDom.html('');

		if (results.results !== undefined) {
			$.each(results.results, function(i, data) {
				var template = '<div class="col-md-3 search-result">' + 
		                            '<a href="javascript:void(0)" class="btn btn-material-green btn-raised btn-block">' +
		                                '<h5><strong>' + data.get("nim") + '</strong></h5>' +
		                                '<h5>' + data.get("name") + '</h5>' +
		                            '</a>' + 
		                        '</div>';
		        searchResultDom.append(template);
			});
			$('#search-info').html('Showing ' + results.results.length + ' of ' + results.count + ' results for <strong>' + results.query + '</strong>');
		} else if (results.error !== undefined) {
			$('#search-info').html('Error : ' + JSON.stringify(results.error));
		}
	}

	$('#search-query').on('change', function(e) {
		searchObject.search($(this).val(), {}, showResult);
	});

	$('#filter-select').on('change', function(e) {
		s = $(this).val();
		filter = {};
		if (s) $.each(s, function(i, t) {
			filter[t] = true;
			loadData(t);
		});

		// persists the preference
		Cookies.set('nf_filter', JSON.stringify(s), {expires: Infinity});

		// change the search result
		search($('#search-query').val());
	});

});
