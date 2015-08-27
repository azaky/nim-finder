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

	var RESULTS_PER_PAGE = 20;
	var STUDENT_OBJECT = Parse.Object.extend("Student");

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

	function search(rawQuery, options, callback) {
		var query = getQuery(rawQuery, options);
		console.log("query: " + JSON.stringify(query));
		var promiseFind = query.find();
		var promiseCount = query.count();

		var callCallbackSuccess = function(results, count) {
			callback({
				query: rawQuery,
				results: results,
				count: count
			});
		};
		var callCallbackFailure = function(error) {
			callback({
				query: rawQuery,
				error: error
			});
		};

		Parse.Promise
				.when(promiseFind, promiseCount)
				.then(callCallbackSuccess, callCallbackFailure);
	}

	function getQuery(rawQuery, options) {
		var splittedQuery = splitQuery(rawQuery.toLowerCase());

		var query = getNimFilterQuery(options.filters);
		query.containsAll("search_token", splittedQuery);

		query.limit(RESULTS_PER_PAGE);
		if (options.page !== undefined) {
			query.skip((options.page - 1) * RESULTS_PER_PAGE);
		}

		return query;
	}

	function getNimFilterQuery(filters) {
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
	}

	function splitQuery(rawQuery) {
		var result = [];
		$.each(rawQuery.split(/\s/), function(i, word) {
			if (word.length >= 3) {
				result.push(word);
			}
		});
		return result;
	}

	function regexEscape(regex) {
		return regex.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
	}

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
		search($(this).val(), {page: 2}, showResult);
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
