package io.github.azaky.nimfinder.data;

import com.google.common.base.Optional;

import javax.annotation.Nullable;

public class Faculty {
    private final String name;
    private final String code;
    @Nullable
    private final Faculty tpbFaculty;

    public Faculty(String name, String code, @Nullable Faculty tpbFaculty) {
        this.name = name;
        this.code = code;
        this.tpbFaculty = tpbFaculty;
    }

    public Faculty(Faculty faculty) {
        this.name = faculty.getName();
        this.code = faculty.getCode();
        this.tpbFaculty = faculty.getTpbFaculty();
    }

    public String getName() {
        return name;
    }

    public String getCode() {
        return code;
    }

    public Faculty getTpbFaculty() {
        return tpbFaculty;
    }

    public boolean isTpb() {
        return tpbFaculty == null || (tpbFaculty != null && equals(tpbFaculty));
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;

        Faculty faculty = (Faculty) o;

        if (name != null ? !name.equals(faculty.name) : faculty.name != null) return false;
        if (code != null ? !code.equals(faculty.code) : faculty.code != null) return false;
        return !(tpbFaculty != null ? !tpbFaculty.equals(faculty.tpbFaculty) : faculty.tpbFaculty != null);

    }

    @Override
    public int hashCode() {
        int result = name != null ? name.hashCode() : 0;
        result = 31 * result + (code != null ? code.hashCode() : 0);
        result = 31 * result + (tpbFaculty != null ? tpbFaculty.hashCode() : 0);
        return result;
    }

    @Override
    public String toString() {
        return "Faculty{" +
                "name='" + name + '\'' +
                ", code='" + code + '\'' +
                ", tpbFaculty=" + tpbFaculty +
                '}';
    }
}
