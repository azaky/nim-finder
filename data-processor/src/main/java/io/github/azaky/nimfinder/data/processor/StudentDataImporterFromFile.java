package io.github.azaky.nimfinder.data.processor;

import com.google.common.base.Function;
import com.google.common.base.Preconditions;
import com.google.common.collect.Sets;
import com.google.common.io.Files;
import io.github.azaky.nimfinder.data.Nim;
import io.github.azaky.nimfinder.data.Student;

import java.io.File;
import java.io.IOException;
import java.nio.charset.Charset;
import java.util.Collection;
import java.util.Collections;
import java.util.List;
import java.util.Set;
import java.util.logging.Level;
import java.util.logging.Logger;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

public class StudentDataImporterFromFile implements StudentDataImporter {

    private static final Logger LOG = Logger.getLogger("log");
    private static final Pattern DPK_STUDENT_PATTERN = Pattern.compile("([0-9]+)\\s+([0-9]+)\\s+(.*)");

    private final File dpkDirectoryRoot;

    public StudentDataImporterFromFile(File dpkDirectoryRoot) {
        Preconditions.checkArgument(
                Files.isDirectory().apply(dpkDirectoryRoot),
                "Root directory must exist and must be a directory");
        this.dpkDirectoryRoot = dpkDirectoryRoot;
    }

    @Override
    public Collection<Student> importStudentData() {
        return Files.fileTreeTraverser()
                .preOrderTraversal(dpkDirectoryRoot)
                .filter(Files.isFile())
                .transformAndConcat(STUDENT_DATA_IMPORTER_FROM_DPK)
                .toSet();
    }

    private static final Function<File, Iterable<Student>> STUDENT_DATA_IMPORTER_FROM_DPK =
            new Function<File, Iterable<Student>>() {
                @Override
                public Iterable<Student> apply(File dpk) {
                    List<String> lines;
                    try {
                        lines = Files.readLines(dpk, Charset.defaultCharset());
                    } catch (IOException e) {
                        return Collections.emptyList();
                    }
                    Set<Student> students = Sets.newHashSet();
                    for (String line : lines) {
                        Matcher matcher = DPK_STUDENT_PATTERN.matcher(line);
                        if (matcher.matches()) {
                            try {
                                Nim nim = Nim.of(matcher.group(2));
                                String name = matcher.group(3).trim();
                                if (nim.isTpb()) {
                                    students.add(new Student(name, null, nim));
                                } else {
                                    students.add(new Student(name, nim, null));
                                }
                            } catch (Exception e) {
                                LOG.log(Level.WARNING, "Exception occurs when importing from DPK", e);
                            }
                        }
                    }
                    return students;
                }
            };

}
