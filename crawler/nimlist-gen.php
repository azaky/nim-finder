<?php

$hostname = "localhost";
$username = "root";
$password = "password";
$dbname = "nim-finder";

$db = mysqli_connect($hostname, $username, $password, $dbname);

foreach ($argv as $nim) {
	$allnim = "";
	if ($nim === $argv[0]) continue;
	if ($nim === "null") {
		$sql = "SELECT nim FROM `mahasiswa` WHERE status IS NULL";
	} else {
		$sql = "SELECT nim FROM `mahasiswa` WHERE nim LIKE '$nim%'";
	}
	$query = $db->query($sql);
	if (!$query) {
		die ("Terjadi kesalahan pada database. " . mysqli_error());
	}
	while ($row = $query->fetch_assoc()) {
		$allnim .= $row["nim"] . "\n";
	}
	file_put_contents("nim" . $nim . ".txt", $allnim);
}
