$(function initializeParse() {
	var parseKeys = require('./parse-keys');
	Parse.initialize(parseKeys.getAppId(), parseKeys.getClientKey());
});

$(function initializeMaterial() {
	$.material.init();
});

$(function initializeFacultiesFilter() {
	var faculties = require('./faculties');
	var select = $('#filter-select');

	$.each(faculties, function(i, faculty) {
		var optgroup = '<optgroup label="' + faculty.name + '">'
		$.each(faculty.programs, function(j, program) {
			optgroup += '<option value="' + program.code + '">' + program.code + ' | ' + program.name + '</option>';
		});
		optgroup += '</optgroup>';
		select.append(optgroup);
	});
});

$(function () {
	var lastQuery = null;
	var filters = [];
	var isFilterEnabled = false;
	var chosen = null;

	function doSearch(query) {
		clearScreen();
		if (isFilterEnabled) {
			query.filters = filters;
		}
		lastQuery = query;
		Parse.Cloud.run('search', query, {
			success: showResult,
			error: showError
		});
	}

	function clearScreen() {
		$('#search-loading-bar').show();
		// TODO: Add smooth fade out/scroll
		$('#search-info').hide();
		$('#search-result-box').hide();
	}

	function showResult(result) {
		var searchResultDom = $('#search-result-box');
		searchResultDom.html('');
		searchResultDom.show();
		$('#search-loading-bar').hide();

		var results = result.results;
		$.each(results.data, function(i, data) {
			var itemDom = '<div class="search-result">' + 
								'<a href="javascript:void(0)" class="btn btn-material-green btn-raised btn-block">' +
									'<h5><strong>' + data.nim + '</strong> | ' + data.name + '</h5>' +
								'</a>' + 
							'</div>';
			searchResultDom.append(itemDom);
		});
		if (results.count > 0) {
			showSuccessMessage('Showing result ' + results.start + ' to ' + results.end + ' of ' + results.count + ' for <strong>' + result.query.query + '</strong>.');
		} else {
			showSuccessMessage('No result found for <strong>' + result.query.query + '</strong>');
		}
		setupPagination(results.page, results.numPages, function(event, page) {
			var query = $.extend({}, result.query);
			query.page = page;
			doSearch(query);
		});
	}

	function showSuccessMessage(message) {
		$('#search-info').show();
		$('#search-info-success').show();
		$('#search-info-success-message').html(message);
		$('#search-info-error').hide();
	}

	function setupPagination(page, numPages, onPageClick) {
		$('#pagination').html('<ul></ul>'); // reinitialization is not supported
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

	function showError(error) {
		$('#search-loading-bar').hide();
		$('#pagination').html('<ul></ul>');
		showErrorMessage(error.message);
	}

	function showErrorMessage(message) {
		$('#search-info').show();
		$('#search-info-error').show();
		$('#search-info-error-message').html(message);
		$('#search-info-success').hide();
	}

	$('#search-query').on('change', function(e) {
		doSearch({
			query: $(this).val(),
			page: 1
		}, showResult);
	});

	$('#retry-search-button').on('click', function(e) {
		doSearch(lastQuery);
	});

	$('#filter-select').on('change', function(e) {
		s = $(this).val();
		filters = [];
		if (s) $.each(s, function(i, code) {
			filters.push(code);
		});

		redoSearchAfterFilterChanged();
	});

	$('#toggle-filters a').on('click', function(e) {
		$('#filters').collapse('toggle');
		var toggle = $('#toggle-filters');
		if (toggle.data('status') === "hidden") {
			lazilyEnableChosen();
			$('#toggle-filters-show').hide();
			$('#toggle-filters-hide').show();
			toggle.data('status', 'shown');
			isFilterEnabled = true;
		} else {
			$('#toggle-filters-show').show();
			$('#toggle-filters-hide').hide();
			toggle.data('status', 'hidden');
			isFilterEnabled = false;
		}
		redoSearchAfterFilterChanged();
	});

	function lazilyEnableChosen() {
		if (chosen === null) {
			chosen = $('#filter-select').chosen({
				placeholder_text_multiple: " ",
				search_contains: true
			});
		}
	}

	function redoSearchAfterFilterChanged() {
		var query = $('#search-query').val();
		if (query.length > 0) {
			doSearch({
				query: query,
				page: 1
			});
		}
	}

});
