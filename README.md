# QuickLink — Serverless Cloud URL Shortener

**Live Deployment:** https://quicklink.khantlinhtut83.workers.dev/

**Team Members:**
* Khant Lin Htut
* Ahmad Kadour

---

## 1. Overview & Why Cloud?
**QuickLink** is a lightweight, cloud-based URL shortener. Users paste a long URL, click **Shorten**, receive a 6-character short link, and clicking it triggers an instant **HTTP 302 redirect** to the original webpage.

* **Why Cloud:** A URL shortener must be reachable 24/7 from anywhere in the world. Running it on a local laptop fails as soon as the machine sleeps.
* **Cloud Model:** Public Cloud — Serverless PaaS (**Cloudflare Workers**) + Managed Storage (**Cloudflare KV**).

---

## 2. System Architecture
```text
User Browser ──(HTTPS)──▶ Cloudflare Edge (TLS + DDoS)
                                │
                            (Event)
                                ▼
                       Cloudflare Worker (Stateless Compute)
                                │
                         (Binding: env.URLS)
                                ▼
                       Cloudflare KV (Managed Storage: URLS)
