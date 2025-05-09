# SUHBA Archive - Countdown Calendar 🗓️
<div align="center">

![SUHBA Archive Logo](/placeholder.svg?height=150&width=150&query=SUHBA%20Logo)

A responsive public web archive built with Next.js 14, MongoDB, and Supabase.

[![Next.js](https://img.shields.io/badge/Next.js-14-black?style=for-the-badge&logo=next.js)](https://nextjs.org/)
[![MongoDB](https://img.shields.io/badge/MongoDB-4.4-green?style=for-the-badge&logo=mongodb)](https://www.mongodb.com/)
[![Supabase](https://img.shields.io/badge/Supabase-Storage-blue?style=for-the-badge&logo=supabase)](https://supabase.com/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-CSS-38B2AC?style=for-the-badge&logo=tailwind-css)](https://tailwindcss.com/)
</div>

## ✨ Features
<div align="center">

| Feature | Description |
|---------|-------------|
| 📅 **Countdown Calendar** | 300-day countdown with daily status updates |
| 🖼️ **Status Posters** | Daily status posters with HD image support |
| 📰 **News & Events** | News articles and upcoming events management |
| 👥 **User Authentication** | User registration and role-based access control |
| ✍️ **Contribution System** | Content contribution with admin approval workflow |
| 📊 **Admin Dashboard** | Comprehensive admin interface for content management |
| 👤 **Contributor Profiles** | User profiles with contribution badges |
| 📱 **PWA Support** | Progressive Web App for mobile-friendly experience |
| 🌓 **Theme Support** | Light/Dark theme with automatic detection |
| 🔄 **Real-time Updates** | Real-time content updates with cache control |
</div>

## 📸 Screenshots
<div align="center">
  <img src="/placeholder.svg?height=300&width=600&query=SUHBA%20Dashboard" alt="Dashboard" width="80%"/>
  <p><em>Admin Dashboard</em></p>
  
  <br/>
  
  <div style="display: flex; justify-content: space-between;">
    <div style="flex: 1; padding: 5px;">
      <img src="/placeholder.svg?height=200&width=300&query=SUHBA%20Calendar" alt="Calendar" width="100%"/>
      <p><em>Countdown Calendar</em></p>
    </div>
    <div style="flex: 1; padding: 5px;">
      <img src="/placeholder.svg?height=200&width=300&query=SUHBA%20Events" alt="Events" width="100%"/>
      <p><em>Events Page</em></p>
    </div>
  </div>
</div>

## 🛠️ Tech Stack
<div align="center">

| Category | Technologies |
|----------|--------------|
| **Frontend** | Next.js 14 (App Router), React, Tailwind CSS, shadcn/ui |
| **Backend** | Next.js API Routes, Server Actions |
| **Database** | MongoDB (primary database) |
| **Storage** | Supabase Storage (for images and media files) |
| **Authentication** | NextAuth.js |
| **Styling** | Tailwind CSS with shadcn/ui components |
| **Deployment** | Vercel |
</div>

## 🚀 Getting Started
### Prerequisites
- Node.js 18+ and npm/yarn
- MongoDB database
- Supabase project with storage buckets

### Environment Variables
Create a `.env.local` file in the root directory with the following variables:
```
# MongoDB
MONGODB_URI=your_mongodb_connection_string
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
# NextAuth
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your_nextauth_secret
# Admin Setup
ADMIN_SECRET_KEY=your_admin_secret_key
# Revalidation
REVALIDATE_SECRET=your_revalidation_secret
```

### Installation

1. **Clone the repository**

```shellscript
git clone https://github.com/yourusername/suhba-archive.git
cd suhba-archive
```

2. **Install dependencies**

```shellscript
npm install
# or
yarn install
```

3. **Run the development server**

```shellscript
npm run dev
# or
yarn dev
```

4. **Open [http://localhost:3000](http://localhost:3000) in your browser**

## 📂 Project Structure

```plaintext
suhba-archive/
├── app/                    # Next.js App Router
│   ├── admin/              # Admin dashboard pages
│   ├── api/                # API routes
│   ├── calendar/           # Calendar page
│   ├── contribute/         # Contribution page
│   ├── events/             # Events pages
│   ├── login/              # Login page
│   ├── news/               # News pages
│   ├── profile/            # User profile page
│   ├── register/           # Registration page
│   ├── setup/              # Initial setup page
│   ├── status/             # Status pages
│   ├── globals.css         # Global styles
│   ├── layout.tsx          # Root layout
│   └── page.tsx            # Homepage
├── components/             # React components
│   ├── admin-*.tsx         # Admin components
│   ├── ui/                 # UI components (shadcn)
│   └── *.tsx               # Other components
├── lib/                    # Utility functions
│   ├── db/                 # Database functions
│   ├── auth.ts             # Authentication utilities
│   ├── date-utils.ts       # Date utilities
│   ├── mongodb.ts          # MongoDB connection
│   ├── supabase.ts         # Supabase client
│   ├── supabase-admin.ts   # Supabase admin client
│   └── utils.ts            # General utilities
├── public/                 # Static files
├── .env.local              # Environment variables
├── next.config.js          # Next.js configuration
├── package.json            # Dependencies
├── tailwind.config.js      # Tailwind CSS configuration
└── tsconfig.json           # TypeScript configuration
```

## 🔐 Authentication Setup

## 🔧 Initial Setup Guide
When you first deploy the SUHBA Archive application, you'll need to complete an initial setup process to create the admin account and configure the system. Follow these steps to get started:

### Accessing the Setup Page
1. After deploying the application, navigate to the `/setup` URL (e.g., `https://your-domain.com/setup` or `http://localhost:3000/setup` for local development).
2. You'll be presented with the initial setup form if no admin account exists yet.
3. If an admin account already exists, this page will redirect to the login page.

### Required Credentials
To complete the setup, you'll need:
- **Admin Name**: Choose a name for the primary administrator account
- **Admin Email**: Enter a valid email address for the admin account
- **Password**: Create a strong password (minimum 8 characters recommended)
- **Secret Key**: Enter the `ADMIN_SECRET_KEY` value that you configured in your environment variables

> ⚠️ **Important**: The secret key is a security measure to prevent unauthorized admin creation. This should match the `ADMIN_SECRET_KEY` value in your environment variables.

### Step-by-Step Setup Process
1. Fill in all the required fields in the setup form.
2. Click the "Create Admin User" button.
3. If successful, you'll see a confirmation message.
4. You'll be automatically redirected to the login page after a few seconds.
5. Log in with the email and password you just created.

### After Setup Completion
Once you've completed the initial setup:
1. You'll have full access to the admin dashboard at `/admin`.
2. From here, you can:
   - Configure system settings
   - Create and manage content
   - Approve user registrations
   - Upload status posts
   - Manage news and events

### Troubleshooting Setup Issues
If you encounter problems during setup:
- **"Invalid Secret Key" Error**: Ensure the secret key matches the `ADMIN_SECRET_KEY` in your environment variables.
- **Setup Page Not Available**: If you can't access the setup page, an admin account might already exist. Try logging in or check your database.
- **Redirect Loop**: Clear your browser cookies and cache, then try again.
- **Database Connection Error**: Verify your MongoDB connection string in the environment variables.

> 🔒 **Security Note**: After completing the initial setup, the `/setup` page will no longer be accessible as long as an admin account exists in the database. If you need to create a new admin account later, use the admin dashboard's user management section.

### Reset Setup (If Needed)
If you need to reset the setup process (for development or testing):
1. Connect to your MongoDB database
2. Delete all documents in the `users` collection
3. Restart the application
4. The `/setup` page will be available again

> ⚠️ **Warning**: Never reset the setup in a production environment unless absolutely necessary, as this will delete all user accounts.

### Create Initial Admin

1. Visit `/setup` to create the first admin user
2. Use the secret key (set in environment variables as `ADMIN_SECRET_KEY`)
3. After successful setup, you'll be redirected to the login page

### User Registration Flow

1. Users register at `/register`
2. Admin approves users in the admin panel at `/admin/users`
3. Approved users can contribute content at `/contribute`

## 🧰 Admin Dashboard

The admin dashboard is accessible at `/admin` and includes the following sections:

| Section | Description |
|-----|-----|
| **Dashboard** | Overview of site statistics and recent activities |
| **Manage Posts** | Upload and manage daily status posts |
| **Manage News** | Create and edit news articles |
| **Manage Events** | Create and manage upcoming events |
| **Upload Status** | Upload new status posters |
| **Contributions** | Review and approve user contributions |
| **Users** | Manage user accounts |
| **Settings** | Configure system settings |
| **Date Debug** | Tools for testing date-based features |

### Admin Features

- **Content Management**: Create, edit, and delete content
- **User Management**: Approve, edit, and delete user accounts
- **Backup & Restore**: Export and import data
- **System Status**: Monitor system health and performance
- **Debug Tools**: Troubleshoot issues with the application

## 📦 Storage Buckets

The application uses the following Supabase storage buckets:

| Bucket | Purpose |
|-----|-----|
| `posters-hd` | High-resolution status posters |
| `posters-web` | Web-optimized status posters |
| `audio` | Audio files |
| `avatars` | User profile avatars |
| `news` | News article images |
| `events` | Event images |

## 💾 Database Collections

The application uses the following MongoDB collections:

| Collection | Purpose |
|-----|-----|
| `statusPosts` | Daily status posts |
| `users` | User accounts and profiles |
| `contributions` | User-submitted content |
| `news` | News articles |
| `events` | Upcoming events |

## 🔌 API Endpoints

### Public API Endpoints

| Endpoint | Method | Description |
|-----|-----|-----|
| `/api/status` | GET | Get all status posts |
| `/api/status/[day]` | GET | Get status post for a specific day |
| `/api/news` | GET | Get all news articles |
| `/api/news/[id]` | GET | Get a specific news article |
| `/api/events` | GET | Get all events |
| `/api/events/[id]` | GET | Get a specific event |
| `/api/users` | GET | Get all users (public profiles) |

### Admin API Endpoints

| Endpoint | Method | Description |
|-----|-----|-----|
| `/api/status` | POST | Create a new status post |
| `/api/status/[day]` | PUT | Update a status post |
| `/api/status/[day]` | DELETE | Delete a status post |
| `/api/news` | POST | Create a new news article |
| `/api/news/[id]` | PUT | Update a news article |
| `/api/news/[id]` | DELETE | Delete a news article |
| `/api/events` | POST | Create a new event |
| `/api/events/[id]` | PUT | Update an event |
| `/api/events/[id]` | DELETE | Delete an event |
| `/api/users/[id]/approve` | PUT | Approve a user |
| `/api/users/[id]` | DELETE | Delete a user |

### Debug API Endpoints

| Endpoint | Method | Description |
|-----|-----|-----|
| `/api/debug-db` | GET | Check database connection |
| `/api/debug-supabase` | GET | Check Supabase connection |
| `/api/debug-storage` | GET | Check Supabase storage |
| `/api/debug-events` | GET | Check events collection |
| `/api/debug-dates` | GET | Check date utilities |
| `/api/force-refresh` | GET | Force revalidate all pages |

## ⚠️ Troubleshooting

### Common Issues

<details><summary><b>Image Upload Issues</b></summary>

- Check Supabase storage permissions
- Verify service role key has proper permissions
- Use the `/api/debug-storage` endpoint to diagnose issues
- Ensure the correct bucket names are being used
- Check file size limits (default is 2MB)

</details>

<details><summary><b>Caching Issues</b></summary>

- Use the `/api/force-refresh` endpoint to revalidate all pages
- Add cache-busting parameters to API requests
- Check cache control headers in API responses
- Clear browser cache and cookies
- Verify that `revalidate` is set correctly in page components

</details>

<details><summary><b>Database Connection Issues</b></summary>

- Verify MongoDB connection string
- Check network connectivity
- Use the `/api/debug-db` endpoint to diagnose issues
- Ensure IP allowlist includes your server IP
- Check MongoDB Atlas dashboard for connection issues

</details>

<details><summary><b>Authentication Issues</b></summary>

- Verify NextAuth secret
- Check NextAuth URL
- Ensure cookies are enabled in the browser
- Check for CORS issues
- Verify that the user exists and is approved

</details>

## 🚢 Deployment

### Vercel Deployment

1. Push your code to a GitHub repository
2. Import the repository in Vercel
3. Configure environment variables
4. Deploy the application

### Environment Variables for Production

For production deployment, set the following environment variables:

```plaintext
MONGODB_URI=your_production_mongodb_uri
NEXT_PUBLIC_SUPABASE_URL=your_production_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_production_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_production_supabase_service_role_key
NEXTAUTH_URL=https://your-production-domain.com
NEXTAUTH_SECRET=your_production_nextauth_secret
ADMIN_SECRET_KEY=your_production_admin_secret_key
REVALIDATE_SECRET=your_production_revalidate_secret
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

Please follow the [code of conduct](CODE_OF_CONDUCT.md) and [contribution guidelines](CONTRIBUTING.md).

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgements

- [Next.js](https://nextjs.org/) - The React Framework
- [MongoDB](https://www.mongodb.com/) - Database
- [Supabase](https://supabase.com/) - Storage
- [Tailwind CSS](https://tailwindcss.com/) - CSS Framework
- [shadcn/ui](https://ui.shadcn.com/) - UI Components
- [NextAuth.js](https://next-auth.js.org/) - Authentication
- [Vercel](https://vercel.com/) - Deployment Platform

---

<div>
<p>Built with ❤️ by the SUHBA team</p>
<p>© 2023 SUHBA Archive. All rights reserved.</p>
</div>