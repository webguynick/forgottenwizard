# How to Update ForgottenWizard.com

Every time you push to GitHub, the site updates on Hostinger automatically.

---

## Quick Update (3 commands)

```bash
git add .
git commit -m "what you changed"
git push
```

Done. Site is live in seconds.

---

## Common Updates

### Add a new Tesla fact
Open `index.html` → find the `<!-- FACTS -->` section → copy an existing `.fact-card` block and edit the content.

### Change affiliate links
Open `index.html` → search for the link text (e.g. "Starlink") → update the `href`.

### Update AdSense publisher ID
Open `index.html` → find `ca-pub-XXXXXXXXXX` → replace with your real ID.
There are 2 spots — in the `<head>` and mid-page.

### Edit the game
Open `game.html` → edit sliders, parts, or game logic in the `<script>` section at the bottom.

### Change styles / colors
Open `css/style.css` → CSS variables are at the top under `:root { }`.
Main colors:
- `--color-arc: #00b4ff`  (electric blue)
- `--color-gold: #f0c040` (gold)
- `--color-violet: #9b59f5` (violet)

---

## Editing on GitHub Directly (no terminal needed)

1. Go to https://github.com/webguynick/forgottenwizard
2. Click the file you want to edit
3. Click the ✏️ pencil icon (top right)
4. Make your changes
5. Scroll down → click **Commit changes**
6. Site auto-updates on Hostinger ✅

---

## First-Time Setup on a New Computer

```bash
# Clone the repo
git clone https://github.com/webguynick/forgottenwizard.git
cd forgottenwizard

# Make changes, then push
git add .
git commit -m "your message"
git push
```

---

## Hostinger Webhook
Auto-deployment is powered by a webhook between GitHub and Hostinger.
If auto-deploy ever stops working:
1. Log into hPanel → your site → Git
2. Click **Auto Deployment** → copy the Webhook URL
3. Go to GitHub repo → Settings → Webhooks → verify the URL is there
