#include <bits/stdc++.h>
using namespace std;

// #define MODE_PARSE
#define MODE_CONVERT

string codes[] = {
    // FMIPA
    "101", "102", "103", "105", "160",
    // SITH
    "104", "106", "112", "114", "115", "119", "161", "198",
    // SF
    "107", "116", "162",
    // FTTM
    "121", "122", "123", "125", "164",
    // FITB
    "120", "128", "129", "151", "163",
    // FTI
    "130", "133", "134", "144", "167",
    // STEI
    "132", "135", "165", "180", "181", "182", "183",
    // FTMD
    "131", "136", "137", "169",
    // FTSL
    "150", "153", "155", "157", "158", "166",
    // SAPPK
    "152", "154", "199",
    // FSRD
    "168", "170", "172", "173", "174", "175", "179",
    // SBM
    "190", "192", "197"
};
const int nCodes = 61;

int main() {
#ifdef MODE_PARSE
	char buffer[1000];

	// this is the map that we will use to store <nim, name>
	map<string, string> names;

	// for each code ...
	for (int iCode = 0; iCode < nCodes; ++iCode) {
		string code = codes[iCode];

		// parse each files
		for (int iFiles = 1; ; ++iFiles) {
			char filename[100];
			sprintf(filename, "crawled/%s/%d.txt", code.c_str(), iFiles);

			FILE* file = fopen(filename, "r");
			if (file == NULL) break;

			while (!feof(file)) {
				if (fgets(buffer, 999, file) == NULL) break;

				int idx;
				char nimBuffer[100], nameBuffer[100];
				if (sscanf(buffer, "%d %s   %[^\n]\n", &idx, nimBuffer, nameBuffer) == 3) {
					// check prefix of nim
					// if (!(nimBuffer[0] == code[0] && nimBuffer[1] == code[1] && nimBuffer[2] == code[2])) continue;

					// cut space in the end
					int len = strlen(nameBuffer);
					while (nameBuffer[len-1] == ' ') {
						nameBuffer[--len] = 0;
					}
					names[nimBuffer] = nameBuffer;
					// printf("Found: nim = [%s], name = [%s]\n", nimBuffer, nameBuffer);
				}
			}

			fclose(file);
		}

		printf("code %s, found %d nim-name pairs so far\n", code.c_str(), names.size());
	}

	printf("Found %d nim-name pairs\n", names.size());

	FILE* fout = fopen("all.txt", "w");
	for (map<string, string>::iterator it = names.begin(); it != names.end(); it++) {
		fprintf(fout, "%s %s\n", (it->first).c_str(), (it->second).c_str());
	}
#endif

#ifdef MODE_CONVERT
	FILE* fileAll = fopen("all.txt", "r");

	if (fileAll == NULL) {
		exit(1);
	}

	char buffer[1000];
	char prefix[10] = "000";
	FILE* file = NULL;
	bool first = true;

	while (!feof(fileAll)) {
		if (fgets(buffer, 999, fileAll) == NULL) break;

		char nimBuffer[10], nameBuffer[100];
		sscanf(buffer, "%s %[^\n]\n", nimBuffer, nameBuffer);

		// update prefix
		if (((string)nimBuffer).substr(0, 3) != prefix) {
			if (file != NULL) {
				fprintf(file, "]");
				fclose(file);
			}
			strcpy(prefix, ((string)nimBuffer).substr(0, 3).c_str());

			char filename[100];
			sprintf(filename, "compiled/%s.json", prefix);
			file = fopen(filename, "w");
			fprintf(file, "[");
			first = true;
		}

		if (!first) fprintf(file, ",");
		fprintf(file, "{\"nim\":\"%s\",\"name\":\"%s\"}", nimBuffer, nameBuffer);
		first = false;
	}
	if (file != NULL) {
		fprintf(file, "]");
		fclose(file);
	}
	fclose(fileAll);

#endif

	return 0;
}