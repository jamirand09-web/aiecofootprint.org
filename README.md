# AI Eco Footprint

Static single-page dashboard for `aiecofootprint.org`, built to visualize the environmental cost of generative AI prompts in real time.

## Project structure

- `index.html` — single-page semantic dashboard layout, metadata, JSON-LD, and global deployment SEO tags.
- `styles.css` — responsive dark-mode dashboard styling with split-grid layout.
- `app.js` — client-side compute engine, token estimator, regional multipliers, and 100ms global debt clock.

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
- The page is optimized for Vercel static hosting and simple SEO discovery.
