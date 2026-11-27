# QuickLink — Serverless Cloud URL Shortener

**Live Deployment:** https://quicklink.khantlinhtut83.workers.dev/

**Team Members:**
* Khant Lin Htut(100004664)
* Ahmad Kadour(100004098) 

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
```

* **Stateless Compute (`worker.js`):** Serves the web UI, handles `POST /shorten` to generate 6-character codes, and performs `302` redirects.
* **External Storage (`URLS` KV Namespace):** Stores short-code-to-URL mappings outside the compute runtime so restarts never lose data.
* **Orchestration Choice:** We chose serverless auto-scaling (Cloudflare Workers) over Kubernetes to avoid unnecessary cost and operational overhead for a 2-person team, while gaining **scale-to-zero** ($0 idle cost).

---

## 3. Project Log (What We Built & Why)

| Date / Phase | What We Built | Why | Contributors |
| :--- | :--- | :--- | :--- |
| **Week 1 (Nov 13)** | Defined project idea (QuickLink), cloud model (Public Cloud / Serverless PaaS), and initial architecture sketch. | Kept scope small, practical, and reachable 24/7 on Free Tier. | Khant Lin Htut, Ahmad Kadour |
| **Week 2 (Nov 18)** | Built Worker application (`GET /`, `POST /shorten`, `GET /:code` redirect) and deployed initial live version on Cloudflare Workers. | Event-driven serverless compute removes VM maintenance and scales automatically. | Khant Lin Htut |
| **Week 2 (Nov 18–20)** | Created external Cloudflare KV namespace (`URLS`) and connected it via internal Binding (`env.URLS`). | Decoupled persistent data from stateless compute so restarts never lose links; avoided hardcoded DB credentials. | Khant Lin Htut, Ahmad Kadour |
| **Week 3 (Nov 23)** | Completed end-to-end testing, cost analysis (100 vs. 10,000 users), honest security review, and recorded offline backup demo video. | Verified full flow works live and prepared a fallback in case campus Wi-Fi fails. | Ahmad Kadour, Khant Lin Htut |
| **Week 3 (Nov 25–27)** | Finalized presentation slides, speaking script, and Q&A preparation. | Clear structure covering all course building blocks for the final exam presentation. | Khant Lin Htut, Ahmad Kadour |

---

## 4. Cost Estimate & Control
* **100 users / month:** **$0.00 / month** (well inside Cloudflare Free Tier: 100,000 requests/day & 100,000 KV reads/day).
* **10,000 users / month:** **$0 – $5 / month** (Workers Paid Plan at $5/month covers 10M requests & 10M KV reads).
* **Cost Control:** Hard Free-Tier daily caps prevent surprise bills; billing alerts before enabling any paid tier; unused test Workers/KV namespaces deleted.

---

## 5. Honest Security Review
* **Protected:** Automatic HTTPS (TLS) via Cloudflare Edge, built-in DDoS protection, zero hardcoded secrets in code/repo (KV accessed via internal Binding `env.URLS`).
* **Not Yet Protected:** No per-IP rate limiting on `/shorten`, no malicious/phishing URL validation, no user authentication, and no automatic link expiration.
* **Next Steps:** Add Cloudflare WAF rate-limiting rules, validate URLs against a safe-browsing blocklist, add user login for link management, and enable KV `expirationTtl`.

---

## 6. Lesson Learned
Initially keeping state locally and forgetting to bind the `URLS` KV namespace before deploying caused lost links and runtime errors (`env.URLS` undefined). Moving all persistent data into external Cloudflare KV and verifying bindings before deployment reinforced why cloud compute must always remain stateless.

---

## 7. Running Locally with Docker
For local development and portability, QuickLink can also be run inside a Docker container using `Dockerfile` and `docker-compose.yml` (with a persistent Docker volume for storage):

```bash
docker compose up --build
```

Once running, open **http://localhost:8080** in your browser.
