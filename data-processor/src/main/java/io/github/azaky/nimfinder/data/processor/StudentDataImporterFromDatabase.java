package io.github.azaky.nimfinder.data.processor;

import com.google.common.base.Strings;
import com.google.common.collect.Lists;
import com.google.common.collect.Sets;
import io.github.azaky.nimfinder.data.Nim;
import io.github.azaky.nimfinder.data.Student;

import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.Collection;
import java.util.List;
import java.util.Set;
import java.util.logging.Level;
import java.util.logging.Logger;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

public class StudentDataImporterFromDatabase implements StudentDataImporter {

    public static final String DB_HOST = "jdbc:mysql://localhost/nim-finder";
    public static final String DB_USERNAME = "root";
    public static final String DB_PASSWORD = "password";
    public static final String DB_CLASSPATH = "com.mysql.jdbc.Driver";
    public static final String STUDENT_QUERY = "SELECT * FROM mahasiswa";
    public static final Pattern NIMS_PATTERN = Pattern.compile("(\\w+)");

    public static final Logger LOG = Logger.getLogger("log");

    private Connection connection;

    public Connection getConnection() {
        try {
            if (connection != null && connection.isClosed()) {
                connection = null;
            }
        } catch (SQLException e) {
            connection = null;
        }
        if (connection != null) {
            return connection;
        } else {
            try {
                Class.forName(DB_CLASSPATH);
            } catch (ClassNotFoundException e) {
                LOG.log(Level.SEVERE, "", e);
            }

            try {
                connection = DriverManager.getConnection(DB_HOST, DB_USERNAME, DB_PASSWORD);
            } catch (SQLException e) {
                LOG.log(Level.SEVERE, "Error while creating connection", e);
                connection = null;
            }
            return connection;
        }
    }

    @Override
    public Collection<Student> importStudentData() throws ProcessFailureException {
        Connection connection = getConnection();
        if (connection == null) {
            throw new ProcessFailureException("Error while connecting to database");
        }
        try {
            ResultSet resultSet = connection.prepareStatement(STUDENT_QUERY).executeQuery();
            Set<Student> result = Sets.newHashSet();
            while (resultSet.next()) {
                try {
                    Nim nim = Nim.of(resultSet.getString("nim"));
                    String name = resultSet.getString("nama");
                    String nimsAsString = resultSet.getString("nims");
                    List<Nim> nims = Lists.newArrayList();
                    Matcher matcher = NIMS_PATTERN.matcher(nimsAsString);
                    while (matcher.find()) {
                        nims.add(Nim.of(matcher.group(1)));
                    }
                    boolean isAlumni = Strings.nullToEmpty(resultSet.getString("status")).startsWith("Alumni");
                    Student student = new Student(name, nim, nims, isAlumni);
                    result.add(student);
                } catch (Exception e) {
                    LOG.log(Level.WARNING, "An error occured on a record while importing", e);
                }
            }
            return result;
        } catch (SQLException e) {
            throw new ProcessFailureException(e);
        }
    }
}
