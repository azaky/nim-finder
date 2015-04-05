var filter = {};
var allData = {};
var maxResult = 100;

$(function() {
	// List of supported faculties
	var faculties;

	var done = false;

	$.ajax({
		dataType: "json",
		url: "./dist/js/faculties.json",
		success: function(data) {
			faculties = data;

			// set up filters
			html = "";
			$.each(faculties, function(ifaculty, faculty) {
				template = '<div class="filter-faculty">' + 
								'<a class="btn btn-flat btn-sm btn-material-red-500 toggle-faculty" data-toggle="collapse" href="#filter-faculty-'+ faculty.abbr +'" aria-expanded="false" aria-controls="filter-faculty-'+ faculty.abbr +'">' +
									faculty.name +
	                            '</a>' +
	                            	'<div class="collapse" id="filter-faculty-'+ faculty.abbr +'">';
	            for (i = 0; i < faculty.programs.length; ++i) {
	            	template += '<div class="checkbox">' +
	            					'<label>' +
	            						'<input type="checkbox" class="filter-faculty-checkbox" data-faculty="' + faculty.programs[i].code + '"> ' +
	            							faculty.programs[i].code + " | " + faculty.programs[i].name +
	            					'</label>' + 
	            				'</div>';
	            }
	            template += '</div></div>';
	            html += template;
			});
			$("#filter-faculty-box").html(html);

            $.material.init();
		}
	});
	
	function updateFilter() {
		html = "";
		$.each(filter, function(i, f) {
			if (f) html += '<span class="label label-info">' + i + '</span> ';
		});
		$('#filter-faculty-summary').html(html);
	}

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

	$('body').on('change', '.filter-faculty-checkbox', function() {
		if ($(this).is(':checked')) {
			// add to filter if not exist
			filter[$(this).data('faculty')] = true;

			// load json
			loadData($(this).data('faculty'));
		} else {
			// remove from filter
			filter[$(this).data('faculty')] = undefined;
		}
		updateFilter();
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
					}
				}
			});
		});

		searchResultDom = $('#search-result-box');
		searchResultDom.html('');
		
		$.each(result, function(i, data) {
			var template = '<div class="col-md-12 search-result">' + 
                                '<a href="javascript:void(0)" class="btn btn-primary btn-raised btn-block">' +
                                    '<h5>' + data.nim + '</h5>' +
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
});
