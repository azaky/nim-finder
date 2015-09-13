package io.github.azaky.nimfinder.data;

import com.google.common.collect.ImmutableSet;
import org.junit.Test;

import java.util.Set;

import static org.junit.Assert.*;

public class FacultiesTest {

    private static final String[] TPB_CODES = {
            "160", "161", "162", "163", "164", "165", "166", "167", "168", "169", "197", "198", "199"};

    @Test
    public void testFacultiesLoadedCorrectly() {
        Faculty informatics = Faculties.getFromCode("135");
        assertEquals("Teknik Informatika", informatics.getName());
        assertEquals("135", informatics.getCode());
        Faculty stei = informatics.getTpbFaculty();
        assertEquals("Tahap Tahun Pertama STEI", stei.getName());
        assertEquals("165", stei.getCode());
    }

    @Test
    public void testTpbFaculties() {
        Set<String> tpbCodes = ImmutableSet.copyOf(TPB_CODES);

        for (Faculty faculty : Faculties.faculties.values()) {
            String code = faculty.getCode();
            if (tpbCodes.contains(code)) {
                assertTrue(faculty.toString() + " should be TPB", faculty.isTpb());
            } else {
                assertFalse(faculty.toString() + " should be non-TPB", faculty.isTpb());
            }
        }
    }

    @Test(expected = IllegalArgumentException.class)
    public void testUnexistedFaculty() {
        Faculties.getFromCode("007");
    }

}
