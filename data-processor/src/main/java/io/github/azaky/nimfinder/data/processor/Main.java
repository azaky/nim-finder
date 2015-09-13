package io.github.azaky.nimfinder.data.processor;

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
    public static final String ROOT_DIR = "../nim-finder-crawler/crawled";
    public static final String OUTPUT_FILENAME = "build/all-nim.csv";

    public static void main(String[] args) {
        Collection<Student> rawStudents = importRawStudentData();
        StudentDataMerger merger = new StudentDataMerger(rawStudents);
        Collection<Student> merged = merger.merge();
        ProcessResult result = merger.getProcessResult();
        logResult(result);
        exportStudentDataToCsv(merged);
    }

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

    private static void exportStudentDataToCsv(Collection<Student> students) {
        StudentDataExporter exporter = new StudentDataExporterToCsv(new File(OUTPUT_FILENAME));
        try {
            exporter.exportStudentData(students);
        } catch (ProcessFailureException e) {
            LOG.log(Level.SEVERE, "Failed when exporting data to CSV", e);
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
