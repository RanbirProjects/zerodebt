package in.zerodebt;

import com.sun.net.httpserver.*;

import java.io.*;
import java.net.InetSocketAddress;
import java.net.URI;
import java.net.URLDecoder;
import java.nio.charset.StandardCharsets;
import java.nio.file.*;
import java.security.MessageDigest;
import java.security.SecureRandom;
import java.util.*;
import java.util.concurrent.*;
import java.util.regex.Pattern;

/**
 * Zerodebt Solution Pvt Ltd - web server.
 * Pure JDK (no external libraries): static site + JSON REST API + admin console.
 *
 *   javac -d out src/in/zerodebt/*.java && java -cp out in.zerodebt.Main
 */
public class Main {
    static final Path ROOT = Paths.get(System.getProperty("zd.root", ".")).toAbsolutePath().normalize();
    static final Path WEB = ROOT.resolve("web");
    static final Path DATA = ROOT.resolve("data");
    static final String ADMIN_PASSWORD = System.getenv().getOrDefault("ADMIN_PASSWORD", "admin@123");
    static final SecureRandom RANDOM = new SecureRandom();

    static Store store;
    static final Map<String, Long> adminTokens = new ConcurrentHashMap<>();     // token -> expiry millis
    static final Map<String, Deque<Long>> hits = new ConcurrentHashMap<>();    // rate limit buckets

    static final Map<String, String> MIME = Map.ofEntries(
            Map.entry("html", "text/html; charset=utf-8"), Map.entry("css", "text/css; charset=utf-8"),
            Map.entry("js", "application/javascript; charset=utf-8"), Map.entry("json", "application/json; charset=utf-8"),
            Map.entry("png", "image/png"), Map.entry("jpg", "image/jpeg"), Map.entry("jpeg", "image/jpeg"),
            Map.entry("svg", "image/svg+xml"), Map.entry("ico", "image/x-icon"), Map.entry("webp", "image/webp"),
            Map.entry("txt", "text/plain; charset=utf-8"), Map.entry("woff2", "font/woff2"));

    public static void main(String[] args) throws Exception {
        int port = Integer.parseInt(System.getenv().getOrDefault("PORT", "8080"));
        store = new Store(DATA.resolve("enquiries.jsonl"));

        HttpServer server = HttpServer.create(new InetSocketAddress(port), 0);
        server.createContext("/api/", Main::api);
        server.createContext("/", Main::staticFiles);
        server.setExecutor(Executors.newVirtualThreadPerTaskExecutor());
        server.start();

        System.out.println("==============================================");
        System.out.println(" Zerodebt Solution Pvt Ltd  -  server running");
        System.out.println(" Website : http://localhost:" + port + "/");
        System.out.println(" Admin   : http://localhost:" + port + "/admin.html");
        if (ADMIN_PASSWORD.equals("admin@123"))
            System.out.println(" WARNING : default admin password in use. Set ADMIN_PASSWORD env var before going live.");
        System.out.println("==============================================");
    }

    // ------------------------------------------------------------------ static files
    static void staticFiles(HttpExchange ex) throws IOException {
        try {
            if (!ex.getRequestMethod().equals("GET") && !ex.getRequestMethod().equals("HEAD")) {
                send(ex, 405, "text/plain", "Method not allowed".getBytes());
                return;
            }
            String p = URLDecoder.decode(ex.getRequestURI().getPath(), StandardCharsets.UTF_8);
            if (p.equals("/") || p.isEmpty()) p = "/index.html";
            if (p.contains("\0") || p.contains("..")) { notFound(ex); return; }
            Path f = WEB.resolve(p.substring(1)).normalize();
            if (!f.startsWith(WEB)) { notFound(ex); return; }
            if (Files.isDirectory(f)) f = f.resolve("index.html");
            if (!Files.exists(f) && !p.contains(".")) f = WEB.resolve(p.substring(1) + ".html").normalize();
            String name = f.getFileName() == null ? "" : f.getFileName().toString();
            if (name.startsWith(".") || !Files.isRegularFile(f) || !f.startsWith(WEB)) { notFound(ex); return; }
            String ext = name.contains(".") ? name.substring(name.lastIndexOf('.') + 1).toLowerCase() : "";
            byte[] body = Files.readAllBytes(f);
            Headers h = ex.getResponseHeaders();
            h.set("Cache-Control", ext.equals("html") ? "no-cache" : "public, max-age=300");
            send(ex, 200, MIME.getOrDefault(ext, "application/octet-stream"), body);
        } catch (Exception e) {
            send(ex, 500, "text/plain", "Server error".getBytes());
        }
    }

