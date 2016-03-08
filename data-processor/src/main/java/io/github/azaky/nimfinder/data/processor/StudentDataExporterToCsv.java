package io.github.azaky.nimfinder.data.processor;

import com.google.common.base.Function;
import com.google.common.base.Strings;
import com.google.common.collect.FluentIterable;
import com.google.common.collect.Sets;
import com.opencsv.CSVWriter;
import io.github.azaky.nimfinder.data.Nim;
import io.github.azaky.nimfinder.data.Student;

import java.io.File;
import java.io.FileNotFoundException;
import java.io.FileWriter;
import java.io.IOException;
import java.util.Collection;
import java.util.List;
import java.util.Objects;
import java.util.Set;

public class StudentDataExporterToCsv implements StudentDataExporter {

    private static final char SEPARATOR = ';';
    private static final String[] HEADER = {"nim", "nama", "angkatan"};

    private final File output;

    public StudentDataExporterToCsv(File output) {
        this.output = output;
    }

    @Override
    public void exportStudentData(Collection<Student> students) throws ProcessFailureException {
        // Sort students according to their batch and faculties to produce nice result
        List<Student> sortedStudent = FluentIterable.from(students).toSortedList(Student.DEFAULT_COMPARATOR);
        try (FileWriter fileWriter = new FileWriter(output)) {
            CSVWriter writer = new CSVWriter(fileWriter, SEPARATOR);
            writeHeader(writer);
            writeData(writer, sortedStudent);
            writer.close();
        } catch (IOException e) {
            throw new ProcessFailureException("Failed to export student FacultiesTest to CSV", e);
        }
    }

    private void writeHeader(CSVWriter writer) {
        writer.writeNext(HEADER);
    }

    private void writeData(CSVWriter writer, Collection<Student> students) {
        List<String[]> allLines = FluentIterable
                .from(students)
                .transform(CONVERT_STUDENT_TO_CSV_ROW)
                .toList();
        writer.writeAll(allLines);
    }

    private static final Function<Student, String[]> CONVERT_STUDENT_TO_CSV_ROW = new Function<Student, String[]>() {
        @Override
        public String[] apply(Student student) {
            String[] row = new String[HEADER.length];
            row[0] = Objects.toString(student.getNim());
            row[1] = student.getName();
            row[2] = Integer.toString(student.getBatch());
            return row;
        }
    };
}
