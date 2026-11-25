package in.zerodebt;

import java.util.*;

/** Tiny dependency-free JSON reader/writer (maps, lists, strings, numbers, booleans, null). */
public final class Json {
    private Json() {}

    // ---------- writer ----------
    public static String write(Object o) {
        StringBuilder sb = new StringBuilder();
        write(o, sb);
        return sb.toString();
    }

    @SuppressWarnings("unchecked")
    private static void write(Object o, StringBuilder sb) {
        if (o == null) sb.append("null");
        else if (o instanceof String s) quote(s, sb);
        else if (o instanceof Number || o instanceof Boolean) sb.append(o);
        else if (o instanceof Map<?, ?> m) {
            sb.append('{');
            boolean first = true;
            for (Map.Entry<?, ?> e : m.entrySet()) {
                if (!first) sb.append(',');
                first = false;
                quote(String.valueOf(e.getKey()), sb);
                sb.append(':');
                write(e.getValue(), sb);
            }
            sb.append('}');
        } else if (o instanceof Collection<?> c) {
            sb.append('[');
            boolean first = true;
            for (Object v : c) {
                if (!first) sb.append(',');
                first = false;
                write(v, sb);
            }
            sb.append(']');
        } else quote(String.valueOf(o), sb);
    }

    private static void quote(String s, StringBuilder sb) {
        sb.append('"');
        for (int i = 0; i < s.length(); i++) {
            char c = s.charAt(i);
            switch (c) {
                case '"' -> sb.append("\\\"");
                case '\\' -> sb.append("\\\\");
                case '\n' -> sb.append("\\n");
                case '\r' -> sb.append("\\r");
                case '\t' -> sb.append("\\t");
                default -> {
                    if (c < 0x20) sb.append(String.format("\\u%04x", (int) c));
                    else sb.append(c);
                }
            }
        }
        sb.append('"');
    }

    // ---------- parser ----------
    public static Object parse(String s) {
        Parser p = new Parser(s);
        p.ws();
        Object v = p.value(0);
        p.ws();
        if (p.i != s.length()) throw new IllegalArgumentException("Trailing data in JSON");
        return v;
    }

    @SuppressWarnings("unchecked")
    public static Map<String, Object> parseObject(String s) {
        Object o = parse(s);
        if (o instanceof Map<?, ?> m) return (Map<String, Object>) m;
        throw new IllegalArgumentException("Expected a JSON object");
    }

    private static final class Parser {
        final String s;
        int i = 0;

        Parser(String s) { this.s = s; }

        void ws() { while (i < s.length() && Character.isWhitespace(s.charAt(i))) i++; }

        IllegalArgumentException err(String m) { return new IllegalArgumentException(m + " at " + i); }

        Object value(int depth) {
            if (depth > 40) throw err("Too deeply nested");
            if (i >= s.length()) throw err("Unexpected end");
            char c = s.charAt(i);
            if (c == '{') return object(depth);
            if (c == '[') return array(depth);
            if (c == '"') return string();
            if (s.startsWith("true", i)) { i += 4; return Boolean.TRUE; }
            if (s.startsWith("false", i)) { i += 5; return Boolean.FALSE; }
            if (s.startsWith("null", i)) { i += 4; return null; }
            return number();
        }

        Map<String, Object> object(int depth) {
            Map<String, Object> m = new LinkedHashMap<>();
            i++; ws();
            if (i < s.length() && s.charAt(i) == '}') { i++; return m; }
            while (true) {
                ws();
                if (i >= s.length() || s.charAt(i) != '"') throw err("Expected key");
                String k = string();
                ws();
                if (i >= s.length() || s.charAt(i) != ':') throw err("Expected ':'");
                i++; ws();
                m.put(k, value(depth + 1));
                ws();
                if (i >= s.length()) throw err("Unterminated object");
                char c = s.charAt(i++);
                if (c == '}') return m;
                if (c != ',') throw err("Expected ',' or '}'");
            }
        }

        List<Object> array(int depth) {
            List<Object> l = new ArrayList<>();
            i++; ws();
            if (i < s.length() && s.charAt(i) == ']') { i++; return l; }
            while (true) {
                ws();
                l.add(value(depth + 1));
                ws();
                if (i >= s.length()) throw err("Unterminated array");
                char c = s.charAt(i++);
                if (c == ']') return l;
                if (c != ',') throw err("Expected ',' or ']'");
            }
        }

        String string() {
            StringBuilder sb = new StringBuilder();
            i++;
            while (true) {
                if (i >= s.length()) throw err("Unterminated string");
                char c = s.charAt(i++);
                if (c == '"') return sb.toString();
                if (c == '\\') {
                    if (i >= s.length()) throw err("Bad escape");
                    char e = s.charAt(i++);
                    switch (e) {
                        case '"' -> sb.append('"');
                        case '\\' -> sb.append('\\');
                        case '/' -> sb.append('/');
                        case 'b' -> sb.append('\b');
                        case 'f' -> sb.append('\f');
                        case 'n' -> sb.append('\n');
                        case 'r' -> sb.append('\r');
                        case 't' -> sb.append('\t');
                        case 'u' -> {
                            if (i + 4 > s.length()) throw err("Bad unicode escape");
                            sb.append((char) Integer.parseInt(s.substring(i, i + 4), 16));
                            i += 4;
                        }
                        default -> throw err("Bad escape");
                    }
                } else sb.append(c);
            }
        }

        Number number() {
            int st = i;
            while (i < s.length() && "+-0123456789.eE".indexOf(s.charAt(i)) >= 0) i++;
            if (st == i) throw err("Unexpected character");
            String t = s.substring(st, i);
            try {
                if (t.contains(".") || t.contains("e") || t.contains("E")) return Double.parseDouble(t);
                return Long.parseLong(t);
            } catch (NumberFormatException ex) {
                throw err("Bad number");
            }
        }
    }
}