    static void notFound(HttpExchange ex) throws IOException {
        Path nf = WEB.resolve("404.html");
        if (Files.exists(nf)) {
            byte[] b = Files.readAllBytes(nf);
            send(ex, 404, MIME.get("html"), b);
        } else send(ex, 404, "text/plain", "Not found".getBytes());
    }

    // ------------------------------------------------------------------ API
    static void api(HttpExchange ex) throws IOException {
        try {
            String path = ex.getRequestURI().getPath();
            String method = ex.getRequestMethod();
            Map<String, String> q = query(ex.getRequestURI());

            switch (path) {
                case "/api/health" -> json(ex, 200, Map.of("ok", true));
                case "/api/config" -> serveDataFile(ex, "config.json");
                case "/api/insights" -> serveDataFile(ex, "insights.json");
                case "/api/stats" -> stats(ex);
                case "/api/calc/emi" -> calcEmi(ex, q);
                case "/api/calc/restructure" -> calcRestructure(ex, q);
                case "/api/enquiry" -> {
                    if (!method.equals("POST")) { methodNotAllowed(ex); return; }
                    if (limited(ex, "post", 12, 60_000)) { json(ex, 429, err("Too many requests. Please try again in a minute.")); return; }
                    enquiry(ex);
                }
                case "/api/track" -> {
                    if (limited(ex, "track", 20, 60_000)) { json(ex, 429, err("Too many requests. Please try again shortly.")); return; }
                    track(ex, q);
                }
                case "/api/admin/login" -> {
                    if (!method.equals("POST")) { methodNotAllowed(ex); return; }
                    if (limited(ex, "login", 6, 60_000)) { json(ex, 429, err("Too many attempts. Wait a minute.")); return; }
                    adminLogin(ex);
                }
                case "/api/admin/enquiries" -> { if (admin(ex)) json(ex, 200, Map.of("items", store.all(), "statuses", Store.STATUSES)); }
                case "/api/admin/status" -> {
                    if (!method.equals("POST")) { methodNotAllowed(ex); return; }
                    if (admin(ex)) adminStatus(ex);
                }
                case "/api/admin/export" -> { if (admin(ex)) exportCsv(ex); }
                default -> json(ex, 404, err("Unknown endpoint"));
            }
        } catch (IllegalArgumentException e) {
            json(ex, 400, err(e.getMessage()));
        } catch (Exception e) {
            e.printStackTrace();
            json(ex, 500, err("Something went wrong on our side. Please try again."));
        }
    }

    static void serveDataFile(HttpExchange ex, String name) throws IOException {
        Path f = DATA.resolve(name);
        if (!Files.exists(f)) { json(ex, 404, err("Not configured")); return; }
        ex.getResponseHeaders().set("Cache-Control", "no-cache");
        send(ex, 200, MIME.get("json"), Files.readAllBytes(f));
    }

    static void stats(HttpExchange ex) {
        Map<String, Long> c = store.countsByType();
        long total = c.values().stream().mapToLong(Long::longValue).sum();
        Map<String, Object> m = new LinkedHashMap<>();
        m.put("enquiriesReceived", total);
        m.put("byType", c);
        json(ex, 200, m);
    }

