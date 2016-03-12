/* SnackbarJS - MIT LICENSE (https://github.com/FezVrasta/snackbarjs/blob/master/LICENSE.md) */
(function(c){function d(a){return"undefined"!==typeof a&&null!==a?!0:!1}c(document).ready(function(){c("body").append("<div id=snackbar-container/>")});c(document).on("click","[data-toggle=snackbar]",function(){c(this).snackbar("toggle")}).on("click","#snackbar-container .snackbar",function(){c(this).snackbar("hide")});c.snackbar=function(a){if(d(a)&&a===Object(a)){var b;b=d(a.id)?c("#"+a.id):c("<div/>").attr("id","snackbar"+Date.now()).attr("class","snackbar");var g=b.hasClass("snackbar-opened");d(a.style)?b.attr("class","snackbar "+a.style):b.attr("class","snackbar");a.timeout=d(a.timeout)?a.timeout:3E3;d(a.content)&&(b.find(".snackbar-content").length?b.find(".snackbar-content").text(a.content):b.prepend("<span class=snackbar-content>"+a.content+"</span>"));d(a.id)?b.insertAfter("#snackbar-container .snackbar:last-child"):b.appendTo("#snackbar-container");d(a.action)&&"toggle"==a.action&&(a.action=g?"hide":"show");var e=Date.now();b.data("animationId1",e);setTimeout(function(){b.data("animationId1")===e&&(d(a.action)&&"show"!=a.action?d(a.action)&&"hide"==a.action&&b.removeClass("snackbar-opened"):b.addClass("snackbar-opened"))},50);var f=Date.now();b.data("animationId2",f);0!==a.timeout&&setTimeout(function(){b.data("animationId2")===f&&b.removeClass("snackbar-opened")},a.timeout);return b}return!1};c.fn.snackbar=function(a){var b={};if(this.hasClass("snackbar")){b.id=this.attr("id");if("show"===a||"hide"===a||"toggle"==a)b.action=a;return c.snackbar(b)}d(a)&&"show"!==a&&"hide"!==a&&"toggle"!=a||(b={content:c(this).attr("data-content"),style:c(this).attr("data-style"),timeout:c(this).attr("data-timeout")});d(a)&&(b.id=this.attr("data-snackbar-id"),"show"===a||"hide"===a||"toggle"==a)&&(b.action=a);a=c.snackbar(b);this.attr("data-snackbar-id",a.attr("id"));return a}})(jQuery);

$(function() {
	var facultyMap = {};
	var lastQuery = null;
	var filters = [];
	var isFilterEnabled = false;
	var chosen = null;
	var snackbar = null;

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
		if (!snackbar) {
			snackbar = $.snackbar({
				content: 'NIM Finder akan migrasi ke <img src="dist/images/algolia/Algolia_logo_bg-dark.svg" height=15> dalam waktu dekat ini. <a class="text-info" href="index-algolia.html">Coba versi betanya</a>',
				timeout: 0,
				htmlAllowed: true
			});
		}
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
		toggleNim(this);
	});

	init();
	$('#search-query').focus();
});
