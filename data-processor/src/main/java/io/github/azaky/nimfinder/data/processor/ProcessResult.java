package io.github.azaky.nimfinder.data.processor;

import com.google.common.collect.ImmutableList;
import com.google.common.collect.ImmutableMap;
import com.google.common.collect.Lists;
import com.google.common.collect.Maps;
import io.github.azaky.nimfinder.data.Faculty;
import io.github.azaky.nimfinder.data.Nim;
import io.github.azaky.nimfinder.data.Student;

import java.util.Collection;
import java.util.List;
import java.util.Map;

public class ProcessResult {

    private final List<ProcessFailureException> failures;
    private final Map<Integer, Map<Faculty, StudentAggregateData>> resultsByBatch;

    public ProcessResult(
            List<ProcessFailureException> failures,
            Map<Integer, Map<Faculty, StudentAggregateData>> resultsByBatch) {
        this.failures = ImmutableList.copyOf(failures);
        this.resultsByBatch = ImmutableMap.copyOf(resultsByBatch);
    }

    public List<ProcessFailureException> getFailures() {
        return failures;
    }

    public Map<Integer, Map<Faculty, StudentAggregateData>> getResultsByBatch() {
        return resultsByBatch;
    }

    public static Builder builder() {
        return new Builder();
    }

    public static class Builder {

        private final List<ProcessFailureException> failures = Lists.newArrayList();
        private final Map<Integer, Map<Faculty, StudentAggregateData>> resultsByBatch = Maps.newHashMap();

        public Builder addFailure(ProcessFailureException failure) {
            failures.add(failure);
            return this;
        }

        public Builder addResultMetric(Integer batch, Faculty faculty, StudentAggregateData metrics) {
            Map<Faculty, StudentAggregateData> resultsThisBatch = resultsByBatch.get(batch);
            if (resultsThisBatch == null) {
                resultsThisBatch = Maps.newHashMap();
                resultsByBatch.put(batch, resultsThisBatch);
            }
            StudentAggregateData existingMetrics = resultsThisBatch.get(faculty);
            if (existingMetrics != null) {
                existingMetrics = existingMetrics.add(metrics);
            } else {
                existingMetrics = metrics;
            }
            resultsThisBatch.put(faculty, existingMetrics);
            return this;
        }

        public Builder addStudent(Student student) {
            Integer batch = student.getBatch();
            Nim nim = student.getNim();
            Nim tpbNim = student.getTpbNim();
            if (nim != null && tpbNim == null) {
                addResultMetric(batch, nim.getFaculty(), StudentAggregateData.NON_TPB);
            } else if (nim == null && tpbNim != null) {
                addResultMetric(batch, tpbNim.getFaculty(), StudentAggregateData.TPB);
            } else if (nim != null && tpbNim != null) {
                addResultMetric(batch, nim.getFaculty(), StudentAggregateData.BOTH);
                addResultMetric(batch, tpbNim.getFaculty(), StudentAggregateData.BOTH);
            }
            return this;
        }

        public Builder addStudents(Collection<Student> students) {
            for (Student student : students) {
                addStudent(student);
            }
            return this;
        }

        public ProcessResult build() {
            return new ProcessResult(failures, resultsByBatch);
        }

    }
}
