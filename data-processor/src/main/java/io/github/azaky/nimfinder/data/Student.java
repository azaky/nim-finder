package io.github.azaky.nimfinder.data;

import com.google.common.base.Preconditions;
import com.google.common.collect.Lists;

import javax.annotation.Nullable;
import java.util.Comparator;
import java.util.List;
import java.util.Objects;

public class Student {

    private final String name;
    @Nullable
    private final Nim nim;
    @Nullable
    private final Nim tpbNim;
    private final List<Nim> nims = Lists.newArrayList();
    private final int batch;
    private final boolean isAlumni;

    /**
     * Use constructor with isAlumni instead
     */
    @Deprecated
    public Student(String name, @Nullable Nim nim, @Nullable Nim tpbNim) {
        Preconditions.checkArgument(nim == null || !nim.isTpb(), "nim argument must not be TPB NIM");
        Preconditions.checkArgument(tpbNim == null || tpbNim.isTpb(), "tpbNim argument must be TPB NIM");
        Preconditions.checkArgument(nim != null || tpbNim != null, "At least one of nim or tpbNim must be non-null");
        if (nim != null && tpbNim != null) {
            Preconditions.checkArgument(nim.getBatch() == tpbNim.getBatch(), "Batch for nim and tpbNim must be equal");
        }
        this.name = name;
        this.nim = nim;
        this.tpbNim = tpbNim;
        this.batch = nim != null ? nim.getBatch() : tpbNim.getBatch();
        this.isAlumni = false;
    }

    public Student(String name, Nim nim, List<Nim> nims, boolean isAlumni) {
        this.name = name;
        this.nim = nim;
        this.tpbNim = null;
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

    public Nim getTpbNim() {
        return tpbNim;
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
            String nimA = Objects.toString(studentA.getNim(), null);
            if (nimA == null) {
                nimA = Objects.toString(studentA.getTpbNim());
            }
            String nimB = Objects.toString(studentB.getNim(), null);
            if (nimB == null) {
                nimB = Objects.toString(studentB.getTpbNim());
            }
            return String.CASE_INSENSITIVE_ORDER.compare(nimA, nimB);
        }
    };


    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;

        Student student = (Student) o;

        if (name != null ? !name.equals(student.name) : student.name != null) return false;
        if (nim != null ? !nim.equals(student.nim) : student.nim != null) return false;
        return !(tpbNim != null ? !tpbNim.equals(student.tpbNim) : student.tpbNim != null);

    }

    @Override
    public int hashCode() {
        int result = name != null ? name.hashCode() : 0;
        result = 31 * result + (nim != null ? nim.hashCode() : 0);
        result = 31 * result + (tpbNim != null ? tpbNim.hashCode() : 0);
        return result;
    }

    @Override
    public String toString() {
        return "Student{" +
                "name='" + name + '\'' +
                ", nim=" + nim +
                ", tpbNim=" + tpbNim +
                '}';
    }
}
