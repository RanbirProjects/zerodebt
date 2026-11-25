package in.zerodebt;

import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.nio.file.*;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.*;

/**
 * Simple durable store: one JSON object per line in data/enquiries.jsonl.
 * All access is synchronized; writes are atomic (temp file + move) on update.
 */
public final class Store {
    private final Path file;
    private final List<Map<String, Object>> rows = new ArrayList<>();
    private final Random rnd = new java.security.SecureRandom();

    public static final Set<String> STATUSES = new LinkedHashSet<>(List.of(
            "Received", "Under Review", "Contacted", "In Progress", "Resolved", "Closed"));

    public Store(Path file) throws IOException {
        this.file = file;
        Files.createDirectories(file.getParent());
        if (Files.exists(file)) {
            for (String line : Files.readAllLines(file, StandardCharsets.UTF_8)) {
                if (line.isBlank()) continue;
                try { rows.add(Json.parseObject(line)); } catch (Exception ignored) { /* skip corrupt line */ }
            }
        }
    }

    public synchronized Map<String, Object> add(String type, Map<String, Object> fields) throws IOException {
        Map<String, Object> row = new LinkedHashMap<>();
        row.put("ref", newRef());
        row.put("type", type);
        row.put("status", "Received");
        row.put("createdAt", LocalDateTime.now().format(DateTimeFormatter.ISO_LOCAL_DATE_TIME));
        row.putAll(fields);
        rows.add(row);
        Files.writeString(file, Json.write(row) + "\n", StandardCharsets.UTF_8,
                StandardOpenOption.CREATE, StandardOpenOption.APPEND);
        return row;
    }

    private String newRef() {
        String ref;
        do {
            ref = "ZD-" + LocalDate.now().getYear() + "-" + String.format("%05d", rnd.nextInt(100000));
        } while (find(ref) != null);
        return ref;
    }

    public synchronized Map<String, Object> find(String ref) {
        for (Map<String, Object> r : rows) if (ref.equalsIgnoreCase(String.valueOf(r.get("ref")))) return r;
        return null;
    }

    public synchronized List<Map<String, Object>> all() {
        List<Map<String, Object>> copy = new ArrayList<>();
        for (int i = rows.size() - 1; i >= 0; i--) copy.add(new LinkedHashMap<>(rows.get(i)));
        return copy;
    }

    public synchronized Map<String, Long> countsByType() {
        Map<String, Long> m = new LinkedHashMap<>();
        for (Map<String, Object> r : rows) m.merge(String.valueOf(r.get("type")), 1L, Long::sum);
        return m;
    }

    public synchronized boolean updateStatus(String ref, String status, String note) throws IOException {
        Map<String, Object> r = find(ref);
        if (r == null) return false;
        r.put("status", status);
        if (note != null && !note.isBlank()) r.put("note", note);
        r.put("updatedAt", LocalDateTime.now().format(DateTimeFormatter.ISO_LOCAL_DATE_TIME));
        persistAll();
        return true;
    }

    private void persistAll() throws IOException {
        StringBuilder sb = new StringBuilder();
        for (Map<String, Object> r : rows) sb.append(Json.write(r)).append('\n');
        Path tmp = file.resolveSibling(file.getFileName() + ".tmp");
        Files.writeString(tmp, sb.toString(), StandardCharsets.UTF_8);
        Files.move(tmp, file, StandardCopyOption.REPLACE_EXISTING, StandardCopyOption.ATOMIC_MOVE);
    }
}
