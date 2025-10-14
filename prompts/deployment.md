# Deployment Guide: Vercel + Neon Database

This guide walks you through deploying the Solace Advocate Search application to Vercel with a Neon PostgreSQL database.

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Deploy to Vercel](#deploy-to-vercel)
3. [Provision Neon Database via Vercel](#provision-neon-database-via-vercel)
4. [Run Database Migrations](#run-database-migrations)
5. [Seed the Database](#seed-the-database)
6. [Verify Deployment](#verify-deployment)
7. [Troubleshooting](#troubleshooting)
8. [Optional: CLI Deployment](#optional-cli-deployment)

---

## Prerequisites

Before you begin, ensure you have:

- [x] A GitHub, GitLab, or Bitbucket account
- [x] Your project code pushed to a Git repository
- [x] A Vercel account (sign up at [vercel.com](https://vercel.com))
- [x] All changes committed and pushed to your `main` branch

---

## 1. Deploy to Vercel

### Step 1.1: Push Your Code to Git

If you haven't already, push your code to a Git repository:

```bash
# Initialize git if needed
git init

# Add all files
git add .

# Commit your changes
git commit -m "Ready for deployment"

# Add your remote repository (replace with your repo URL)
git remote add origin https://github.com/yourusername/solace-advocate-search.git

# Push to main branch
git push -u origin main
```

### Step 1.2: Import Project to Vercel

1. Go to [vercel.com](https://vercel.com) and sign in
2. Click **"Add New..."** → **"Project"**
3. **Import your Git repository:**
   - If this is your first time, click **"Connect Git Provider"** and authorize Vercel to access your repositories
   - Find your repository in the list and click **"Import"**

### Step 1.3: Configure Project Settings

On the "Configure Project" screen:

1. **Project Name**: Leave as-is or customize (e.g., `solace-advocate-search`)
2. **Framework Preset**: Should auto-detect as **Next.js** ✅
3. **Root Directory**: Leave as `./` (default)
4. **Build Command**: Leave as `next build` (default)
5. **Output Directory**: Leave as `.next` (default)
6. **Install Command**: Leave as default

### Step 1.4: Environment Variables (Skip for Now)

- **Do NOT add environment variables yet**
- We'll add `DATABASE_URL` automatically through the Neon integration in the next step
- Click **"Deploy"** to start the initial deployment

### Step 1.5: Wait for Initial Build

- Vercel will build and deploy your application
- **Note**: The first deployment may fail or have issues connecting to the database - this is expected
- We'll fix this by adding the database in the next step

---

## 2. Provision Neon Database via Vercel

Now that your project is deployed to Vercel, let's add a Neon database through Vercel's marketplace integration.

### Step 2.1: Open Your Project Dashboard

1. From the deployment success screen, click **"Go to Dashboard"** or
2. Navigate to your project at `https://vercel.com/[your-username]/[project-name]`

### Step 2.2: Navigate to Storage Tab

1. In your project dashboard, click the **"Storage"** tab in the top navigation
2. Click **"Connect Database"** or **"Create Database"**

### Step 2.3: Select Neon Postgres

1. In the storage integrations marketplace, find **"Neon Postgres"**
2. Click on the Neon Postgres card
3. Click **"Add Integration"** or **"Connect"**

### Step 2.4: Install Neon Integration

You'll see two options:

**Option A: Create New Neon Account (Recommended for new users)**
1. Select **"Create New Neon Account"**
2. This will:
   - Create a Neon account automatically
   - Provision a new Postgres database
   - Connect it to your Vercel project
   - Inject environment variables automatically

**Option B: Link Existing Neon Account (If you already have Neon)**
1. Select **"Link Existing Neon Account"**
2. Authenticate with your Neon credentials
3. Select an existing Neon project and database
4. Choose the role to use for connections

### Step 2.5: Configure Integration Settings

1. **Select Vercel Scope**: Choose your personal account or team
2. **Select Projects**: Choose which Vercel projects can access this database
   - Select your `solace-advocate-search` project
3. **Database Configuration**:
   - **Region**: Choose the region closest to your users (e.g., `us-east-1`, `eu-central-1`)
   - **Neon Project Name**: Leave default or customize
   - **Database Name**: Leave as `neondb` (default)
4. Click **"Create Database"** or **"Continue"**

### Step 2.6: Verify Environment Variables

The integration will automatically add these environment variables to your Vercel project:

- `DATABASE_URL` - Main connection string (what our app uses)
- `POSTGRES_URL` - Alternative connection string
- `POSTGRES_PRISMA_URL` - Pooled connection (if using Prisma)
- `POSTGRES_URL_NON_POOLED` - Direct connection

To verify:
1. Go to **Settings** → **Environment Variables** in your Vercel dashboard
2. You should see `DATABASE_URL` listed with a value starting with `postgresql://`
3. ✅ If you see it, the integration worked!

### Step 2.7: Enable Preview Branch Databases (Optional but Recommended)

Neon's integration can create isolated database branches for preview deployments:

1. In the Neon integration settings (or Neon Console)
2. Enable **"Create preview branches for pull requests"**
3. This creates a separate database copy for each PR/preview deployment
4. Helps prevent preview deployments from affecting production data

---

## 3. Run Database Migrations

Now we need to create the database schema on our production database.

### Step 3.1: Get Your Database Connection String

**Option A: From Vercel Dashboard (Recommended)**
1. Go to **Settings** → **Environment Variables**
2. Find `DATABASE_URL`
3. Click **"Show"** to reveal the value
4. Copy the full connection string (should look like: `postgresql://username:password@host.neon.tech/neondb?sslmode=require`)

**Option B: From Neon Console**
1. Go to [console.neon.tech](https://console.neon.tech)
2. Select your project
3. Copy the connection string from the dashboard

### Step 3.2: Run Migrations Locally Against Production Database

We'll use Drizzle Kit to push our schema to the production database:

```bash
# Set the DATABASE_URL temporarily in your terminal
export DATABASE_URL="your-connection-string-here"

# Generate migration files (if not already generated)
npm run generate

# Push schema to database (creates tables and indexes)
npx drizzle-kit push
```

**Alternative: Using migrate script**
```bash
# Set DATABASE_URL environment variable
export DATABASE_URL="your-connection-string-here"

# Run migration
npm run migrate:up
```

### Step 3.3: Verify Tables Were Created

You can verify the tables were created using:

**Option A: Neon Console**
1. Go to [console.neon.tech](https://console.neon.tech)
2. Navigate to **Tables** in your project
3. You should see the `advocates` table listed

**Option B: Using psql or Database Client**
```bash
# Connect to database
psql "your-connection-string-here"

# List tables
\dt

# Describe advocates table
\d advocates

# Should show columns: id, first_name, last_name, city, degree, specialties, years_of_experience, phone_number, created_at
```

---

## 4. Seed the Database

Now let's populate the database with advocate data.

### Step 4.1: Option A - Use the Seed API Endpoint (Recommended)

Once your application is deployed and database is set up:

```bash
# Get your deployment URL from Vercel dashboard
# Should be something like: https://solace-advocate-search.vercel.app

# Call the seed endpoint
curl -X POST https://your-app-name.vercel.app/api/seed
```

This will:
- Insert the base advocate data (17 records)
- Generate 1,000 random advocates using Faker.js
- Return a JSON response with all created records

### Step 4.2: Option B - Seed Locally Against Production Database

```bash
# Set DATABASE_URL in your environment
export DATABASE_URL="your-connection-string-here"

# Run the seed script
npm run seed
```

### Step 4.3: Verify Data Was Seeded

Check that data was inserted:

```bash
# Using curl to check the API
curl https://your-app-name.vercel.app/api/advocates

# Or visit in browser
# https://your-app-name.vercel.app/api/advocates
```

You should see a JSON response with:
```json
{
  "data": [...],
  "pagination": {
    "page": 1,
    "limit": 25,
    "total": 1015,
    "totalPages": 41
  }
}
```

---

## 5. Verify Deployment

### Step 5.1: Redeploy (if needed)

If your initial deployment failed before adding the database:

1. Go to your Vercel project dashboard
2. Click **"Deployments"** tab
3. Click **"Redeploy"** on the latest deployment
4. This will rebuild with the new `DATABASE_URL` environment variable

### Step 5.2: Test the Application

Visit your deployed application at: `https://your-app-name.vercel.app`

**Test these features:**
- ✅ Page loads without errors
- ✅ Advocate cards are displayed
- ✅ Search functionality works (try searching for a name or city)
- ✅ Filter by specialties works
- ✅ Filter by degree works (PhD, MD, MSW)
- ✅ Filter by experience slider works
- ✅ Pagination controls work (Next/Previous, page size)
- ✅ Click on advocate card opens profile dialog
- ✅ Mobile responsive design works

### Step 5.3: Check Build Logs (If Issues Occur)

If you encounter errors:

1. Go to **Deployments** tab in Vercel
2. Click on the latest deployment
3. Check **Build Logs** for errors
4. Check **Runtime Logs** for API errors

Common issues:
- `DATABASE_URL is not defined` → Environment variable not set (go back to Step 2)
- `relation "advocates" does not exist` → Migrations not run (go back to Step 3)
- `Failed to fetch advocates` → Check runtime logs for database connection errors

---

## 6. Set Up Automatic Deployments

Vercel automatically deploys your application when you push to Git:

### Production Deployments
- **Main branch** (`main` or `master`) automatically deploys to production
- URL: `https://your-app-name.vercel.app`
- Uses production environment variables

### Preview Deployments
- **Feature branches** and **Pull Requests** create preview deployments
- URL: `https://your-app-name-[branch-name].vercel.app`
- If you enabled Neon preview branches, each preview gets its own isolated database

### Workflow
```bash
# Create a feature branch
git checkout -b feature/new-filter

# Make changes and commit
git add .
git commit -m "Add new filter feature"

# Push to GitHub
git push origin feature/new-filter

# Vercel automatically creates a preview deployment
# You'll see a comment in your PR with the preview URL
```

---

## 7. Troubleshooting

### Issue: "DATABASE_URL is not defined"

**Solution:**
1. Go to **Settings** → **Environment Variables**
2. Verify `DATABASE_URL` exists
3. If not, go back to [Step 2](#2-provision-neon-database-via-vercel)
4. After adding, redeploy your application

### Issue: "relation 'advocates' does not exist"

**Solution:**
1. Database schema not created yet
2. Follow [Step 3](#3-run-database-migrations) to run migrations
3. Verify tables exist in Neon Console

### Issue: "Connection timeout" or "Unable to connect to database"

**Solutions:**
- **Check Neon database is active**: Go to Neon Console, verify project is not suspended
- **Check connection string**: Ensure `DATABASE_URL` includes `?sslmode=require`
- **Check region**: Ensure Neon region is close to your Vercel deployment region
- **Verify SSL**: Neon requires SSL connections

### Issue: No data showing in the application

**Solution:**
1. Check if database is seeded (see [Step 4](#4-seed-the-database))
2. Call the seed API endpoint: `curl -X POST https://your-app.vercel.app/api/seed`
3. Verify data exists: `curl https://your-app.vercel.app/api/advocates`

### Issue: "Error: connect ETIMEDOUT"

**Solution:**
- Neon requires SSL connections
- Ensure your connection string includes `?sslmode=require`
- Update `DATABASE_URL` in Vercel environment variables if needed:
  ```
  postgresql://user:password@host.neon.tech/db?sslmode=require
  ```

### Issue: Preview deployments using production database

**Solution:**
1. Enable Neon preview branch feature
2. In Neon Console → Integration Settings
3. Enable "Create preview branches for pull requests"
4. This isolates preview environments from production data

---

## 8. Optional: CLI Deployment

If you prefer using the CLI instead of the Vercel dashboard:

### Step 8.1: Install Vercel CLI

```bash
npm i -g vercel
```

### Step 8.2: Login to Vercel

```bash
vercel login
```

### Step 8.3: Deploy

```bash
# Deploy to preview environment
vercel

# Deploy to production
vercel --prod
```

### Step 8.4: Set Environment Variables via CLI

```bash
# Add environment variable to production
vercel env add DATABASE_URL production

# You'll be prompted to paste the value
# Paste your Neon connection string
```

### Step 8.5: Pull Environment Variables Locally (Optional)

```bash
# Download production environment variables to .env.local
vercel env pull .env.local
```

---

## Post-Deployment Checklist

- [ ] Application is deployed and accessible at Vercel URL
- [ ] Neon database is provisioned and connected
- [ ] `DATABASE_URL` environment variable is set
- [ ] Database migrations have been run (`advocates` table exists)
- [ ] Database is seeded with advocate data (1,000+ records)
- [ ] Search functionality works
- [ ] Filter functionality works (specialties, degree, experience)
- [ ] Pagination works
- [ ] Mobile responsive design works
- [ ] No errors in Vercel runtime logs
- [ ] Git push triggers automatic deployments
- [ ] (Optional) Preview branch databases are enabled

---

## Next Steps

### Custom Domain (Optional)

1. Go to **Settings** → **Domains** in Vercel
2. Add your custom domain (e.g., `advocates.solace.com`)
3. Follow DNS configuration instructions
4. Vercel automatically provisions SSL certificates

### Monitoring

1. Use Vercel **Analytics** to monitor performance
2. Check **Logs** for runtime errors
3. Use Neon Console to monitor database queries and performance

### Scaling

- **Vercel**: Automatically scales based on traffic
- **Neon**:
  - Autoscales compute based on load
  - Scale-to-zero when inactive (free tier)
  - Upgrade plan for higher limits

### Database Backups

Neon automatically handles backups:
- **Point-in-time recovery**: Restore to any point in the last 7 days (paid plans)
- **Automatic backups**: Daily backups on paid plans
- View backups in Neon Console → Backups

---

## Support Resources

- **Vercel Docs**: [vercel.com/docs](https://vercel.com/docs)
- **Neon Docs**: [neon.com/docs](https://neon.com/docs)
- **Vercel Support**: [vercel.com/support](https://vercel.com/support)
- **Neon Discord**: [neon.tech/discord](https://neon.tech/discord)

---

**Congratulations! Your application is now deployed to production! 🎉**

Visit your live application at: `https://your-app-name.vercel.app`
