# Zerodebt Solution Pvt Ltd - Website

Java full-stack website. The backend uses only the JDK (no Maven, no downloads), the frontend is plain HTML/CSS/JS.

## Run
Requires JDK 17 or newer.

    ./run.sh            (Linux / macOS)
    run.bat             (Windows)

Open http://localhost:8080 . Admin console: http://localhost:8080/admin.html

Set a real admin password before going live:

    ADMIN_PASSWORD='your-strong-password' ./run.sh        (Windows: set ADMIN_PASSWORD=... first)

Optional: `PORT=9000`.

## Pages
- index.html - welcome page (preloader, animated hero, services, process, `#clients`)
- about-us.html, our-expertise.html (tabs + FAQ), explore.html (insights + EMI + restructuring calculators)
- business-enquiry.html (Business + Borrower tabs), submit-case.html, track-case.html, admin.html

## Backend API (src/in/zerodebt/Main.java)
| Endpoint | Purpose |
|---|---|
| POST /api/enquiry | business / case / borrower / callback forms, returns reference ID |
| GET /api/track?ref=&last4= | status lookup (reference ID + last 4 digits of mobile) |
| GET /api/calc/emi, /api/calc/restructure | calculators |
| GET /api/insights, /api/config, /api/stats | content |
| POST /api/admin/login, GET /api/admin/enquiries, POST /api/admin/status, GET /api/admin/export | admin |

Data is stored in `data/enquiries.jsonl` (back this file up).

## Edit your content
- Phone, email, address, hours, social links: `data/config.json`
- Insight articles: `data/insights.json`
- Logo: `web/assets/logo.png`

## Before going live
Put it behind HTTPS (nginx/Caddy reverse proxy), change the admin password, and replace the placeholder contact details.
# zerodebt
