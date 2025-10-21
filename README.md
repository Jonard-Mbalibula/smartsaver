# SmartSaver - Cooperative Management System

A comprehensive web application for managing cooperative societies, built with React and Node.js, deployed on Vercel.

## 🌟 Features

- **Member Management**: Add, view, and manage cooperative members
- **Contribution Tracking**: Record and monitor member contributions
- **Loan Management**: Handle loan requests, approvals, and tracking
- **Repayment System**: Track loan repayments and balances
- **Financial Reports**: Generate comprehensive financial summaries
- **Settings Management**: Configure interest rates and system parameters
- **Secure Authentication**: JWT-based authentication system

## 🚀 Quick Start

### Option 1: Deploy to Vercel (Recommended)
1. Fork this repository
2. Go to [vercel.com](https://vercel.com) and import your fork
3. Add PostgreSQL database in Vercel dashboard
4. Run the SQL schema from `schema-postgres.sql`
5. Your app will be live at `https://your-project.vercel.app`

### Option 2: Local Development
```bash
# Clone the repository
git clone https://github.com/YOUR_USERNAME/smartsaver.git
cd smartsaver

# Install dependencies
npm install
cd frontend && npm install

# Set up environment variables
cp env.example .env.local
# Edit .env.local with your database URL

# Start development server
npm run dev
```

## 🔑 Default Login
- **Email**: mbalibulajonard@gmail.com
- **Password**: Mbalibula@20

## 📱 Application Structure

```
smartsaver/
├── api/                 # Vercel API routes
│   └── index.js        # Main API handler
├── frontend/           # React frontend
│   ├── src/
│   │   ├── pages/     # Application pages
│   │   ├── components/ # Reusable components
│   │   └── lib/       # API utilities
│   └── package.json
├── schema-postgres.sql # Database schema
├── vercel.json        # Vercel configuration
└── DEPLOYMENT.md      # Detailed deployment guide
```

## 🛠️ Technology Stack

- **Frontend**: React, Vite, React Router
- **Backend**: Node.js, Express
- **Database**: PostgreSQL
- **Authentication**: JWT
- **Deployment**: Vercel
- **Charts**: Recharts

## 📊 Key Pages

- **Dashboard**: Financial overview and statistics
- **Members**: Member management and profiles
- **Contributions**: Contribution recording and history
- **Loans**: Loan management and approvals
- **Repayments**: Repayment tracking
- **Reports**: Financial reports and exports
- **Settings**: System configuration

## 🔒 Security Features

- JWT-based authentication
- Password hashing with bcrypt
- Role-based access control
- Input validation and sanitization
- CORS protection

## 📈 Free Tier Benefits

- **Vercel**: 100GB bandwidth, unlimited deployments
- **PostgreSQL**: 1GB storage, 1 billion row reads
- **Custom Domain**: Free SSL certificate
- **Automatic Deployments**: From GitHub

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## 📄 License

This project is open source and available under the MIT License.

## 🆘 Support

For issues and questions:
1. Check the [DEPLOYMENT.md](DEPLOYMENT.md) guide
2. Open an issue on GitHub
3. Review the Vercel documentation

---

**Ready to deploy?** Follow the [DEPLOYMENT.md](DEPLOYMENT.md) guide for step-by-step instructions! 🚀