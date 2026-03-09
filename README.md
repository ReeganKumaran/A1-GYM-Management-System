# A1 GYM Management System

A full-stack gym management web application built with Next.js 14 that replaces paper-based receipts, manual member management, and manual notification distribution with a streamlined digital solution. The system provides role-based dashboards for admins, members, and general users, enabling efficient gym operations from billing and package management to supplement tracking and diet planning.

---

## Features

### Admin
- Secure login with role-based access control
- Add, update, and delete gym members
- Create and manage billing records
- Assign fee packages to members
- Send monthly notifications to members
- Export reports in CSV and PDF formats
- Manage a supplement store (add, update, delete supplements)
- Manage diet plan details (add, update, delete diet plans)

### Member
- Secure login to a personalized dashboard
- View bill receipts with PDF download support (via jsPDF)
- View notifications sent by the admin

### User
- Register and login to browse gym offerings
- View personal account details
- Search and browse records including fee packages, supplements, and diet plans

---

## Tech Stack

| Technology   | Version  |
|-------------|----------|
| Next.js     | 14.2.35  |
| React       | ^18      |
| TypeScript  | ^5       |
| Tailwind CSS| ^3.4.1   |
| MongoDB     | -        |
| Mongoose    | ^9.2.4   |
| NextAuth.js | ^4.24.13 |
| bcryptjs    | ^3.0.3   |
| jsPDF       | ^4.2.0   |
| ESLint      | ^8       |

---

## Project Structure

```
gym-management-system/
├── src/
│   ├── app/
│   │   ├── admin/
│   │   │   ├── bills/page.tsx
│   │   │   ├── dashboard/page.tsx
│   │   │   ├── diet/page.tsx
│   │   │   ├── members/
│   │   │   │   ├── [id]/page.tsx
│   │   │   │   └── page.tsx
│   │   │   ├── notifications/page.tsx
│   │   │   ├── packages/page.tsx
│   │   │   ├── reports/page.tsx
│   │   │   └── supplements/page.tsx
│   │   ├── api/
│   │   │   ├── auth/
│   │   │   │   ├── [...nextauth]/route.ts
│   │   │   │   └── register/route.ts
│   │   │   ├── bills/route.ts
│   │   │   ├── diet/route.ts
│   │   │   ├── members/
│   │   │   │   ├── [id]/route.ts
│   │   │   │   └── route.ts
│   │   │   ├── notifications/route.ts
│   │   │   ├── packages/route.ts
│   │   │   ├── reports/route.ts
│   │   │   ├── seed/route.ts
│   │   │   └── supplements/route.ts
│   │   ├── auth/
│   │   │   ├── login/page.tsx
│   │   │   └── register/page.tsx
│   │   ├── member/
│   │   │   ├── bills/page.tsx
│   │   │   ├── dashboard/page.tsx
│   │   │   └── notifications/page.tsx
│   │   ├── user/
│   │   │   ├── dashboard/page.tsx
│   │   │   ├── details/page.tsx
│   │   │   └── search/page.tsx
│   │   ├── globals.css
│   │   ├── layout.tsx
│   │   └── page.tsx
│   ├── components/
│   │   ├── BillCard.tsx
│   │   ├── DashboardCard.tsx
│   │   ├── DashboardLayout.tsx
│   │   ├── MemberForm.tsx
│   │   ├── Navbar.tsx
│   │   ├── NotificationCard.tsx
│   │   ├── SearchBar.tsx
│   │   ├── SessionWrapper.tsx
│   │   └── Sidebar.tsx
│   ├── lib/
│   │   ├── auth.ts
│   │   └── mongodb.ts
│   ├── middleware.ts
│   └── models/
│       ├── Bill.ts
│       ├── Diet.ts
│       ├── Member.ts
│       ├── Notification.ts
│       ├── Package.ts
│       ├── Supplement.ts
│       └── User.ts
├── .env.local
├── .eslintrc.json
├── .gitignore
├── next.config.mjs
├── next-env.d.ts
├── package.json
├── postcss.config.mjs
├── tailwind.config.ts
└── tsconfig.json
```

---

## Prerequisites

- **Node.js** 18 or higher
- **MongoDB** (local installation or MongoDB Atlas cloud instance)
- **npm** (comes with Node.js)

---

## Installation & Setup

