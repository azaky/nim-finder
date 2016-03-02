package io.github.azaky.nimfinder.data.processor;

import com.google.common.io.Files;
import io.github.azaky.nimfinder.data.Nim;

import java.io.File;
import java.io.IOException;
import java.nio.charset.Charset;
import java.sql.*;
import java.util.List;
import java.util.function.Consumer;
import java.util.logging.Level;
import java.util.logging.Logger;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

public class NicDataImporter {

    public static final String DB_HOST = "jdbc:mysql://localhost/nim-finder";
    public static final String DB_USERNAME = "root";
    public static final String DB_PASSWORD = "password";
    public static final String DB_CLASSPATH = "com.mysql.jdbc.Driver";

    public static final String ROOT_DIR = "../crawler/crawled-tpb/";

    public static final Logger LOG = Logger.getLogger("log");

    private Connection connection;

    public Connection getConnection() {
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

    public void process() {
        File rootFile = new File(ROOT_DIR);

        Files.fileTreeTraverser()
                .preOrderTraversal(rootFile)
                .filter(Files.isFile())
                .forEach(consumer);
    }

    private final String UPDATE_QUERY = "UPDATE mahasiswa SET nims = ?, username = ?, status = ? WHERE nim = ?";
    private final Pattern SINGLE_PATTERN = Pattern.compile("\\s*<\\s*td\\s*>\\s*(.*)\\s*<\\s*\\/\\s*td\\s*>");
    private final int LINE_USERNAME = 245 - 1;
    private final int LINE_NIM = 250 - 1;
    private final int LINE_TYPE = 261 - 1;

    private final Consumer<? super File> consumer = new Consumer<File>() {
        @Override
        public void accept(File dpk) {
            String nim = dpk.getName().replace(".html", "");
            List<String> lines;
            try {
                lines = Files.readLines(dpk, Charset.defaultCharset());
            } catch (IOException e) {
                LOG.log(Level.SEVERE, "Error reading file for NIM = " + nim, e);
                return;
            }
            if (lines.size() != 400) {
                LOG.log(Level.SEVERE, "ERROR: " + nim + " is not 400 lines, " + lines.size() + " instead");
                return;
            }

            try {
                String username = null, nimtpb = null, type = null;
                Matcher matcher = SINGLE_PATTERN.matcher(lines.get(LINE_USERNAME));
                if (matcher.matches()) {
                    username = matcher.group(1);
                } else {
                    throw new IllegalArgumentException("username was not found for nim " + nim + ". Line " + LINE_USERNAME + ": " + lines.get(LINE_USERNAME));
                }
                matcher = SINGLE_PATTERN.matcher(lines.get(LINE_TYPE));
                if (matcher.matches()) {
                    type = matcher.group(1);
                } else {
                    throw new IllegalArgumentException("type was not found for nim " + nim);
                }
                matcher = SINGLE_PATTERN.matcher(lines.get(LINE_NIM));
                if (matcher.matches()) {
                    nimtpb = matcher.group(1);
                } else {
                    throw new IllegalArgumentException("NIMs was not found for nim " + nim);
                }

                Connection connection = getConnection();
                if (connection == null) {
                    throw new SQLException("Error while creating connection");
                }

                PreparedStatement statement = connection.prepareStatement(UPDATE_QUERY);
                if (nimtpb == null) {
                    statement.setNull(1, Types.VARCHAR);
                } else {
                    statement.setString(1, nimtpb);
                }
                statement.setString(2, username);
                statement.setString(3, type);
                statement.setString(4, nim);
                statement.executeUpdate();

//                LOG.log(Level.INFO, "" + nim + " successfully processed ...");
            } catch (IllegalArgumentException | SQLException e) {
                LOG.log(Level.SEVERE, "" + nim + " failed ...", e);
            }
        }
    };

    public static void main(String[] args) {
        NicDataImporter importer = new NicDataImporter();
        importer.initialize();
        importer.process();
        importer.finalize();
    }

    public void initialize() {
        getConnection();
    }

    public void finalize() {
        try {
            if (connection != null) {
                connection.close();
            }
        } catch (SQLException e) {
            LOG.log(Level.SEVERE, "Unable to close connection", e);
        }
    }

}
