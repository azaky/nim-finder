package io.github.azaky.nimfinder.data.processor;

import com.google.common.base.Predicate;
import com.google.common.collect.FluentIterable;
import io.github.azaky.nimfinder.data.Faculties;
import io.github.azaky.nimfinder.data.Faculty;
import io.github.azaky.nimfinder.data.Student;

import java.io.File;
import java.util.Collection;
import java.util.Collections;
import java.util.List;
import java.util.Map;
import java.util.logging.Level;
import java.util.logging.Logger;

public class Main {

    public static final Logger LOG = Logger.getLogger("log");
    public static final String ROOT_DIR = "../crawler/crawled";
    public static final String OUTPUT_FILENAME = "build/all-nim";

    public static void main(String[] args) {
        Collection<Student> rawStudents = importRawStudentData();
        Collection<Student> rawStudents2010OrLater = FluentIterable
                .from(rawStudents)
                .filter(IS_2010_OR_LATER)
                .filter(NOT_TPB_2014)
                .toSet();
//        StudentDataMerger merger = new StudentDataMerger(rawStudents2010OrLater);
//        Collection<Student> merged = merger.merge();
//        ProcessResult result = merger.getProcessResult();
//        logResult(result);
        exportStudentDataToJson(rawStudents2010OrLater);
        exportStudentDataToCsv(rawStudents2010OrLater);
    }

    private static final Predicate<? super Student> IS_2010_OR_LATER = new Predicate<Student>() {
        @Override
        public boolean apply(Student input) {
            int batch = input.getBatch();
            if (batch >= 2000) {
                return batch >= 2010;
            } else {
                return batch >= 10;
            }
        }
    };

    private static final Predicate<? super Student> NOT_TPB_2014 = new Predicate<Student>() {
        @Override
        public boolean apply(Student student) {
            return student.getBatch() != 2014 || student.getTpbNim() == null;
        }
    };

    private static final Predicate<? super Student> IS_165 = new Predicate<Student>() {

        private final Faculty STEI = Faculties.getFromCode("165");

        @Override
        public boolean apply(Student input) {
            return input.getTpbNim() != null && input.getTpbNim().getFaculty().equals(STEI);
        }
    };

    private static void logResult(ProcessResult result) {
        if (!result.getFailures().isEmpty()) {
            logFailures(result.getFailures());
        }
        StringBuilder builder = new StringBuilder();
        Map<Integer, Map<Faculty, StudentAggregateData>> resultsByBatch = result.getResultsByBatch();
        for (Map.Entry<Integer, Map<Faculty, StudentAggregateData>> perBatchEntry : resultsByBatch.entrySet()) {
            Integer batch = perBatchEntry.getKey();
            Map<Faculty, StudentAggregateData> resultByFaculty = perBatchEntry.getValue();
            builder.append("Result for batch " + batch + "\n");
            for (Map.Entry<Faculty, StudentAggregateData> entry : resultByFaculty.entrySet()) {
                Faculty faculty = entry.getKey();
                StudentAggregateData data = entry.getValue();
                builder.append("\tFaculty " + faculty.getName() + "\n");
                builder.append("\t\tTPB Only    : " + data.getTotalTpb() + "\n");
                builder.append("\t\tNon-TPB Only: " + data.getTotalNonTpb() + "\n");
                builder.append("\t\tBoth Data   : " + data.getTotalBoth() + "\n");
            }
        }
        LOG.log(Level.INFO, builder.toString());
    }

    private static void exportStudentDataToJson(Collection<Student> students) {
        StudentDataExporter exporter = new StudentDataExporterToJson(new File(OUTPUT_FILENAME + ".json"));
        try {
            exporter.exportStudentData(students);
        } catch (ProcessFailureException e) {
            LOG.log(Level.SEVERE, "Failed when exporting data to JSON", e);
        }
    }

    private static void exportStudentDataToCsv(Collection<Student> students) {
        StudentDataExporter exporter = new StudentDataExporterToCsv(new File(OUTPUT_FILENAME + ".csv"));
        try {
            exporter.exportStudentData(students);
        } catch (ProcessFailureException e) {
            LOG.log(Level.SEVERE, "Failed when exporting data to JSON", e);
        }
    }

    private static void logFailures(List<ProcessFailureException> failures) {
        LOG.log(Level.SEVERE, "Failures occurs when merging student data:");
        for (ProcessFailureException failure : failures) {
            LOG.log(Level.SEVERE, "", failure);
        }
    }

    private static Collection<Student> importRawStudentData() {
        File rootFile = new File(ROOT_DIR);
        StudentDataImporter importer = new StudentDataImporterFromFile(rootFile);
        try {
            return importer.importStudentData();
        } catch (ProcessFailureException e) {
            LOG.log(Level.SEVERE, "Failed when importing raw data", e);
            return Collections.emptySet();
        }
    }

}
