var algoliasearch = require('algoliasearch');
var _ = require('lodash');

var algoliacredentials = require('./algoliacredentials');

var RANGE_PATTERN = /(\d+)_(\d+)/;

var indices = [];

_.each(algoliacredentials, function(algoliacred, id) {
	var matches = RANGE_PATTERN.exec(id);
	if (matches != null) {
		try {
			var client = algoliasearch(algoliacred.appId, algoliacred.apiKey);
			var index = client.initIndex('mahasiswa');
			indices.push(index);
		} catch (e) {
			console.log(e.message);
		}
	} else {
		console.log("invalid id: " + id);
	}
});

function doSearch(query, tags, callback) {
	var promises = [];
	_.each(indices, function(index) {
		var promise = index.search({
			page: 24,
			query: query,
			tagFilters: tags
		});
		promises.push(promise);
	});
	Promise.all(promises).then(function(values) {
		_.each(values, function(result) {
			console.log(JSON.stringify(result));
			console.log("--");
		})
		var ret = values[0];
		_.each(values.slice(1), function(result) {
			ret.hits = ret.hits.concat(result.hits);
			ret.nbHits += result.nbHits;
			ret.processingTimeMS = Math.max(ret.processingTimeMS, result.processingTimeMS);
		});
		callback(ret);
	}, function(err) {
		callback(null, err);
	});
}

doSearch("zaky", [], function(hits, err) {
	if (err) {
		console.log(err);
	} else {
		console.log(JSON.stringify(hits));
	}
});
