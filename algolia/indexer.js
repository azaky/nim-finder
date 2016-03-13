var mysql = require('mysql');
var algoliasearch = require('algoliasearch');
var _ = require('lodash');
var async = require('async');

var dbcredentials = require('./dbcredentials');
var algoliacredentials = require('./algoliacredentials');

var connection = mysql.createConnection(dbcredentials);
var client = algoliasearch(algoliacredentials.appId, algoliacredentials.adminApiKey);
var index = client.initIndex('mahasiswa');

var query = "SELECT * FROM `mahasiswa`";
connection.query(query, function(err, rows, fields) {
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
	process(result);
});

function process(result) {
	var chunkedResult = _.chunk(result, 1000);
	async.each(chunkedResult, index.saveObjects.bind(index), end);
}

function end(err) {
	if (err) {
		throw err;
	}

	console.log('Indexing done');
}

connection.end();
