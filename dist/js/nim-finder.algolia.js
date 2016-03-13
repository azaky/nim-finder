$(function() {
	var facultyMap = {};
	var lastQuery = null;
	var filters = [];
	var isFilterEnabled = false;
	var chosen = null;
	var clients = [];
	var indexes = [];

	function init() {
		initAlgolia();
		initUI();
		initFilter();
		initClipboard();
	}

	function initAlgolia() {
		var algoliaKeys = require('./algolia-keys');
		$.each(algoliaKeys, function(i, key) {
			try {
				var client = algoliasearch(key.appId, key.apiKey);
				var index = client.initIndex('mahasiswa');
				clients.push(client);
				indexes.push(index);
			} catch (e) {
				console.log(e);
			}
		});
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

		for (var i = 2011; i <= 2015; ++i) {
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

	function doSearch(rawquery) {
		query = buildQuery(rawquery);
		lastQuery = rawquery;
		$.each(indexes, function(i, index) {
			index.search(query)
				.then(showResult)
				.catch(showError);
		});
	}

	function buildQuery(rawquery) {
		var query = {
			query: rawquery.query || "",
			page: (rawquery.page || 1) - 1,
			hitsPerPage: 10
		};
		if (isFilterEnabled && filters.length) {
			query.tagFilters = filters;
		}
		return query;
	}

	function clearScreen() {
		$('#search-loading-bar').show();
		$('#search-info').hide();
		$('#search-result-box').hide();
	}

	function showResult(result) {
		var searchResultDom = $('#search-result-box');
		searchResultDom.html('');

		$.each(result.hits, function(i, data) {
			searchResultDom.append(renderItem(data));
		});
		searchResultDom.show();

		$('#search-loading-bar').hide();

		if (result.nbHits > 0) {
			showSuccessMessage('Menunjukkan hasil ' + (result.page * result.hitsPerPage + 1) + ' sampai ' + (Math.min((result.page + 1) * result.hitsPerPage, result.nbHits)) + ' dari ' + result.nbHits + ' untuk <strong>' + result.query + '</strong>.');
		} else {
			showSuccessMessage('Tidak ditemukan hasil untuk <strong>' + result.query + '</strong>');
		}
		setupPagination(result.page + 1, result.nbPages, function(event, page) {
			var query = {
				query: result.query,
				page: page
			};
			doSearch(query);
		});
	}

	function renderItem(data) {
		var item = template;
		$.each({
			program: facultyMap[data.nim.substr(0, 3)] || "Unknown",
			name: data.nama,
			nim: data.nim,
			nims: JSON.stringify(data.nims).replace(/"/g, "'"),
			is_alumni: data.status == "Alumni" ? ' <img src="dist/images/alumni.png" data-toggle="tooltip" data-placement="top" title="Alumni">' : ''
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

	$('#search-query').on('keyup', function(e) {
		doSearchFromInput();
	});
	$('#search-query').on('change', function(e) {
		// hide keyboard in mobilie
		$(this).blur();
		doSearchFromInput();
	});

	$('#retry-search-button').on('click', function() {
		doSearch(lastQuery);
	});

	$('#filter-select,#batch-select').on('change', function() {
		codeFilter = [];
		$('#filter-select').each(function() {
			var s = $(this).val();
			if (s) $.each(s, function(i, code) {
				codeFilter.push(code);
			});
		});
		batchFilter = [];
		$('#batch-select').each(function() {
			var s = $(this).val();
			if (s) $.each(s, function(i, code) {
				batchFilter.push(code);
			});
		});
		filters = [];
		if (codeFilter.length) {
			filters.push(codeFilter);
		}
		if (batchFilter.length) {
			filters.push(batchFilter);
		}

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
		toggleNim(this);
	});

	init();
	$('#search-query').focus();
});
