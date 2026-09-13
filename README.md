# Pica Detailing Bros

A live shop-console website for Pica Detailing Bros, a car detailing business — a lead & customer dashboard covering the sales pipeline, booked jobs, and revenue at a glance.

## Features

- **Dashboard** — key stats (leads, pipeline value, jobs booked), lead/booking trend chart, lead source breakdown, and revenue chart
- **Leads** — searchable table of incoming leads, add new leads via modal, export to CSV
- **Pipeline** — kanban board across New → Contacted → Quoted → Booked
- **Customers** — recent completed jobs
- **Admin** — role-gated settings view (service menu, booking hours, team), toggled via "Switch to Admin"

## Stack

Static HTML/CSS/JS, [Chart.js](https://www.chartjs.org/) via CDN. No build step — leads are persisted to `localStorage` in the browser.

## Running locally

Open `index.html` directly in a browser, or serve the folder:

```bash
python3 -m http.server 8000
```

Then visit `http://localhost:8000`.
