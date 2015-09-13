package io.github.azaky.nimfinder.data;

import org.junit.Test;

import static org.junit.Assert.assertEquals;

public class NimTest {

    @Test
    public void testNimFromString() {
        Nim nim = Nim.of("16512001");
        Faculty stei = Faculties.getFromCode("165");
        assertEquals(stei, nim.getFaculty());
        assertEquals(12, nim.getBatch());
        assertEquals(1, nim.getId());
    }

    @Test
    public void testNimToString() {
        Faculty fti = Faculties.getFromCode("167");
        Nim nim = new Nim(fti, 2012, 76);
        assertEquals("16712076", nim.toString());
    }

}
