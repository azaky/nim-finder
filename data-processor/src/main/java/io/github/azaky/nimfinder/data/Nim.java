package io.github.azaky.nimfinder.data;

import com.google.common.base.Preconditions;

public class Nim {
    private final Faculty faculty;
    private final int batch;
    private final int id;
    private final String nimString;

    public Nim(Faculty faculty, int batch, int id) {
        this.faculty = faculty;
        this.batch = 2000 + (batch % 100);
        this.id = id;
        this.nimString = faculty.getCode() + String.format("%02d", batch % 100) + String.format("%03d", id);
    }

    public Nim(Faculty faculty, int batch, int id, String nimString) {
        this.faculty = faculty;
        this.batch = 2000 + (batch % 100);
        this.id = id;
        this.nimString = nimString;
    }

    public static Nim of(String nim) {
        Preconditions.checkArgument(nim.length() == 8, "Nim must consist of 8 characters");
        String facultyCode = nim.substring(0, 3);
        Faculty faculty = Faculties.getFromCode(facultyCode);
        String batchString = nim.substring(3, 5);
        int batch = 2000 + (Integer.valueOf(batchString) % 100);
        String idString = nim.substring(5, 8);
        int id = Integer.valueOf(idString);
        return new Nim(faculty, batch, id, nim);
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
        return nimString;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;

        Nim nim = (Nim) o;

        return !(nimString != null ? !nimString.equals(nim.nimString) : nim.nimString != null);

    }

    @Override
    public int hashCode() {
        return nimString != null ? nimString.hashCode() : 0;
    }
}