1. **Clone the repository**

   ```bash
   git clone https://github.com/ReeganKumaran/A1-GYM-Management-System.git
   cd A1-GYM-Management-System
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Configure environment variables**

   Create a `.env.local` file in the project root with the following variables:

   ```env
   MONGODB_URI=mongodb://localhost:27017/gym-management
   NEXTAUTH_SECRET=your-secret-key-here
   NEXTAUTH_URL=http://localhost:3000
   ```

   Replace `MONGODB_URI` with your MongoDB Atlas connection string if using a cloud database.

4. **Seed the admin account**

   Start the development server first, then visit the seed endpoint in your browser:

   ```
   http://localhost:3000/api/seed
   ```

   This creates the default admin account.

5. **Run the development server**

   ```bash
   npm run dev
   ```

   The application will be available at [http://localhost:3000](http://localhost:3000).

---

## Default Credentials

| Role   | Email           | Password   |
|--------|----------------|------------|
| Admin  | admin@gym.com  | admin123   |
| Member | *(created by admin)* | member123 |

Members are created by the admin through the dashboard. Each new member receives the default password `member123`.

---

## Basic Workflow & Execution

1. **Start the application** -- Run `npm run dev` and open [http://localhost:3000](http://localhost:3000) in your browser.

2. **Seed the admin account** -- Navigate to [http://localhost:3000/api/seed](http://localhost:3000/api/seed) to create the default admin user.

3. **Login as admin** -- Use the default admin credentials (`admin@gym.com` / `admin123`) to access the admin dashboard.

4. **Create packages and add members** -- Set up fee packages, then add gym members and assign them to packages. Create bills for members as needed.

5. **Set up notifications** -- Send monthly notifications to members regarding payments, announcements, or reminders.

6. **Add supplements and diet plans** -- Populate the supplement store and create diet plan entries for members and users to browse.

7. **Export reports** -- Generate and download reports in CSV or PDF format from the reports page.

8. **Members login** -- Members log in with their credentials to view their bill receipts (with PDF download) and notifications on their personal dashboard.

9. **Users browse gym offerings** -- Registered users can log in to search and browse available packages, supplements, and diet plans.

---

## API Endpoints

| Method   | Endpoint                    | Description                              |
|----------|-----------------------------|------------------------------------------|
| `GET`    | `/api/seed`                 | Seed the default admin account           |
| `POST`   | `/api/auth/register`        | Register a new user                      |
| `*`      | `/api/auth/[...nextauth]`   | NextAuth.js authentication handlers      |
| `GET`    | `/api/members`              | Retrieve all members                     |
| `POST`   | `/api/members`              | Create a new member                      |
| `GET`    | `/api/members/[id]`         | Retrieve a specific member by ID         |
| `PUT`    | `/api/members/[id]`         | Update a specific member by ID           |
| `DELETE` | `/api/members/[id]`         | Delete a specific member by ID           |
| `GET`    | `/api/bills`                | Retrieve all bills (or filter by member) |
| `POST`   | `/api/bills`                | Create a new bill                        |
| `GET`    | `/api/packages`             | Retrieve all fee packages                |
| `POST`   | `/api/packages`             | Create a new fee package                 |
| `GET`    | `/api/notifications`        | Retrieve all notifications               |
| `POST`   | `/api/notifications`        | Create a new notification                |
| `GET`    | `/api/supplements`          | Retrieve all supplements                 |
| `POST`   | `/api/supplements`          | Create a new supplement                  |
| `PUT`    | `/api/supplements`          | Update a supplement                      |
| `DELETE` | `/api/supplements`          | Delete a supplement                      |
| `GET`    | `/api/diet`                 | Retrieve all diet plans                  |
| `POST`   | `/api/diet`                 | Create a new diet plan                   |
| `PUT`    | `/api/diet`                 | Update a diet plan                       |
| `DELETE` | `/api/diet`                 | Delete a diet plan                       |
| `GET`    | `/api/reports`              | Export reports (CSV/PDF)                 |

---

## Running Tests

```bash
npm test
```

---

## Build

To create an optimized production build:

```bash
npm run build
```

To start the production server after building:

```bash
npm start
```

---

## Coding Standards

- **TypeScript** for static type safety across the entire codebase
- **ESLint** with Next.js configuration for consistent code quality
- **Modular architecture** with clear separation of concerns -- dedicated directories for models, components, API routes, and library utilities
- **Input validation and error handling** on all API endpoints
- **Secure password hashing** using bcryptjs for storing user and member credentials
- **Role-based access control** enforced via NextAuth.js sessions and middleware, restricting admin, member, and user routes appropriately

---

## License

This project is licensed under the [MIT License](LICENSE).