    // ---- EMI ----
    static void calcEmi(HttpExchange ex, Map<String, String> q) {
        double amount = num(q, "amount", 1_000, 500_000_000);
        double rate = num(q, "rate", 0, 60);
        int months = (int) num(q, "months", 1, 480);
        double emi = emi(amount, rate, months);
        double total = emi * months;
        List<Map<String, Object>> sched = new ArrayList<>();
        double bal = amount;
        double r = rate / 1200.0;
        for (int m = 1; m <= months && m <= 12; m++) {
            double interest = bal * r;
            double principal = emi - interest;
            bal = Math.max(0, bal - principal);
            sched.add(Map.of("month", m, "interest", round(interest), "principal", round(principal), "balance", round(bal)));
        }
        Map<String, Object> out = new LinkedHashMap<>();
        out.put("emi", round(emi));
        out.put("totalPayable", round(total));
        out.put("totalInterest", round(total - amount));
        out.put("principal", round(amount));
        out.put("firstYear", sched);
        json(ex, 200, out);
    }

    /** Compare staying on the current plan vs a restructured (longer / shorter) tenure. */
    static void calcRestructure(HttpExchange ex, Map<String, String> q) {
        double outstanding = num(q, "outstanding", 1_000, 500_000_000);
        double rate = num(q, "rate", 0, 60);
        int currentMonths = (int) num(q, "currentMonths", 1, 480);
        int newMonths = (int) num(q, "newMonths", 1, 480);
        double curEmi = emi(outstanding, rate, currentMonths);
        double newEmi = emi(outstanding, rate, newMonths);
        Map<String, Object> out = new LinkedHashMap<>();
        out.put("currentEmi", round(curEmi));
        out.put("newEmi", round(newEmi));
        out.put("monthlyRelief", round(curEmi - newEmi));
        out.put("currentInterest", round(curEmi * currentMonths - outstanding));
        out.put("newInterest", round(newEmi * newMonths - outstanding));
        out.put("extraInterest", round((newEmi * newMonths) - (curEmi * currentMonths)));
        json(ex, 200, out);
    }

    static double emi(double p, double annualRate, int n) {
        double r = annualRate / 1200.0;
        if (r == 0) return p / n;
        double f = Math.pow(1 + r, n);
        return p * r * f / (f - 1);
    }

    static double num(Map<String, String> q, String k, double min, double max) {
        String v = q.get(k);
        if (v == null) throw new IllegalArgumentException("Missing parameter: " + k);
        double d;
        try { d = Double.parseDouble(v); } catch (NumberFormatException e) { throw new IllegalArgumentException("Invalid number for " + k); }
        if (Double.isNaN(d) || d < min || d > max) throw new IllegalArgumentException(k + " must be between " + min + " and " + max);
        return d;
    }

    static double round(double d) { return Math.round(d * 100.0) / 100.0; }

    // ---- Enquiries ----
    static final Pattern PHONE = Pattern.compile("^[6-9][0-9]{9}$");
    static final Pattern EMAIL = Pattern.compile("^[A-Za-z0-9._%+\\-]+@[A-Za-z0-9.\\-]+\\.[A-Za-z]{2,}$");

    static final Map<String, List<String>> FIELDS = Map.of(
            "business", List.of("organisation", "designation", "serviceInterest", "portfolioSize", "message"),
            "case", List.of("organisation", "portfolioType", "accounts", "outstandingAmount", "message"),
            "borrower", List.of("loanType", "lenderName", "outstandingAmount", "message"),
            "callback", List.of("preferredTime", "message"));

