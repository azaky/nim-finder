package io.github.azaky.nimfinder.data.processor;

import com.google.common.collect.ImmutableSet;
import io.github.azaky.nimfinder.data.Nim;
import io.github.azaky.nimfinder.data.Student;
import org.junit.Test;

import java.util.Collection;

import static org.junit.Assert.assertEquals;

public class StudentDataMergerTest {

    @Test
    public void testMergeNormal() {
        Collection<Student> students = ImmutableSet.of(
                new Student("Ahmad Zaky", Nim.of("13512076"), null),
                new Student("Ahmad Zaky", null, Nim.of("16512398"))
        );
        StudentDataMerger merger = new StudentDataMerger(students);
        Collection<Student> merged = ImmutableSet.copyOf(merger.merge());
        Collection<Student> expected = ImmutableSet.of(
                new Student("Ahmad Zaky", Nim.of("13512076"), Nim.of("16512398"))
        );
        assertEquals(expected, merged);
    }
}
