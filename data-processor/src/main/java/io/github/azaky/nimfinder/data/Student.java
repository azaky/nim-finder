package io.github.azaky.nimfinder.data;

import com.google.common.base.Preconditions;
import com.google.common.collect.Lists;

import javax.annotation.Nullable;
import java.util.Comparator;
import java.util.List;
import java.util.Objects;

public class Student {

    private final String name;
    private final Nim nim;
    private final List<Nim> nims = Lists.newArrayList();
    private final int batch;
    private final boolean isAlumni;

    public Student(String name, Nim nim, List<Nim> nims, boolean isAlumni) {
        this.name = name;
        this.nim = nim;
        this.nims.addAll(nims);
        this.batch = nim.getBatch();
        this.isAlumni = isAlumni;
    }

    public void addNim(Nim nim) {
        nims.add(nim);
    }

    public String getName() {
        return name;
    }

    public Nim getNim() {
        return nim;
    }

    public int getBatch() {
        return batch;
    }

    public List<Nim> getNims() {
        return nims;
    }

    public boolean isAlumni() {
        return isAlumni;
    }

    public static final Comparator<? super Student> DEFAULT_COMPARATOR = new Comparator<Student>() {
        @Override
        public int compare(Student studentA, Student studentB) {
            int batchA = studentA.getBatch() % 100;
            int batchB = studentB.getBatch() % 100;
            if (batchA != batchB) {
                return batchA - batchB;
            }
            String nimA = Objects.toString(studentA.getNim());
            String nimB = Objects.toString(studentB.getNim());
            return String.CASE_INSENSITIVE_ORDER.compare(nimA, nimB);
        }
    };

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;

        Student student = (Student) o;

//        if (batch != student.batch) return false;
//        if (isAlumni != student.isAlumni) return false;
//        if (name != null ? !name.equals(student.name) : student.name != null) return false;
//        if (nim != null ? !nim.equals(student.nim) : student.nim != null) return false;
//        return !(nims != null ? !nims.equals(student.nims) : student.nims != null);
        return !(nim != null ? !nim.equals(student.nim) : student.nim != null);
    }

    @Override
    public int hashCode() {
//        int result = name != null ? name.hashCode() : 0;
//        result = 31 * result + (nim != null ? nim.hashCode() : 0);
//        result = 31 * result + (nims != null ? nims.hashCode() : 0);
//        result = 31 * result + batch;
//        result = 31 * result + (isAlumni ? 1 : 0);
        int result = (nim != null ? nim.hashCode() : 0);
        return result;
    }

    @Override
    public String toString() {
        return "Student{" +
                "name='" + name + '\'' +
                ", nim=" + nim +
                ", nims=" + nims +
                ", batch=" + batch +
                ", isAlumni=" + isAlumni +
                '}';
    }
}
