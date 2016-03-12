$(function() {
	var facultyMap = {};
	var lastQuery = null;
	var filters = [];
	var isFilterEnabled = false;
	var chosen = null;

	function init() {
		initParse();
		initUI();
		initFilter();
		initClipboard();
	}

	function initParse() {
		var parseKeys = require('./parse-keys');
		Parse.initialize(parseKeys.getAppId(), parseKeys.getClientKey());
	}

	function initUI() {
		$.material.init();
		$('body').tooltip({
			selector: '[data-toggle=tooltip]:not([data-trigger=manual])'
		});
	}

	function initClipboard() {
		var success = function(e) {
			$(e.trigger).tooltip("show");
			setTimeout(function() {
				$(e.trigger).tooltip("hide");
			}, 500);
		};
		var clipNim = new Clipboard('.btn.copy-nim', {
			text: function(trigger) {
				return $(trigger).closest('.search-result-item').find(".nim").text();
			}
		});
		var clipName = new Clipboard('.btn.copy-name', {
			text: function(trigger) {
				return $(trigger).closest('.search-result-item').find(".name").text();
			}
		});
		clipNim.on('success', success);
		clipName.on('success', success);
	}

	function initFilter() {
		var faculties = require('./faculties');

		$.each(faculties, function(i, faculty) {
			var optgroup = '<optgroup label="' + faculty.name + '">'
			$.each(faculty.programs, function(j, program) {
				optgroup += '<option value="' + program.code + '">' + program.code + ' | ' + program.name + '</option>';
				facultyMap[program.code] = program.name;
			});
			optgroup += '</optgroup>';
			$('#filter-select').append(optgroup);
		});

		for (var i = 2010; i <= 2015; ++i) {
			$('#batch-select').append('<option value="' + i + '">' + i + '</option>');
		}
	}

	function doSearchFromInput() {
		var query = $('#search-query').val();
		if (query.length > 0) {
			doSearch({
				query: query,
				page: 1
			});
		}
	}

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
		$('#search-info').hide();
		$('#search-result-box').hide();
	}

	function showResult(result) {
		var searchResultDom = $('#search-result-box');
		searchResultDom.html('');

		var results = result.results;
		$.each(results.data, function(i, data) {
			searchResultDom.append(renderItem(data));
		});
		searchResultDom.show();

		$('#search-loading-bar').hide();

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

	function renderItem(data) {
		var item = template;
		$.each({
			program: facultyMap[data.nim.substr(0, 3)] || "Unknown",
			name: data.name,
			nim: data.nim,
			nims: JSON.stringify(data.nims).replace(/"/g, "'"),
			is_alumni: data.is_alumni ? ' <img src="dist/images/alumni.png" data-toggle="tooltip" data-placement="top" title="Alumni">' : ''
		}, function(key, value) {
			item = item.replace("{{" + key + "}}", value);
		});
		return item;
	}

	function showSuccessMessage(message) {
		$('#search-info').show();
		$('#search-info-success').show();
		$('#search-info-success-message').html(message);
		$('#search-info-error').hide();
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

	function showError(error) {
		$('#search-loading-bar').hide();
		$('#pagination').html('<ul></ul>');
		showErrorMessage(error.code);
	}
	
	function showErrorMessage(message) {
		$('#search-info').show();
		$('#search-info-error').show();
		$('#search-info-error-message').html(message);
		$('#search-info-success').hide();
	}

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

	function toggleNim(e) {
		var nims = $(e).data("nims").split(/[^\w]+/);
		var currentNim = $(e).html();
		console.log(nims);
		console.log(currentNim);
		var i = 0;
		while (i < nims.length) {
			if (currentNim == nims[i]) {
				break;
			}
			++i;
		}
		if (i < nims.length) {
			while (true) {
				++i;
				if (i == nims.length) {
					i = 0;
				}
				if (nims[i].length) {
					break;
				}
			}
			$(e).html(nims[i]);
		}
	}

	var template = ' \
			<div class="search-result-item panel"> \
				<div class="panel-body"> \
					<div class="row"> \
						<div class="col-lg-12"> \
							<h5> \
								<strong><a href="javascript:void(0)" class="nim" data-nims="{{nims}}" data-toggle="tooltip" data-placement="top" title="{{program}}">{{nim}}</a></strong> - <span class="name">{{name}}</span>{{is_alumni}} \
							</h5> \
						</div> \
						<div class="col-lg-12"> \
							<button class="btn btn-sm btn-raised btn-info copy-nim" data-toggle="tooltip" data-trigger="manual" title="Copied!">Copy NIM</button> \
							<button class="btn btn-sm btn-raised btn-info copy-name" data-toggle="tooltip" data-trigger="manual" title="Copied!">Copy Nama</button> \
						</div> \
					</div> \
				</div> \
			</div>';

	$('#search-query').on('change', function(e) {
		$(this).blur();
		doSearchFromInput();
	});

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

	$('body').on('click', '.nim', function() {
		console.log("DIPANGGIL NIH")
		toggleNim(this);
	});

	init();
});
