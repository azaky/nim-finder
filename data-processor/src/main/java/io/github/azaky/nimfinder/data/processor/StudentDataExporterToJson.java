package io.github.azaky.nimfinder.data.processor;

import com.google.common.collect.FluentIterable;
import com.google.common.collect.Lists;
import com.google.common.collect.Maps;
import com.google.common.collect.Sets;
import io.github.azaky.nimfinder.data.Nim;
import io.github.azaky.nimfinder.data.Student;
import org.json.JSONArray;
import org.json.JSONObject;

import java.io.File;
import java.io.FileWriter;
import java.io.IOException;
import java.util.*;

public class StudentDataExporterToJson implements StudentDataExporter {

    private final File output;

    public StudentDataExporterToJson(File output) {
        this.output = output;
    }

    @Override
    public void exportStudentData(Collection<Student> students) throws ProcessFailureException {
        // Sort students according to their batch and faculties to produce nice result
        List<Student> sortedStudents = FluentIterable.from(students).toSortedList(Student.DEFAULT_COMPARATOR);
        JSONArray result = new JSONArray();
        for (Student student : sortedStudents) {
            result.put(getJsonMap(student));
        }
        JSONObject enclosed = new JSONObject();
        enclosed.put("results", result);
        try {
            FileWriter fileWriter = new FileWriter(output);
            enclosed.write(fileWriter);
            fileWriter.close();
        } catch (IOException e) {
            throw new ProcessFailureException("Failed to export student to JSON", e);
        }
    }

    private Map<String, Object> getJsonMap(Student student) {
        Map<String, Object> result = Maps.newHashMap();
        result.put("name", student.getName());
        result.put("batch", 2000 + (student.getBatch() % 100));
        Nim nim = student.getNim();
        result.put("nim", Objects.toString(nim, ""));
        StringBuilder allData = new StringBuilder();
        List<String> nimsAsString = Lists.newArrayList();
        for (Nim nimLocal : student.getNims()) {
            allData.append(nimLocal);
            allData.append("#");
            nimsAsString.add(nimLocal.toString());
        }
        result.put("nims", nimsAsString);
        allData.append(student.getName().replace(' ', '#'));
        result.put("all_data", allData.toString());
        result.put("is_alumni", student.isAlumni());
        return result;
    }

    private List<String> getSearchToken(String data) {
        String[] splitted = data.toLowerCase().split(" ");
        Set<String> tokens = Sets.newHashSet();
        for (String word : splitted) {
            int length = word.length();
            for (int i = 0; i < length; ++i) {
                for (int j = i + 1; j <= length; ++j) {
                    tokens.add(word.substring(i, j));
                }
            }
        }
        return FluentIterable.from(tokens).toList();
    }
}
