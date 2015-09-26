$(function initializeParse() {
	var parseKeys = require('./parse-keys');
	Parse.initialize(parseKeys.getAppId(), parseKeys.getClientKey());
});

$(function initializeUI() {
	$.material.init();
	$('[data-toggle="popover"]').popover();
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
									'<h5><strong>' + data.nim + '</strong> - ' + data.name + '</h5>' +
								'</a>' + 
							'</div>';
			searchResultDom.append(itemDom);
		});
		if (results.count > 0) {
			showSuccessMessage('Menunjukkan hasil ' + results.start + ' sampai ' + results.end + ' dari ' + results.count + ' untuk <strong>' + result.query.query + '</strong>.');
		} else {
			showSuccessMessage('Tidak ditemukan hasil untuk <strong>' + result.query.query + '</strong>');
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
		$(this).blur();
		doSearchFromInput();
	});

	function doSearchFromInput() {
		var query = $('#search-query').val();
		if (query.length > 0) {
			doSearch({
				query: query,
				page: 1
			});
		}
	}

	$('#retry-search-button').on('click', function() {
		doSearch(lastQuery);
	});

	$('#filter-select,#batch-select').on('change', function() {
		filters = [];
		$('#filter-select,#batch-select').each(function() {
			var s = $(this).val();
			if (s) $.each(s, function(i, code) {
				filters.push(code);
			});
		});

		doSearchFromInput();
	});

	$('#toggle-filter').on('change', function(e) {
		console.log("value = " + $(this).is(':checked'));
		if ($(this).is(':checked')) {
			$('#filters').collapse('show');
			lazilyEnableChosen();
			isFilterEnabled = true;
		} else {
			$('#filters').collapse('hide');
			isFilterEnabled = false;
		}
		if (!isFilterEmpty()) {
			doSearchFromInput();
		}
	});

	function isFilterEmpty() {
		return !filters || filters.length === 0;
	}

	function lazilyEnableChosen() {
		if (chosen === null) {
			chosen = $('#filter-select').chosen({
				placeholder_text_multiple: " ",
				search_contains: true
			});

			$('#batch-select').chosen({
				placeholder_text_multiple: " ",
				search_contains: true
			});
		}
	}

});
