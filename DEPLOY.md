# Deploying AutoDz Vip (autodz.vip)

Split deployment: the static frontend goes on Netlify, the backend (DB +
Telegram + anti-spam) runs on your VPS at `api.autodz.vip`.

## 1. Backend on the VPS (api.autodz.vip)

SSH into the VPS, then:

```bash
# Node 22+ is required (uses the built-in node:sqlite module)
curl -fsSL https://deb.nodesource.com/setup_22.x | sudo bash -
sudo apt-get install -y nodejs nginx

sudo npm install -g pm2

# Copy the project to the server (scp, git clone, rsync — your choice), e.g.:
#   git clone <your-repo> /var/www/autodz
cd /var/www/autodz
npm install --omit=dev
```

Edit `.env` on the server (copy from `.env.example` if starting fresh) and set:

```
CLIENT_ORIGIN=https://autodz.vip,https://www.autodz.vip
TRUST_PROXY=1
PORT=8787
```

Keep `HMAC_SECRET`, `TELEGRAM_BOT_TOKEN`, `TELEGRAM_CHAT_ID`, `ADMIN_USER`,
`ADMIN_PASSWORD` as already generated — or regenerate fresh ones for
production (recommended) using the commands documented in `.env.example`.

Start the backend under PM2 so it survives crashes and reboots:

```bash
pm2 start ecosystem.config.cjs
pm2 save
pm2 startup   # follow the printed instructions to enable on boot
```

Set up the Nginx reverse proxy:

```bash
sudo cp deploy/nginx-api.conf /etc/nginx/sites-available/api.autodz.vip
sudo ln -s /etc/nginx/sites-available/api.autodz.vip /etc/nginx/sites-enabled/
sudo nginx -t && sudo systemctl reload nginx
```

In your DNS provider, add an **A record**: `api.autodz.vip` → your VPS's
public IP. Wait for it to propagate, then get a real SSL certificate:

```bash
sudo apt-get install -y certbot python3-certbot-nginx
sudo certbot --nginx -d api.autodz.vip
```

Verify: `curl https://api.autodz.vip/api/health` should return
`{"ok":true,"telegram":true,"admin":true}`.

## 2. Frontend on Netlify (autodz.vip)

1. Push this project to a git repo (GitHub/GitLab) and connect it in Netlify,
   or run `npx netlify-cli deploy --prod` from this folder.
2. Netlify auto-detects `netlify.toml` (build command `npm run build`,
   publish dir `dist`) — no manual config needed.
3. In Netlify's dashboard, set an environment variable:
   `VITE_API_BASE_URL=https://api.autodz.vip` (this is already the default
   in `.env.production`, but setting it in Netlify too makes it explicit).
   If you later want to set `VITE_FB_PIXEL_ID`, add it here as well.
4. In Netlify → Domain settings, add `autodz.vip` and `www.autodz.vip`.
   Netlify shows the exact DNS records to add at your registrar (usually an
   ALIAS/ANAME or Netlify's load-balancer IP for the apex, plus a CNAME for
   `www`). Follow its on-screen instructions — they're specific to your
   registrar.
5. Netlify auto-provisions SSL for the domain once DNS resolves.

## 3. Final checklist

- [ ] `https://api.autodz.vip/api/health` returns `ok: true`
- [ ] `https://autodz.vip` loads the site
- [ ] Submitting the request form on the live site creates a row in the VPS's
      `data/requests.sqlite` and a message appears in your Telegram channel
- [ ] `https://api.autodz.vip/gestion` prompts for the Basic Auth credentials in
      `.env` and shows the request list
- [ ] `www.autodz.vip` redirects to `autodz.vip` (or vice versa, whichever you
      picked as canonical in Netlify)

## Notes

- The backend's SQLite file (`data/requests.sqlite`) lives only on the VPS —
  back it up periodically (`cp data/requests.sqlite data/backup-$(date +%F).sqlite`
  via a cron job is enough for this scale).
- To ship code changes to the backend: pull the new code on the VPS, then
  `pm2 restart autodz-api`.
- To ship frontend changes: push to your connected git branch — Netlify
  rebuilds automatically. Or `npx netlify-cli deploy --prod` for manual pushes.
