function nimtpb {
	curl -X POST -d "uid=$1" https://nic.itb.ac.id/manajemen-akun/pengecekan-user > crawled-tpb/$1.html
}

while read nim; do
	nimtpb $nim
done < $1