    static void enquiry(HttpExchange ex) throws IOException {
        Map<String, Object> body = Json.parseObject(readBody(ex));
        String type = str(body, "type", 20);
        if (!FIELDS.containsKey(type)) throw new IllegalArgumentException("Invalid enquiry type");

        String name = str(body, "name", 100);
        if (name.length() < 2) throw new IllegalArgumentException("Please enter your full name.");
        String phone = str(body, "phone", 20).replaceAll("[\\s\\-]", "").replaceFirst("^(\\+91|91|0)(?=[0-9]{10}$)", "");
        if (!PHONE.matcher(phone).matches()) throw new IllegalArgumentException("Please enter a valid 10-digit Indian mobile number.");
        String email = str(body, "email", 150);
        if (!email.isEmpty() && !EMAIL.matcher(email).matches()) throw new IllegalArgumentException("Please enter a valid email address.");
        if (!type.equals("callback") && !type.equals("borrower") && email.isEmpty())
            throw new IllegalArgumentException("Email address is required.");
        if (!Boolean.TRUE.equals(body.get("consent"))) throw new IllegalArgumentException("Please accept the consent to be contacted.");

        Map<String, Object> f = new LinkedHashMap<>();
        f.put("name", name);
        f.put("phone", phone);
        f.put("email", email);
        for (String key : FIELDS.get(type)) f.put(key, str(body, key, key.equals("message") ? 1500 : 150));

        switch (type) {
            case "business" -> require(f, "organisation", "Organisation name is required.");
            case "case" -> { require(f, "organisation", "Organisation name is required."); require(f, "portfolioType", "Select the portfolio type."); }
            case "borrower" -> require(f, "loanType", "Select the loan type.");
            default -> { }
        }
        Map<String, Object> saved = store.add(type, f);
        System.out.println("[enquiry] " + saved.get("ref") + " (" + type + ")");
        json(ex, 201, Map.of("ok", true, "ref", saved.get("ref"),
                "message", "Thank you! Our team will reach out within 24 working hours."));
    }

    static void require(Map<String, Object> f, String k, String msg) {
        if (String.valueOf(f.get(k)).isBlank()) throw new IllegalArgumentException(msg);
    }

    static void track(HttpExchange ex, Map<String, String> q) {
        String ref = q.getOrDefault("ref", "").trim().toUpperCase();
        String last4 = q.getOrDefault("last4", "").trim();
        Map<String, Object> r = ref.isEmpty() ? null : store.find(ref);
        // same response for "not found" and "wrong digits" so reference IDs cannot be probed
        if (r == null || !last4.matches("[0-9]{4}") || !String.valueOf(r.get("phone")).endsWith(last4)) {
            json(ex, 404, err("No request found. Check the reference ID and the last 4 digits of your mobile number."));
            return;
        }
        Map<String, Object> out = new LinkedHashMap<>();
        out.put("ref", r.get("ref"));
        out.put("type", r.get("type"));
        out.put("status", r.get("status"));
        out.put("createdAt", r.get("createdAt"));
        out.put("updatedAt", r.getOrDefault("updatedAt", r.get("createdAt")));
        out.put("steps", Store.STATUSES);
        json(ex, 200, out);
    }

    // ---- Admin ----
    static void adminLogin(HttpExchange ex) throws IOException {
        Map<String, Object> b = Json.parseObject(readBody(ex));
        String pw = str(b, "password", 200);
        boolean ok = MessageDigest.isEqual(pw.getBytes(StandardCharsets.UTF_8), ADMIN_PASSWORD.getBytes(StandardCharsets.UTF_8));
        if (!ok) { json(ex, 401, err("Incorrect password.")); return; }
        byte[] raw = new byte[32];
        RANDOM.nextBytes(raw);
        String token = HexFormat.of().formatHex(raw);
        adminTokens.put(token, System.currentTimeMillis() + 8 * 3600_000L);
        json(ex, 200, Map.of("token", token));
    }

    static boolean admin(HttpExchange ex) {
        String h = ex.getRequestHeaders().getFirst("Authorization");
        String t = h != null && h.startsWith("Bearer ") ? h.substring(7).trim() : "";
        Long exp = adminTokens.get(t);
        if (exp == null || exp < System.currentTimeMillis()) {
            adminTokens.remove(t);
            json(ex, 401, err("Please sign in."));
            return false;
        }
        return true;
    }

    static void adminStatus(HttpExchange ex) throws IOException {
        Map<String, Object> b = Json.parseObject(readBody(ex));
        String ref = str(b, "ref", 40), status = str(b, "status", 40), note = str(b, "note", 500);
        if (!Store.STATUSES.contains(status)) throw new IllegalArgumentException("Invalid status");
        if (!store.updateStatus(ref, status, note)) { json(ex, 404, err("Reference not found")); return; }
        json(ex, 200, Map.of("ok", true));
    }

