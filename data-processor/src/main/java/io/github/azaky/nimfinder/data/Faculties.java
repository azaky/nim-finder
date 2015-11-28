package io.github.azaky.nimfinder.data;

import com.google.common.base.Optional;
import com.google.common.base.Preconditions;
import com.google.common.collect.Maps;
import com.google.common.io.Files;
import org.json.JSONArray;
import org.json.JSONObject;

import java.io.File;
import java.io.IOException;
import java.nio.charset.Charset;
import java.util.Map;

public class Faculties {

    private static final String FACULTIES_JSON_PATH = "resources/main/faculties.json";

    /* package for testing */ static final Map<String, Faculty> faculties = Maps.newHashMap();
    private static boolean isLoaded = false;

    static {
        load();
    }

    private Faculties() {
        // Prevents instantiation
    }

    public static Faculty getFromCode(String code) {
        Preconditions.checkState(isLoaded, "No faculty FacultiesTest has been loaded");
        Faculty faculty = faculties.get(code);
        if (faculty == null) {
            faculty = new Faculty("Unknown", code, null);
            faculties.put(code, faculty);
//            throw new IllegalArgumentException("No faculty with code " + code + " is found");
        }
        return faculty;
    }

    private static void load() {
        Preconditions.checkState(!isLoaded, "Attempt to importStudentData() after faculties has been loaded");

        try {
            File facultiesJsonFile = new File(FACULTIES_JSON_PATH);
            String facultiesJsonString = Files.toString(facultiesJsonFile, Charset.defaultCharset());
            JSONArray facultiesJsonObject = new JSONArray(facultiesJsonString);
            int nFaculties = facultiesJsonObject.length();
            for (int i = 0; i < nFaculties; ++i) {
                JSONObject facultyJsonObject = facultiesJsonObject.getJSONObject(i);
                loadFacultiesFromJsonObject(facultyJsonObject);
            }
            isLoaded = true;
        } catch (Exception e) {
            faculties.clear();
            isLoaded = false;
            throw new RuntimeException("Failed to load faculty FacultiesTest", e);
        }
    }

    private static void loadFacultiesFromJsonObject(JSONObject facultyJsonObject) {
        JSONArray studyProgramsJsonObject = facultyJsonObject.getJSONArray("programs");
        int nPrograms = studyProgramsJsonObject.length();
        Map<String, Faculty> incompleteFaculties = Maps.newHashMap();
        Map<String, String> tpbCodes = Maps.newHashMap();
        for (int i = 0; i < nPrograms; ++i) {
            JSONObject studyProgramJsonObject = studyProgramsJsonObject.getJSONObject(i);
            String name = studyProgramJsonObject.optString("name", null);
            String code = studyProgramJsonObject.optString("code", null);
            String tpbCode = studyProgramJsonObject.optString("tpb_code", null);
            Faculty incompleteFaculty = new Faculty(name, code, null);
            if (tpbCode == null) {
                faculties.put(code, incompleteFaculty);
            } else {
                incompleteFaculties.put(code, incompleteFaculty);
                tpbCodes.put(code, tpbCode);
            }
        }
        loadIncompleteFaculties(incompleteFaculties, tpbCodes);
    }

    private static void loadIncompleteFaculties(
            Map<String, Faculty> incompleteFaculties,
            Map<String, String> tpbCodes) {
        for (Faculty incompleteFaculty : incompleteFaculties.values()) {
            String code = incompleteFaculty.getCode();
            String name = incompleteFaculty.getName();
            Faculty tpbFaculty = faculties.get(tpbCodes.get(code));
            if (tpbFaculty == null) {
                throw new IllegalArgumentException("TPB Faculty for " + name + " is not found");
            }
            Faculty faculty = new Faculty(name, code, tpbFaculty);
            faculties.put(code, faculty);
        }
    }
}
