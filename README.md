# 📄 InvoiceGen - Open Source Invoice Management System

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![GitHub stars](https://img.shields.io/github/stars/hetref/invoicegen.svg?style=social)](https://github.com/hetref/invoicegen)
[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/hetref/invoicegen)

**InvoiceGen** is a powerful, open-source invoice management platform that simplifies how businesses handle their invoicing workflows. Upload, create, organize, extract data with AI, and share invoices effortlessly—all in one place.

> 🚀 **Self-hostable** • 🤖 **AI-powered** • 📧 **Email integration** • 📁 **File organization** • 🔒 **Privacy-focused**

---

## ✨ Key Features

### 📤 **Smart Invoice Upload**
- **Drag & Drop Interface** - Intuitive file upload with visual feedback
- **Multiple Format Support** - PDF, PNG, JPG, JPEG, and WebP files
- **Cloud Storage** - Secure storage powered by Cloudflare R2
- **Instant Preview** - View invoices immediately after upload
- **File Size Validation** - Automatic checks to ensure optimal performance

### 🤖 **AI-Powered Data Extraction**
- **Automatic Data Extraction** - Extract invoice details using Google's Gemini AI
- **Smart Field Recognition** - Automatically identifies:
  - Invoice number and date
  - Billing and vendor information
  - Line items with prices and quantities
  - Payment details (account, IFSC, UPI)
  - Contact information
  - Total amounts and currency
- **Background Processing** - AI extraction runs without blocking your workflow
- **Email Notifications** - Get notified when extraction is complete
- **Free & Unlimited Options** - One free extraction, or unlimited with your own API key
- **Custom AI Integration** - Add your personal Gemini API key for unlimited extractions

### ✏️ **Manual Invoice Creation**
- **Professional Templates** - Create beautiful invoices with a clean, business-focused design
- **Dynamic Item Management** - Add unlimited line items with automatic calculations
- **Real-time Preview** - See your invoice as you build it
- **A4 Print-Ready** - Perfect formatting for printing and PDF export
- **Auto PDF Generation** - Invoices automatically saved as PDFs
- **Edit Anytime** - Full editing capabilities for manually created invoices
- **Smart Pagination** - Automatically handles multi-page invoices

### 📁 **Advanced Organization**
- **Nested Folder Structure** - Organize invoices like Google Drive
- **Unlimited Groups** - Create folders within folders for perfect organization
- **Drag & Move** - Easily move invoices between groups
- **Smart Breadcrumbs** - Always know where you are in your folder structure
- **Folder Management** - Create, rename, and delete folders with ease
- **Invoice Count Display** - See how many invoices are in each folder at a glance
- **Safe Deletion** - Choose to move or permanently delete invoices when removing folders

### 📊 **Comprehensive Dashboard**
- **At-a-Glance Statistics** - View total invoices, storage usage, and activity
- **Group Navigation** - Browse your organized folder structure
- **Quick Actions** - Upload, create, or manage invoices from anywhere
- **Real-time Updates** - Invoice counts update automatically
- **Responsive Design** - Works beautifully on desktop, tablet, and mobile

### 📧 **Email Invoice Sharing**
- **Send via Email** - Share invoices directly from the platform
- **Custom Headers** - Professional sender names and reply-to addresses
- **Email Preview** - Real-time preview of how emails will look in Gmail
- **Custom Messages** - Personalize email subject and body
- **PDF Attachments** - Invoices sent professional PDF files
- **Right-Click Menu** - Quick access to send options from invoice list
- **Custom SMTP Support** - Use your own email server for sending
- **Gmail Integration** - Built-in support for Gmail SMTP

### 🔒 **Storage & Security**
- **40MB Storage Limit** - Generous storage for all your invoices
- **Usage Tracking** - Monitor your storage consumption
- **Secure Authentication** - Powered by Better Auth
- **OAuth Support** - Sign in with Google, GitHub, or email
- **User Isolation** - Each user's data is completely private
- **Presigned URLs** - Secure file uploads and downloads
- **Ownership Verification** - Every action is verified for security

### 👤 **Profile Management**
- **User Information** - View and update your profile details
- **Detailed Statistics** - Track invoices, storage, and activity
- **Monthly Insights** - See invoices created this month
- **AI Settings** - Manage your Gemini API key for unlimited extractions
- **SMTP Configuration** - Add custom email server settings with header customization
- **Account Information** - View login method and member since date

### 🎯 **Smart Context Menu**
Right-click on any invoice to:
- View full details
- Quick preview
- Download to your device
- Send via email
- Move to a different folder
- Delete permanently

### 📱 **Modern User Experience**
- **Smooth Animations** - Polished interactions throughout
- **Loading States** - Clear feedback for all actions
- **Toast Notifications** - Instant success and error messages
- **Responsive Tables** - Perfect on any screen size
- **Keyboard Shortcuts** - Power user features
- **Dark Mode Ready** - Theme support built-in

### 🔍 **Invoice Details Page**
- **Side-by-Side View** - PDF/image on left, extracted data on right
- **Folder Navigation** - Browse other folders without leaving the page
- **Action Buttons** - Download, edit, or extract with one click
- **Extracted Data Display** - Beautiful cards showing all invoice information
- **Status Indicators** - See extraction status at a glance
- **Edit Support** - Modify manually created invoices

### 💾 **Data Persistence**
- **PostgreSQL Database** - Reliable, scalable data storage
- **Cloudflare R2** - Fast, global file storage
- **Structured Storage** - Organized by user ID and invoice ID
- **Automatic Cleanup** - Files deleted when invoices are removed
- **Local Preferences** - API keys and SMTP settings stored locally

---

## 🚀 Quick Start

### 📥 Installation

```bash
# Clone the repository
git clone https://github.com/hetref/invoicegen.git
cd invoicegen

# Install dependencies
npm install

# Set up environment
cp .env.example .env
# Edit .env with your configuration

# Run database migrations
npx prisma migrate deploy
npx prisma generate

# Start development server
npm run dev
```

### 🔧 Environment Configuration

Create a `.env` file with your settings:

```env
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/invoicegen"

# Storage (Cloudflare R2 or AWS S3)
CLOUDFLARE_R2_ACCESS_KEY_ID="your_access_key"
CLOUDFLARE_R2_SECRET_ACCESS_KEY="your_secret_key"
CLOUDFLARE_R2_BUCKET_NAME="invoices"
CLOUDFLARE_R2_ACCOUNT_ID="your_account_id"
CLOUDFLARE_R2_ENDPOINT="https://your-account.r2.cloudflarestorage.com"

# AI Features (Optional - provides 1 free extraction per user)
GEMINI_API_KEY="your_gemini_api_key"

# Email Features (Optional)
GMAIL_EMAIL="your-email@gmail.com"
GMAIL_APP_PASSWORD="your_app_password"

# Authentication
BETTER_AUTH_SECRET="your_random_secret_key_here"
BETTER_AUTH_URL="http://localhost:3000"
```

Visit `http://localhost:3000` and start managing your invoices!

### ⚡ One-Click Deploy

Deploy instantly to Vercel:

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/hetref/invoicegen)

