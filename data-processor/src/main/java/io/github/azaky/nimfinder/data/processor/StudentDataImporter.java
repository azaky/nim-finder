package io.github.azaky.nimfinder.data.processor;

import io.github.azaky.nimfinder.data.Student;

import java.util.Collection;

public interface StudentDataImporter {

    Collection<Student> importStudentData() throws ProcessFailureException;

}
