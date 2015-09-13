var faculties = [{"abbr":"FMIPA","name":"Fakultas Matematika dan Ilmu Pengetahuan Alam","programs":[{"code":101,"name":"Matematika"},{"code":102,"name":"Fisika"},{"code":103,"name":"Astronomi"},{"code":105,"name":"Kimia"},{"code":160,"name":"Tahap Tahun Pertama FMIPA"}]},{"abbr":"SITH","name":"Sekolah Ilmu dan Teknologi Hayati","programs":[{"code":104,"name":"Mikrobiologi"},{"code":106,"name":"Biologi"},{"code":112,"name":"Rekayasa Hayati"},{"code":114,"name":"Rekayasa Pertanian"},{"code":115,"name":"Rekayasa Kehutanan"},{"code":119,"name":"Teknologi Pasca Panen"},{"code":161,"name":"Tahap Tahun Pertama SITH - Program Sains"},{"code":198,"name":"Tahap Tahun Pertama SITH - Program Rekayasa"}]},{"abbr":"SF","name":"Sekolah Farmasi","programs":[{"code":107,"name":"Sains dan Teknologi Farmasi"},{"code":116,"name":"Farmasi Klinik dan Komunitas"},{"code":162,"name":"Tahap Tahun Pertama SF"}]},{"abbr":"FTTM","name":"Fakultas Teknik Pertambangan dan Perminyakan","programs":[{"code":121,"name":"Teknik Pertambangan"},{"code":122,"name":"Teknik Perminyakan"},{"code":123,"name":"Teknik Geofisika"},{"code":125,"name":"Teknik Metalurgi"},{"code":164,"name":"Tahap Tahun Pertama FTTM"}]},{"abbr":"FITB","name":"Fakultas Ilmu dan Teknologi Kebumian","programs":[{"code":120,"name":"Teknik Geologi"},{"code":128,"name":"Metereologi"},{"code":129,"name":"Oseanografi"},{"code":151,"name":"Teknik Geodesi dan Geomatika"},{"code":163,"name":"Tahap Tahun Pertama FITB"}]},{"abbr":"FTI","name":"Fakultas Teknologi Industri","programs":[{"code":130,"name":"Teknik Kimia"},{"code":133,"name":"Teknik Fisika"},{"code":134,"name":"Teknik Industri"},{"code":144,"name":"Manajemen Rekayasa Industri"},{"code":167,"name":"Tahap Tahun Pertama FTI"}]},{"abbr":"STEI","name":"Sekolah Teknik Elektro dan Informatika","programs":[{"code":132,"name":"Teknik Elektro"},{"code":135,"name":"Teknik Informatika"},{"code":165,"name":"Tahap Tahun Pertama STEI"},{"code":180,"name":"Teknik Tenaga Listrik"},{"code":181,"name":"Teknik Telekomunikasi"},{"code":182,"name":"Sistem dan Teknologi Informasi"},{"code":183,"name":"Teknik Biomedis"}]},{"abbr":"FTMD","name":"Fakultas Teknik Mesin dan Dirgantara","programs":[{"code":131,"name":"Teknik Mesin"},{"code":136,"name":"Aeronotika dan Astronotika"},{"code":137,"name":"Teknik Material"},{"code":169,"name":"Tahap Tahun Pertama FTMD"}]},{"abbr":"FTSL","name":"Fakultas Teknik Sipil dan Lingkungan","programs":[{"code":150,"name":"Teknik Sipil"},{"code":153,"name":"Teknik Lingkungan"},{"code":155,"name":"Teknik Kelautan"},{"code":157,"name":"Rekayasa Infrastruktur Lingkungan"},{"code":158,"name":"Teknik dan Pengelolaan Sumber Daya Air"},{"code":166,"name":"Tahap Tahun Pertama FTSL"}]},{"abbr":"SAPPK","name":"Sekolah Arsitektur, Perencanaan dan Pengembangan Kebijakan","programs":[{"code":152,"name":"Arsitektur"},{"code":154,"name":"Perencanaan Wilayah dan Kota"},{"code":199,"name":"Tahap Tahun Pertama SAPPK"}]},{"abbr":"FSRD","name":"Fakultas Seni Rupa dan Desain","programs":[{"code":168,"name":"Tahap Tahun Pertama FSRD"},{"code":170,"name":"Seni Rupa"},{"code":172,"name":"Kriya"},{"code":173,"name":"Desain Interior"},{"code":174,"name":"Desain Komunikasi Visual"},{"code":175,"name":"Desain Produk"},{"code":179,"name":"MKDU"}]},{"abbr":"SBM","name":"Sekolah Bisnis dan Manajemen","programs":[{"code":190,"name":"Manajemen"},{"code":192,"name":"Kewirausahaan"},{"code":197,"name":"Tahap Tahun Pertama SBM"}]}];

// var StudentObject = Parse.Object.extend("Student");
var allStudentData = [];

var saveFile = function(text, name, type) {
	var file = new Blob([text], {type: type});
	window.open(URL.createObjectURL(file));
}

var addAllSubstring = function(string, tokens, memo) {
	var lowercase = string.toLowerCase();
	for (var i = 0; i < lowercase.length; ++i) {
		for (var j = i + 1; j <= lowercase.length; ++j) {
			var substring = lowercase.substring(i, j);
			if (memo[substring] === undefined) {
				tokens.push(substring);
				memo[substring] = true;
			}
		}
	}
}

var getSearchToken = function(studentData) {
	var tokens = [];
	var memo = {};

	addAllSubstring(studentData.nim.toString(), tokens, memo);
	$.each(studentData.name.split(' '), function(i, part) {
		addAllSubstring(part, tokens, memo);
	});

	return tokens;
}

var saveData = function(studentData) {
	studentData.search_token = getSearchToken(studentData);
	allStudentData.push(studentData);
	// var studentObject = new StudentObject();
	// studentObject.set("name", studentData.name);
	// studentObject.set("nim", studentData.nim);
	// studentObject.set("data", studentData.nim + " " + studentData.name);

	// studentObject.save(null, {
	// 	success: function(studentObject) {
	// 		console.log("New object created with objectId: " + studentObject.id);
	// 	},
	// 	error: function(studentObject, error) {
	// 		console.log("Failed to create new object, with error code: " + error.message);
	// 	}
	// });
}

function saveStudentsForProgram(code) {
	$.ajax({
		dataType: "json",
		url: "./data/" + code + ".json",
		async: false,
		success: function(data) {
			$.each(data, function(i, studentData) {
				saveData(studentData);
			});
		}
	});
}

$.each(faculties, function(i, faculty) {
	console.log("Processing faculty " + faculty.abbr);
	$.each(faculty.programs, function(j, program) {
		console.log("Processing program " + program.code);
		saveStudentsForProgram(program.code);
	});
});

saveFile(JSON.stringify({"results":allStudentData}), "allStudentData.json", "text/plain");
