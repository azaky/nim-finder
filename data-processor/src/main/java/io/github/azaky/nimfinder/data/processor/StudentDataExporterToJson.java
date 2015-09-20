package io.github.azaky.nimfinder.data.processor;

import com.google.common.collect.FluentIterable;
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

/**
 * Created by Toshiba on 9/19/2015.
 */
public class StudentDataExporterToJson implements StudentDataExporter {

    private final File output;

    public StudentDataExporterToJson(File output) {
        this.output = output;
    }

    @Override
    public void exportStudentData(Collection<Student> students) throws ProcessFailureException {
        JSONArray result = new JSONArray();
        for (Student student : students) {
            result.put(huba(student));
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

    private Map<String, Object> huba(Student student) {
        Map<String, Object> result = Maps.newHashMap();
        result.put("name", student.getName());
        result.put("batch", 2000 + (student.getBatch() % 100));
        Nim nim = student.getNim();
        if (nim == null) {
            nim = student.getTpbNim();
        }
        result.put("nim", Objects.toString(nim, ""));
        result.put("search_token", getSearchToken(result.get("name") + " " + result.get("nim")));
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
