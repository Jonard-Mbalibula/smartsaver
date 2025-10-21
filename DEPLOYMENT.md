# SmartSaver Deployment Guide

## 🚀 Deploy to Vercel (Recommended)

### Prerequisites
1. GitHub account
2. Vercel account (free at vercel.com)
3. Your SmartSaver project pushed to GitHub

### Step 1: Prepare Your Repository
```bash
# Initialize git if not already done
git init
git add .
git commit -m "Initial commit - SmartSaver ready for deployment"

# Push to GitHub
git remote add origin https://github.com/YOUR_USERNAME/smartsaver.git
git push -u origin main
```

### Step 2: Deploy to Vercel
1. Go to [vercel.com](https://vercel.com) and sign in
2. Click "New Project"
3. Import your GitHub repository
4. Vercel will automatically detect the configuration

### Step 3: Configure Environment Variables
In your Vercel dashboard:
1. Go to Project Settings → Environment Variables
2. Add these variables:
   - `JWT_SECRET`: Generate a strong secret (e.g., use `openssl rand -base64 32`)
   - `POSTGRES_URL`: Vercel will provide this automatically when you add a database

### Step 4: Add PostgreSQL Database
1. In Vercel dashboard, go to Storage tab
2. Click "Create Database" → "Postgres"
3. Choose the free tier
4. Vercel will automatically set `POSTGRES_URL` environment variable

### Step 5: Initialize Database
1. Go to your Vercel project dashboard
2. Click on the "Storage" tab
3. Click on your PostgreSQL database
4. Go to "Query" tab
5. Copy and paste the contents of `schema-postgres.sql`
6. Click "Run" to create tables

### Step 6: Deploy
1. Vercel will automatically deploy when you push to GitHub
2. Your app will be available at: `https://your-project-name.vercel.app`

## 🔑 Default Login Credentials
- **Email**: mbalibulajonard@gmail.com
- **Password**: Mbalibula@20

## 📱 Access Your App
Once deployed, you can access your SmartSaver application at your Vercel URL. The app includes:
- ✅ Member management
- ✅ Contribution tracking
- ✅ Loan management
- ✅ Repayment tracking
- ✅ Financial reports
- ✅ Settings management

## 🔧 Local Development
To run locally with PostgreSQL:
```bash
# Install dependencies
npm install
cd frontend && npm install

# Set up environment variables
cp env.example .env.local
# Edit .env.local with your local PostgreSQL URL

# Run the application
npm run dev
```

## 📊 Features Included
- **Dashboard**: Overview of all financial data
- **Members**: Add and manage members
- **Contributions**: Record member contributions
- **Loans**: Request, approve/reject, and track loans
- **Repayments**: Record loan repayments
- **Reports**: Generate financial summaries
- **Settings**: Configure interest rates
- **Authentication**: Secure login system

## 🆓 Free Tier Limits
- **Vercel**: 100GB bandwidth, unlimited deployments
- **PostgreSQL**: 1GB storage, 1 billion row reads
- **Custom Domain**: Free SSL certificate included

## 🎯 Next Steps
1. Set up your custom domain (optional)
2. Configure backup strategies
3. Set up monitoring and analytics
4. Add more features as needed

Your SmartSaver application is now live and ready to use! 🎉
