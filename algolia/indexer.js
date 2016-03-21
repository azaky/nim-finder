var mysql = require('mysql');
var algoliasearch = require('algoliasearch');
var _ = require('lodash');
var async = require('async');

var dbcredentials = require('./dbcredentials');
var algoliacredentials = require('./algoliacredentials');

var connection = mysql.createConnection(dbcredentials);

var RANGE_PATTERN = /(\d+)_(\d+)/;
var QUERY = "SELECT * FROM `mahasiswa` WHERE `angkatan` BETWEEN {1} AND {2}";

_.each(algoliacredentials, function(algoliacred, id) {
	var matches = RANGE_PATTERN.exec(id);
	if (matches != null) {
		console.log("Processing " + id + " ...");
		var query = QUERY.replace("{1}", matches[1]).replace("{2}", matches[2]);
		try {
			connection.query(query, getExportFunction(id, algoliacred));
		} catch (e) {
			console.log(e.message);
		}
	} else {
		console.log("invalid id: " + id);
	}
});

function getExportFunction(id, algoliacred) {
	var client = algoliasearch(algoliacred.appId, algoliacred.adminApiKey);
	var index = client.initIndex('mahasiswa');

	index.setSettings({
		attributesToIndex: ["nama", "nim"],
		customRanking: ["asc(nim)"]
	});

	var ret = function(err, rows, fields) {
		if (err) throw err;

		var result = [];
		rows.forEach(function(row) {
			var jurusan = row.nim.substr(0, 3);
			var nims = _.filter(
					row.nims.split(/[^\w]+/),
					function(nim) {
						return nim.match(/\w{8}/);
					})
			result.push({
				objectID: row.nim,
				nim: row.nim,
				nims: nims,
				nama: row.nama,
				angkatan: row.angkatan,
				status: row.status,
				_tags: [jurusan, "" + row.angkatan]
			});
		});

		console.log(id + ": Exporting " + result.length + " records ...");

		index.saveObjects(result, cleanup);
		// var chunkedResult = _.chunk(result, 1000);
		// async.each(chunkedResult, index.saveObjects.bind(index), cleanup);
	};

	var cleanup = function(err) {
		if (err) {
			throw err;
		}

		console.log(id + ": Indexing done");
		client.destroy();
	};

	return ret;
}

connection.end();
