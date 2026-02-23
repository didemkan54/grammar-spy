# Deploy Grammar Spy step by step (from zero)

This guide gets your site online with a free URL and a working payment-check API. No domain needed to start.

---

## What you’ll use

- **Vercel** – hosts your site and runs the small API (free tier).
- **GitHub** – where your code lives so Vercel can deploy it (free).
- **Stripe** (optional for now) – for real payments; you can deploy first and add Stripe later.

---

## Part 1: Put your project on GitHub

1. **Create a GitHub account** (if you don’t have one)  
   - Go to [github.com](https://github.com) → Sign up.

2. **Create a new repository**  
   - Click the **+** (top right) → **New repository**.  
   - Name it something like `grammar-spy`.  
   - Leave it empty (no README, no .gitignore).  
   - Click **Create repository**.

3. **Upload your Grammar Spy folder**  
   - On the new repo page, GitHub will show “uploading an existing file” or “push an existing repository.”  
   - **Option A – Drag and drop**  
     - Click “uploading an existing file.”  
     - Drag your whole `GrammarSpy_Pack01` folder contents (all files and folders) into the browser.  
     - Wait for upload to finish, then click **Commit changes**.  
   - **Option B – Using Git on your computer**  
     - Open Terminal (Mac) or Command Prompt.  
     - `cd` into your project folder, for example:  
       `cd Desktop/grammar-games/GrammarSpy_Pack01`  
     - Run:
       ```bash
       git init
       git add .
       git commit -m "Initial commit"
       git branch -M main
       git remote add origin https://github.com/YOUR_USERNAME/grammar-spy.git
       git push -u origin main
       ```
       (Replace `YOUR_USERNAME` and `grammar-spy` with your GitHub username and repo name.)

When you’re done, your code should be visible on GitHub inside that repository.

---

## Part 2: Deploy on Vercel

1. **Create a Vercel account**  
   - Go to [vercel.com](https://vercel.com).  
   - Click **Sign Up**.  
   - Choose **Continue with GitHub** and approve Vercel’s access.

2. **Import your project**  
   - On Vercel’s dashboard, click **Add New…** → **Project**.  
   - You should see your GitHub repo (e.g. `grammar-spy`). Click **Import** next to it.  
   - Leave the default settings (Framework Preset can stay “Other”).  
   - Click **Deploy**.  
   - Wait 1–2 minutes. When it’s done, you’ll get a link like `grammar-spy-xxxx.vercel.app`. That’s your live site.

3. **Open your site**  
   - Click **Visit** (or open the link in a new tab).  
   - You should see the Grammar Spy homepage. Try a few links and a mission to confirm everything works.

You now have the site live with a free URL. The “payment check” API will work as soon as you add Stripe (Part 3).

---

## Part 3: Add Stripe so payment verification works (optional for launch)

Your pricing page has an “API” that checks with Stripe whether a checkout was paid. It only works after you set up Stripe and add one secret key.

1. **Create a Stripe account**  
   - Go to [stripe.com](https://stripe.com) and sign up.  
   - Complete any verification they ask for.

2. **Get your secret key**  
   - In the Stripe Dashboard, click **Developers** → **API keys**.  
   - Under “Standard keys” you’ll see **Secret key** (starts with `sk_`).  
   - Click **Reveal** and copy it. Keep it private (like a password).

3. **Add the key to Vercel**  
   - In Vercel, open your project (your Grammar Spy deployment).  
   - Go to **Settings** → **Environment Variables**.  
   - **Name:** `STRIPE_SECRET_KEY`  
   - **Value:** paste your `sk_...` key.  
   - Choose **Production** (and optionally Preview if you want it on preview URLs too).  
   - Click **Save**.

4. **Redeploy once**  
   - Go to the **Deployments** tab.  
   - Open the **⋯** menu on the latest deployment → **Redeploy**.  
   - After it finishes, the `/api/verify-session` endpoint will use Stripe. When a customer pays via Stripe Checkout and returns to your pricing page with `?checkout=success&session_id=...`, the site will be able to confirm payment and unlock “paid” on their account.

If you haven’t set up Stripe Checkout links yet, the site still works; the verify step will just return “not paid” until you connect Stripe and add the key above.

---

## Part 4: Add your own domain later (optional)

When you buy a domain (e.g. grammarspy.com):

1. In Vercel, open your project → **Settings** → **Domains**.  
2. Enter your domain (e.g. `grammarspy.com`) and follow the instructions.  
3. In your domain registrar’s panel, add the DNS records Vercel shows (usually one or two A or CNAME records).  
4. After DNS updates (often 5–60 minutes), your site will be live on your domain. No code changes needed.

---

## Quick checklist

- [ ] Code is on GitHub (Part 1).  
- [ ] Project is imported and deployed on Vercel (Part 2).  
- [ ] Site opens at `yoursite.vercel.app` and missions work.  
- [ ] (Optional) Stripe secret key added in Vercel env vars and project redeployed (Part 3).  
- [ ] (Optional) Custom domain added in Vercel and DNS set (Part 4).

If something doesn’t match (e.g. different buttons or menu names), the same ideas apply: get code on GitHub, connect that repo to Vercel, add `STRIPE_SECRET_KEY` when you’re ready for payments, and add the domain when you have one.