---

## 📋 Feature Breakdown

### Storage Management
- **Total Limit**: 40MB per user
- **Smart Validation**: Checks before upload and creation
- **Real-time Tracking**: See usage in your profile
- **Efficient Storage**: Only stores necessary data

### AI Extraction
- **Free Tier**: 1 extraction per user
- **Unlimited**: Add your own Gemini API key
- **Smart Detection**: Extracts all invoice fields automatically
- **Error Handling**: Clear messages for any issues
- **Model Display**: See which AI model is being used

### Invoice Creation
- **Professional Design**: Clean, business-appropriate templates
- **Dynamic Forms**: Add/remove items as needed
- **Automatic Calculations**: Totals computed in real-time
- **PDF Export**: High-quality A4 PDFs generated automatically
- **Edit History**: Modify invoices after creation

### Email Features
- **Flexible SMTP**: Use Gmail or your own server
- **Custom Templates**: Personalize subject and message
- **Attachment Support**: Invoices sent as PDFs
- **Send from List**: Quick access from invoice table
- **Context Menu**: Right-click to send

---

## 🛠️ Technology Stack

- **Frontend**: Next.js 15, React, TypeScript
- **UI Components**: Shadcn UI, Tailwind CSS
- **Database**: PostgreSQL with Prisma ORM
- **Storage**: Cloudflare R2 (S3-compatible)
- **Authentication**: Better Auth (OAuth + Email)
- **AI**: Google Gemini API
- **Email**: Nodemailer with multiple SMTP providers
- **PDF Generation**: jsPDF with html2canvas
- **Deployment**: Docker-ready, Vercel-compatible

### Why These Technologies?

- **🚀 Modern**: Built with latest stable technologies
- **🌐 Universal**: Works on any cloud provider or server
- **🔧 Self-hostable**: No vendor lock-in or recurring costs
- **📱 Responsive**: Works on desktop, tablet, and mobile
- **⚡ Fast**: Optimized for performance and SEO
- **🔒 Secure**: Enterprise-grade security practices

---

## 📊 Use Cases

### For Freelancers
- Create professional invoices instantly
- Organize by client or project
- Send invoices directly to clients
- Track all invoices in one place

### For Small Businesses
- Manage invoices from multiple vendors
- Extract data automatically from received invoices
- Organize by department or category
- Share invoices with team members

### For Accountants
- Upload client invoices
- Auto-extract data for bookkeeping
- Organize by client folders
- Generate reports from stored data

### For Consultants
- Create invoices on the go
- Professional templates included
- Email directly to clients
- Track sent invoices

---

## 🎨 Design Philosophy

**InvoiceGen** is built with user experience at its core:

- **Simplicity First** - Clean, uncluttered interface
- **Speed Matters** - Optimized for fast performance
- **Professional Look** - Business-appropriate design
- **Mobile Ready** - Works on all devices
- **Accessibility** - Built with ARIA standards
- **Consistency** - Uniform design language throughout

