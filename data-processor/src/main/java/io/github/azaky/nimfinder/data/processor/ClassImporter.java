package io.github.azaky.nimfinder.data.processor;

import com.google.common.collect.Lists;
import com.google.common.io.Files;

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

public class ClassImporter {

    public static final String DB_HOST = "jdbc:mysql://localhost/nim-finder";
    public static final String DB_USERNAME = "root";
    public static final String DB_PASSWORD = "password";
    public static final String DB_CLASSPATH = "com.mysql.jdbc.Driver";

    public static final String ROOT_DIR = "../crawler/crawled/2015-2-before-prs";

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

    private final Pattern DPK_PATTERN = Pattern.compile("<pre>([\\w\\W]+)\\n+.*:\\s*([\\w\\W]+)\\n+.*:\\s*(\\d+)\\/(\\d+)\\n+.*:\\s*([\\w]+)\\s*\\/\\s*([\\w\\W]+),\\s*(\\d+)\\s*SKS\\n+.*:\\s*(\\d+)\\s*\\/\\s*([\\w\\W]+)\\n+-*\\n+.*\\n+-+\\n+([\\s\\S]*)-+\\n+Total Peserta = (\\d+)", Pattern.MULTILINE | Pattern.DOTALL);
    private final Pattern PESERTA_PATTERN = Pattern.compile("\\d+\\s+(\\w+)\\s+(.*)", Pattern.MULTILINE);
    private final String INSERT_KELAS_QUERY = "INSERT INTO kelas(fakultas, prodi, semester, tahun, kode, matkul, sks, kelas, dosen) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)";
    private final String INSERT_PESERTA_QUERY = "INSERT INTO ambil_kelas(nim, id_kelas) VALUES (?, ?)";

    private final Consumer<? super File> consumer = new Consumer<File>() {
        @Override
        public void accept(File dpk) {
            LOG.log(Level.INFO, String.format("Processing %s...", dpk.getAbsolutePath()));
            List<String> lines;
            try {
                lines = Files.readLines(dpk, Charset.defaultCharset());
            } catch (IOException e) {
                LOG.log(Level.SEVERE, "Error reading file", e);
                return;
            }

            try {
                List<String> groups = Lists.newArrayList();
                List<Matcher> matchers = Lists.newArrayList();
                matchers.add(Pattern.compile("<pre>(.*)").matcher(lines.get(0)));
                matchers.add(Pattern.compile(".*:\\s*(.*)").matcher(lines.get(1)));
                matchers.add(Pattern.compile(".*:\\s*(\\d+)\\/(\\d+)").matcher(lines.get(2)));
                matchers.add(Pattern.compile(".*:\\s*(\\w*)\\s*\\/\\s*(.*),\\s*(\\d+)\\s*SKS").matcher(lines.get(4)));
                matchers.add(Pattern.compile(".*:\\s*(\\d+)\\s*\\/\\s*(.*)").matcher(lines.get(5)));
                for (Matcher matcher : matchers) {
                    if (!matcher.matches()) {
                        throw new Exception("No match found for " + matcher.toString());
                    } else {
                        int size = matcher.groupCount();
                        for (int i = 1; i <= size; ++i) {
                            groups.add(matcher.group(i));
                        }
                    }
                }
                String fakultas = groups.get(0);
                String prodi = groups.get(1);
                String semester = groups.get(2);
                String tahun = groups.get(3);
                String kode = groups.get(4);
                String matkul = groups.get(5);
                String sks = groups.get(6);
                String kelas = groups.get(7);
                String dosen = groups.get(8);
                List<String> nimList = Lists.newArrayList();

                for (int i = 6; i < lines.size(); ++i) {
                    Matcher matcherPeserta = PESERTA_PATTERN.matcher(lines.get(i));
                    if (matcherPeserta.matches()) {
                        nimList.add(matcherPeserta.group(1));
                    }
                }
                LOG.log(Level.INFO, String.format("Processing %s-%s: %d in total...", kode, kelas, nimList.size()));
                // omitting empty classes
                if (nimList.isEmpty()) {
                    return;
                }

                try {
                    Connection connection = getConnection();
                    if (connection == null) {
                        throw new SQLException("Error while creating connection");
                    }

                    PreparedStatement statement = connection.prepareStatement(INSERT_KELAS_QUERY, Statement.RETURN_GENERATED_KEYS);
                    for (int i = 0; i < 9; ++i) {
                        statement.setString(i + 1, groups.get(i));
                    }
                    int result = statement.executeUpdate();
                    if (result == 0) {
                        throw new SQLException("Error in creating new class");
                    }
                    int idKelas;
                    try (ResultSet generatedKeys = statement.getGeneratedKeys()) {
                        if (generatedKeys.next()) {
                            idKelas = generatedKeys.getInt(1);
                        }
                        else {
                            throw new SQLException("Creating user failed, no ID obtained.");
                        }
                    }

                    if (idKelas != -1) {
                        for (String nim : nimList) {
                            try {
                                PreparedStatement statementAmbilKelas = connection.prepareStatement(INSERT_PESERTA_QUERY);
                                statementAmbilKelas.setString(1, nim);
                                statementAmbilKelas.setInt(2, idKelas);
                                statementAmbilKelas.executeUpdate();
                            } catch (SQLException e) {
                                LOG.log(Level.WARNING, String.format("Error inserting %s to class %d", nim, idKelas));
                            }
                        }
                    }
                } catch (SQLException e) {
                    LOG.log(Level.SEVERE, "Something happened", e);
                }
            } catch (Exception e) {
                LOG.log(Level.SEVERE, "Error while parsing dpk", e);
            }
        }
    };

    public static void main(String[] args) {
        ClassImporter importer = new ClassImporter();
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
