var mysql = require('mysql');
var _ = require('underscore');
var dbcredentials = require('./dbcredentials');
var connection = mysql.createConnection(dbcredentials);

var query = "SELECT * FROM `mahasiswa` WHERE `angkatan` <= 2013 AND `angkatan` >= 2011";
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
	console.log(JSON.stringify(result));
}

connection.end();
