# HKS Duty Hour Portal — Simple College Capstone

Built with basic Express routes, EJS views, MySQL, and Nodemon. The source intentionally uses beginner-friendly code and CRUD routes.

## Setup
1. Install Node.js and MySQL.
2. Import `db.sql` using MySQL Workbench or phpMyAdmin.
3. Open this folder in VS Code.
4. Run `npm install`.
5. Open `app.js` and update the MySQL `user`, `password`, and database settings if needed.
6. Run `npm run dev`.
7. Open `http://localhost:3000`.

## Demo accounts
- Admin: `admin@hks.local` / `admin123`
- Teacher: `teacher@hks.local` / `teacher123`
- Student: `student@hks.local` / `student123`

## CRUD coverage
- Users: Create, Read, Update, Delete (Admin)
- Duty logs: Create, Read, Update, Delete (Teacher/Admin)
- Duty slots: Create and Read (Teacher/Admin)

## Capstone notes
This is a learning/demo build, not production-ready. Passwords are plain text for beginner demonstration only. For real student data, use hashed passwords, prepared validation, CSRF protection, secure sessions, proper authorization checks, audit logs, and official Google SSO. The basic login in this simple version is not the Google SSO flow from the formal proposal. Slot capacity is displayed but does not yet enforce approved reservations. Clearance carry-over, PDF generation, and email delivery are not included in this simplified version.
