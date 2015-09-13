package io.github.azaky.nimfinder.data;

import com.google.common.base.Preconditions;

public class Nim {
    private final Faculty faculty;
    private final int batch;
    private final int id;

    public Nim(Faculty faculty, int batch, int id) {
        this.faculty = faculty;
        this.batch = batch;
        this.id = id;
    }

    public static Nim of(String nim) {
        Preconditions.checkArgument(nim.length() == 8, "Nim must consist of 8 characters");
        String facultyCode = nim.substring(0, 3);
        Faculty faculty = Faculties.getFromCode(facultyCode);
        String batchString = nim.substring(3, 5);
        int batch = Integer.valueOf(batchString);
        String idString = nim.substring(5, 8);
        int id = Integer.valueOf(idString);
        return new Nim(faculty, batch, id);
    }

    public Faculty getFaculty() {
        return faculty;
    }

    public int getBatch() {
        return batch;
    }

    public int getId() {
        return id;
    }

    public boolean isTpb() {
        return faculty.isTpb();
    }

    @Override
    public String toString() {
        return faculty.getCode() + String.format("%02d", batch % 100) + String.format("%03d", id);
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;

        Nim nim = (Nim) o;

        if (batch != nim.batch) return false;
        if (id != nim.id) return false;
        return !(faculty != null ? !faculty.equals(nim.faculty) : nim.faculty != null);

    }

    @Override
    public int hashCode() {
        int result = faculty != null ? faculty.hashCode() : 0;
        result = 31 * result + batch;
        result = 31 * result + id;
        return result;
    }
}
