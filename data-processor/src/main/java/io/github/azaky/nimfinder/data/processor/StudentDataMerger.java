package io.github.azaky.nimfinder.data.processor;

import com.google.common.base.Preconditions;
import com.google.common.collect.ImmutableSet;
import com.google.common.collect.Iterables;
import com.google.common.collect.Maps;
import com.google.common.collect.Sets;
import io.github.azaky.nimfinder.data.Faculty;
import io.github.azaky.nimfinder.data.Nim;
import io.github.azaky.nimfinder.data.Student;

import java.util.Collection;
import java.util.Map;
import java.util.Set;

public class StudentDataMerger {

    private final ProcessResult.Builder resultBuilder = ProcessResult.builder();
    private final Collection<Student> students;
    private Collection<Student> mergedStudents = null;

    public StudentDataMerger(Collection<Student> students) {
        this.students = ImmutableSet.copyOf(students);
    }

    public Collection<Student> merge() {
        if (mergedStudents == null) {
            Map<StudentIdentifier, Set<Student>> studentsByIdentifier = getStudentsByIdentifier(students);
            mergedStudents = Sets.newHashSet();
            for (Set<Student> students : studentsByIdentifier.values()) {
                try {
                    Student student = mergeStudents(students);
                    mergedStudents.add(student);
                } catch (IllegalArgumentException e) {
                    resultBuilder.addFailure(new ProcessFailureException(e));
                }
            }
            resultBuilder.addStudents(mergedStudents);
        }
        return mergedStudents;
    }

    public ProcessResult getProcessResult() {
        return resultBuilder.build();
    }

    private Student mergeStudents(Set<Student> students) {
        if (students.isEmpty()) {
            throw new IllegalArgumentException("The argument must be not empty");
        } else if (students.size() > 2) {
            throw new IllegalArgumentException("Found more than 2 students with the same identifier: " + students);
        } else if (students.size() == 1) {
            return Iterables.getOnlyElement(students);
        } else if (students.size() == 2) {
            String name = null;
            Nim nim = null, tpbNim = null;
            for (Student student : students) {
                name = student.getName();
                Nim possiblyNullNim = student.getNim();
                Nim possiblyNullTpbNim = student.getTpbNim();
                if (possiblyNullNim != null) {
                    nim = possiblyNullNim;
                }
                if (possiblyNullTpbNim != null) {
                    tpbNim = possiblyNullTpbNim;
                }
            }
            return new Student(name, nim, tpbNim);
        } else {
            // Impossible to get here
            throw new IllegalStateException();
        }
    }

    private Map<StudentIdentifier, Set<Student>> getStudentsByIdentifier(Collection<Student> rawUniqueStudents) {
        Map<StudentIdentifier, Set<Student>> studentsByIdentifier = Maps.newHashMap();
        for (Student student : rawUniqueStudents) {
            StudentIdentifier identifier = StudentIdentifier.fromStudent(student);
            Set<Student> students = studentsByIdentifier.get(identifier);
            if (students == null) {
                students = Sets.newHashSet();
                studentsByIdentifier.put(identifier, students);
            }
            students.add(student);
        }
        return studentsByIdentifier;
    }

    private static class StudentIdentifier {
        private final Faculty tpbFaculty;
        private final int batch;
        private final String name;

        public StudentIdentifier(Faculty tpbFaculty, int batch, String name) {
            Preconditions.checkArgument(tpbFaculty.isTpb(), "tpbFaculty must be TPB");
            this.tpbFaculty = tpbFaculty;
            this.batch = batch;
            this.name = name;
        }

        public static StudentIdentifier fromStudent(Student student) {
            Nim tpbNim = student.getTpbNim();
            Faculty tpbFaculty = tpbNim != null ?
                    tpbNim.getFaculty() :
                    student.getNim().getFaculty().getTpbFaculty();
            return new StudentIdentifier(tpbFaculty, student.getBatch(), student.getName());
        }

        public Faculty getTpbFaculty() {
            return tpbFaculty;
        }

        public int getBatch() {
            return batch;
        }

        public String getName() {
            return name;
        }

        @Override
        public boolean equals(Object o) {
            if (this == o) return true;
            if (o == null || getClass() != o.getClass()) return false;

            StudentIdentifier that = (StudentIdentifier) o;

            if (batch != that.batch) return false;
            if (tpbFaculty != null ? !tpbFaculty.equals(that.tpbFaculty) : that.tpbFaculty != null) return false;
            return !(name != null ? !name.equals(that.name) : that.name != null);

        }

        @Override
        public int hashCode() {
            int result = tpbFaculty != null ? tpbFaculty.hashCode() : 0;
            result = 31 * result + batch;
            result = 31 * result + (name != null ? name.hashCode() : 0);
            return result;
        }

        @Override
        public String toString() {
            return "StudentIdentifier{" +
                    "tpbFaculty=" + tpbFaculty +
                    ", batch=" + batch +
                    ", name='" + name + '\'' +
                    '}';
        }
    }

}
