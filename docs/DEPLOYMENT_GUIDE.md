# Production Deployment Guide

## Option 1: Vercel (Recommended) 🚀

### Why Vercel?
- **Perfect for React/Vite apps**
- **Free tier with custom domains**
- **Automatic deployments from GitHub**
- **Global CDN for fast loading**
- **Built-in SSL certificates**

### Step 1: Prepare Your App for Production

1. **Build your app locally to test:**
   ```bash
   npm run build
   npm run preview
   ```

2. **Update Firebase Security Rules** (Important!)
   - Go to Firebase Console → Firestore Database → Rules
   - Replace the rules with:
   ```javascript
   rules_version = '2';
   service cloud.firestore {
     match /databases/{database}/documents {
       // Users can only access their own data
       match /users/{userId} {
         allow read, write: if request.auth != null && request.auth.uid == userId;
       }
       
       match /userProgress/{userId} {
         allow read, write: if request.auth != null && request.auth.uid == userId;
       }
       
       match /userSettings/{userId} {
         allow read, write: if request.auth != null && request.auth.uid == userId;
       }
     }
   }
   ```
   - Click "Publish"

### Step 2: Set Up GitHub Repository

1. **Create a new repository on GitHub:**
   - Go to [github.com](https://github.com) and create new repo
   - Name it `hsk1-flashcards` (or your preferred name)
   - Keep it public or private (your choice)

2. **Push your code to GitHub:**
   ```bash
   git init
   git add .
   git commit -m "Initial commit - HSK1 Flashcards App"
   git branch -M main
   git remote add origin https://github.com/YOUR_USERNAME/hsk1-flashcards.git
   git push -u origin main
   ```

### Step 3: Deploy to Vercel

1. **Sign up for Vercel:**
   - Go to [vercel.com](https://vercel.com)
   - Sign up with GitHub account

2. **Import your project:**
   - Click "New Project"
   - Import your GitHub repository
   - Vercel will auto-detect it's a Vite app

3. **Configure deployment:**
   - **Framework Preset:** Vite
   - **Build Command:** `npm run build`
   - **Output Directory:** `dist`
   - **Install Command:** `npm install`

4. **Deploy:**
   - Click "Deploy"
   - Wait 2-3 minutes for deployment

### Step 4: Add Custom Domain

1. **Buy a domain (if you don't have one):**
   - **Recommended registrars:**
     - [Namecheap](https://namecheap.com) - Good prices, easy setup
     - [Cloudflare](https://www.cloudflare.com/products/registrar/) - Best prices, excellent features
     - [Google Domains](https://domains.google.com) - Simple, reliable

   - **Suggested domain names:**
     - `hsk1flashcards.com`
     - `learnhsk1.com`
     - `chineseflashcards.app`
     - `hsk1master.com`

2. **Add domain to Vercel:**
   - In your Vercel project dashboard
   - Go to "Settings" → "Domains"
   - Add your domain (e.g., `hsk1flashcards.com`)
   - Add www subdomain too (`www.hsk1flashcards.com`)

3. **Configure DNS:**
   - In your domain registrar's control panel
   - Add these DNS records:
     ```
     Type: A
     Name: @
     Value: 76.76.19.61
     
     Type: CNAME
     Name: www
     Value: cname.vercel-dns.com
     ```

4. **Wait for propagation:**
   - DNS changes take 5-60 minutes
   - Vercel will automatically issue SSL certificate

### Step 5: Update Firebase Settings

1. **Add your domain to Firebase:**
   - Firebase Console → Authentication → Settings
   - Add your custom domain to "Authorized domains"
   - Add both: `hsk1flashcards.com` and `www.hsk1flashcards.com`

---

## Option 2: Netlify (Alternative) 🌐

### Quick Netlify Deployment:

1. **Build your app:**
   ```bash
   npm run build
   ```

2. **Deploy to Netlify:**
   - Go to [netlify.com](https://netlify.com)
   - Drag & drop your `dist` folder
   - Or connect GitHub for automatic deployments

3. **Add custom domain:**
   - Similar process to Vercel
   - DNS records will be different (Netlify provides them)

---

## Option 3: Firebase Hosting 🔥

### Firebase Hosting Steps:

1. **Install Firebase CLI:**
   ```bash
   npm install -g firebase-tools
   ```

2. **Initialize hosting:**
   ```bash
   firebase login
   firebase init hosting
   ```

3. **Configure:**
   - Select your Firebase project
   - Set public directory to `dist`
   - Configure as SPA: Yes
   - Build: `npm run build`

4. **Deploy:**
   ```bash
   npm run build
   firebase deploy
   ```

---

## Recommended Approach: Vercel + Custom Domain

**Total cost:** $10-15/year for domain + $0 for hosting

**Timeline:** 
- GitHub setup: 5 minutes
- Vercel deployment: 5 minutes  
- Domain purchase: 5 minutes
- DNS configuration: 5 minutes
- Waiting for DNS: 15-60 minutes

**Result:** Professional app at `yourname.com` with global CDN, SSL, and automatic deployments!

Would you like me to help you with any specific step?