    static void exportCsv(HttpExchange ex) throws IOException {
        String[] cols = {"ref", "type", "status", "createdAt", "name", "phone", "email", "organisation", "designation",
                "serviceInterest", "portfolioType", "portfolioSize", "accounts", "loanType", "lenderName",
                "outstandingAmount", "preferredTime", "message", "note"};
        StringBuilder sb = new StringBuilder(String.join(",", cols)).append("\r\n");
        for (Map<String, Object> r : store.all()) {
            for (int i = 0; i < cols.length; i++) {
                if (i > 0) sb.append(',');
                sb.append(csv(String.valueOf(r.getOrDefault(cols[i], ""))));
            }
            sb.append("\r\n");
        }
        ex.getResponseHeaders().set("Content-Disposition", "attachment; filename=\"zerodebt-enquiries.csv\"");
        send(ex, 200, "text/csv; charset=utf-8", sb.toString().getBytes(StandardCharsets.UTF_8));
    }

    static String csv(String v) {
        if (!v.isEmpty() && "=+-@\t\r".indexOf(v.charAt(0)) >= 0) v = "'" + v;   // block spreadsheet formula injection
        return "\"" + v.replace("\"", "\"\"") + "\"";
    }

    // ------------------------------------------------------------------ helpers
    static boolean limited(HttpExchange ex, String bucket, int max, long windowMs) {
        String key = bucket + "|" + ex.getRemoteAddress().getAddress().getHostAddress();
        Deque<Long> d = hits.computeIfAbsent(key, k -> new ArrayDeque<>());
        long now = System.currentTimeMillis();
        synchronized (d) {
            while (!d.isEmpty() && now - d.peekFirst() > windowMs) d.pollFirst();
            if (d.size() >= max) return true;
            d.addLast(now);
            return false;
        }
    }

    static String str(Map<String, Object> m, String k, int max) {
        Object v = m.get(k);
        if (v == null) return "";
        String s = String.valueOf(v).replaceAll("[\\p{Cntrl}&&[^\\n\\t]]", "").trim();
        if (s.length() > max) throw new IllegalArgumentException("'" + k + "' is too long.");
        return s;
    }

    static String readBody(HttpExchange ex) throws IOException {
        byte[] b = ex.getRequestBody().readNBytes(65_537);
        if (b.length > 65_536) throw new IllegalArgumentException("Request too large");
        return new String(b, StandardCharsets.UTF_8);
    }

    static Map<String, String> query(URI u) {
        Map<String, String> m = new HashMap<>();
        String q = u.getRawQuery();
        if (q == null) return m;
        for (String pair : q.split("&")) {
            int i = pair.indexOf('=');
            String k = URLDecoder.decode(i < 0 ? pair : pair.substring(0, i), StandardCharsets.UTF_8);
            String v = i < 0 ? "" : URLDecoder.decode(pair.substring(i + 1), StandardCharsets.UTF_8);
            m.put(k, v);
        }
        return m;
    }

    static Map<String, Object> err(String msg) { return Map.of("ok", false, "error", msg); }

    static void methodNotAllowed(HttpExchange ex) { json(ex, 405, err("Method not allowed")); }

    static void json(HttpExchange ex, int code, Object body) {
        try {
            ex.getResponseHeaders().set("Cache-Control", "no-store");
            send(ex, code, MIME.get("json"), Json.write(body).getBytes(StandardCharsets.UTF_8));
        } catch (IOException ignored) { }
    }

    static void send(HttpExchange ex, int code, String type, byte[] body) throws IOException {
        Headers h = ex.getResponseHeaders();
        h.set("Content-Type", type);
        h.set("X-Content-Type-Options", "nosniff");
        h.set("X-Frame-Options", "DENY");
        h.set("Referrer-Policy", "strict-origin-when-cross-origin");
        h.set("Content-Security-Policy", "default-src 'self'; img-src 'self' data:; "
                + "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src https://fonts.gstatic.com; "
                + "script-src 'self'; connect-src 'self'; frame-ancestors 'none'; base-uri 'self'; form-action 'self'");
        if (ex.getRequestMethod().equals("HEAD")) {
            ex.sendResponseHeaders(code, -1);
        } else {
            ex.sendResponseHeaders(code, body.length);
            try (OutputStream os = ex.getResponseBody()) { os.write(body); }
        }
        ex.close();
    }
}