---

## 🔐 Security Features

- **Secure Authentication** - OAuth and credential-based login
- **Data Isolation** - Complete user data separation
- **Presigned URLs** - Time-limited, secure file access
- **Ownership Checks** - All operations verify user permissions
- **Local Storage** - Sensitive keys stored client-side only
- **Encrypted Passwords** - Secure password hashing
- **HTTPS Only** - Secure communication

---

## 📈 Scalability

InvoiceGen is designed to scale:

- **Efficient Database Queries** - Optimized with indexes
- **Cloud Storage** - R2 handles unlimited files
- **Serverless Ready** - Deploy to Vercel
- **Background Jobs** - AI extraction doesn't block UI
- **Lazy Loading** - Only load what's needed
- **Pagination Support** - Handle thousands of invoices

---

## 🌟 Roadmap

Community-driven development roadmap:

- **🎨 Template Library** - Pre-built invoice templates
- **📊 Bulk Operations** - Mass invoice processing
- **🔌 REST API** - Full programmatic access
- **👥 Team Collaboration** - Multi-user workspaces
- **📈 Advanced Analytics** - Business intelligence dashboards
- **🧾 Accounting Integration** - Export to QuickBooks, Xero
- **📱 Mobile Apps** - iOS & Android applications
- **⏰ Invoice Reminders** - Automatic payment follow-ups
- **💳 Payment Tracking** - Payment status and history
- **🌍 Multi-language** - Internationalization support
- **📄 OCR Integration** - Additional AI providers
- **🗂️ Bulk Import** - CSV/Excel invoice import

---

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 🤝 Contributing

We welcome contributions from the community! Here's how you can help:

### 🐛 Reporting Bugs
- Use GitHub Issues to report bugs
- Include steps to reproduce the issue
- Provide system information and error messages

### ✨ Feature Requests
- Open GitHub Issues with feature ideas
- Explain the use case and expected behavior
- Help others vote on your ideas with 👍

### 🔧 Development Contributions
1. **Fork the repository**
2. **Create a feature branch**: `git checkout -b feature/amazing-feature`
3. **Commit your changes**: `git commit -m 'Add some amazing feature'`
4. **Push to the branch**: `git push origin feature/amazing-feature`
5. **Open a Pull Request**

### 📖 Documentation
- Help improve our README
- Add code comments and documentation
- Create examples and tutorials

### 💡 Ideas & Discussion
- Join discussions in GitHub Issues
- Share your use cases and ideas
- Help prioritize features

---

## 🏠 Self-Hosting Guide

InvoiceGen is designed to be easily self-hosted. Perfect for:
- **Small Businesses** wanting control over their data
- **Developers** wanting to customize features
- **Teams** needing offline invoice management
- **Privacy-conscious** organizations

### Requirements
- Node.js 18+
- PostgreSQL database
- Cloudflare R2 or AWS S3-compatible storage
- Domain name (optional)

### Quick Self-Host Setup

1. **Clone the repository**
   ```bash
   git clone https://github.com/hetref/invoicegen.git
   cd invoicegen
   ```

2. **Environment Configuration**
   ```bash
   cp .env.example .env
   # Edit .env with your settings
   ```

3. **Database Setup**
   ```bash
   npm install
   npx prisma migrate deploy
   ```

4. **Start the Application**
   ```bash
   npm run build
   npm start
   ```

### 🐳 Docker Deployment

We provide Docker configurations for easy deployment:

```bash
# Using Docker Compose
docker-compose up -d

# Using Docker directly
docker build -t invoicegen .
docker run -p 3000:3000 invoicegen
```

### 🌐 Cloud Deployment

Deploy to popular platforms:
- **Vercel**: One-click deployment
- **Railway**: Full-stack hosting
- **DigitalOcean**: App Platform
- **AWS**: EC2 or ECS
- **Google Cloud**: Cloud Run

---

## 🤝 Support & Community

- 🐛 **Bug Reports**: [GitHub Issues](https://github.com/hetref/invoicegen/issues)
- 💡 **Feature Requests**: [GitHub Discussions](https://github.com/hetref/invoicegen/discussions)
- 📖 **Documentation**: [Project Wiki](https://github.com/hetref/invoicegen/wiki)
- 💬 **Community**: [GitHub Discussions](https://github.com/hetref/invoicegen/discussions)

Have questions? Want to contribute? We'd love to hear from you!

---

## 🎉 Get Started Today!

InvoiceGen makes invoice management effortless. Whether you're uploading existing invoices, creating new ones from scratch, or extracting data with AI, everything you need is at your fingertips.

**Start managing your invoices smarter, not harder.**

---

<div align="center">
  <p>Made with ❤️ by the InvoiceGen Community</p>
  <p>Open source • Self-hostable • Privacy-first</p>
  <p>:star: Star us on GitHub if you find this project helpful!</p>
</div>

