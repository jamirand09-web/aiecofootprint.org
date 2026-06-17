# AI Eco Footprint

Static single-page dashboard for `aiecofootprint.org`, built to visualize the environmental cost of generative AI prompts in real time.

## Project structure

- `index.html` — single-page semantic layout; inlines all CSS in a `<style>` block for zero render-blocking requests; Open Graph metadata, JSON-LD (WebApplication + FAQPage + citation schema), and SEO tags.
- `styles.css` — CSS source of record (warm neutral palette, responsive). Not linked directly; contents are inlined into `index.html` at build time.
- `app.js` — client-side compute engine: token estimator, regional multipliers, impact calculations, and a 250ms global debt clock that pauses when the tab is backgrounded.
- `hero-banner.avif` — full-size hero image (1200×630) served to desktop browsers via `<picture>`.
- `hero-banner-mobile.avif` — mobile-optimised hero image (914×480) served at ≤768 px viewports via `<picture>`.
- `hero-banner.png` — original PNG hero image; fallback for browsers without AVIF support.
- `og-preview.png` — 1200×630 Open Graph social-share image with text overlay; used only in `<meta property="og:image">`.
- `vercel.json` — static hosting config with HTTP security headers (CSP, X-Frame-Options, Referrer-Policy, Permissions-Policy).
- `robots.txt` — crawl rules; explicitly allows GPTBot, ClaudeBot, anthropic-ai, Google-Extended, and PerplexityBot.
- `sitemap.xml` — single-URL sitemap referenced by robots.txt.
- `llms.txt` — GEO/LLM discoverability file following the llmstxt.org spec; describes the tool, baselines, and research sources for AI search engines.

## Local preview

Open `index.html` directly in the browser, or serve locally from the project folder using a simple static web server.

Example with Python:

```bash
cd ~/path/to/aiecofootprint
python3 -m http.server 8000
```

Then open `http://localhost:8000`.

## Deployment to Vercel

1. Push this repository to GitHub:
   - `git init`
   - `git add .`
   - `git commit -m "Initial static dashboard for aiecofootprint.org"`
   - `git remote add origin https://github.com/jamirand09-web/aiecofootprint.org.git`
   - `git push -u origin main`

2. Import the repository in Vercel and deploy the project.
   - No build command is required for this static site.
   - Root directory is the project root.

3. Add the custom domain `aiecofootprint.org` in the Vercel dashboard.

4. Configure Namecheap DNS:
   - Add an A record for `@` pointing to `76.76.21.21`
   - Add a CNAME record for `www` pointing to `cname.vercel-dns.com`

5. Wait for the DNS records to propagate; Vercel will validate the domain and enable HTTPS automatically.

## Notes

- This project is intentionally client-side only.
- The dashboard uses a strict math model and region-specific multipliers for electricity, water, and carbon values.
- The calculations use averaged baselines and regional grid profiles rather than live data center telemetry.
- Results are intended as order-of-magnitude estimates and educational context, not a certified measurement tool.
- The page is optimized for Vercel static hosting and simple SEO discovery.

## Assumptions & Scope

- Electricity, water, and carbon estimates are based on peer-reviewed per-token baselines and public grid intensity data.
- Actual environmental impact varies with model architecture, server utilization, workload scheduling, and specific data center cooling systems.
- Regional multipliers are averages for the selected region, not real-time carbon or water telemetry.
- Water values represent blended direct and upstream effects and may not match a single facility’s closed-loop cooling configuration.

## Contributing

If you are an infrastructure researcher or operator with more granular data, please open an issue at <https://github.com/jamirand09-web/aiecofootprint.org/issues> so we can refine the assumptions and multipliers.
