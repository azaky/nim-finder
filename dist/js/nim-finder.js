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

	function isQueryEmpty(qa) {
		for (var i = 0; i < qa.length; i++) {
			if (qa[i].length) {
				return false;
			}
		}
		return true;
	}

	function match(slo, qa) {
		var count = 0;
		for (var i = 0; i < qa.length; i++) {
			if (qa[i].length) {
				if (slo.indexOf(qa[i]) >= 0) {
					count++;
				}
			} else {
				count++;
			}
		}
		return count == qa.length;
	}

	function search(q) {
		// split query
		splitted = q.split(" ");

		if (isQueryEmpty(splitted)) {
			$('#search-info').html('');
			$('#search-result-box').html('');
			return;
		}

		result = [];
		$.each(filter, function(key, value) {
			if (value && allData[key])
			$.each(allData[key], function(i, data) {
				if (!allData[key][i].combined) {
					allData[key][i].combined = (data.nim + " " + data.name).toLowerCase();
				}
				if (match(allData[key][i].combined, splitted)) {
					if (result.length < maxResult) {
						result.push(data);
					} else {
						return false;
					}
				}
			});
			if (result.length >= maxResult) return false;
		});

		searchResultDom = $('#search-result-box');
		searchResultDom.html('');
		
		$.each(result, function(i, data) {
			var template = '<div class="col-md-3 search-result">' + 
                                '<a href="javascript:void(0)" class="btn btn-material-green btn-raised btn-block">' +
                                    '<h5><strong>' + data.nim + '</strong></h5>' +
                                    '<h5>' + data.name + '</h5>' +
                                '</a>' + 
                            '</div>';
            searchResultDom.append(template);
		});

		$('#search-info').html('Showing ' + result.length + ' results for <strong>' + q + '</strong>');
	}

	$('#search-query').on('keydown keyup', function(e) {
		search($(this).val());
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
