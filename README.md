### Introduction

This project is inspired by hotel booking websites like [booking.com](https://www.booking.com) or [traveloka](https://www.traveloka.com). Customers can search and book rooms, view and cancel their bookings, and contact the hotel; staff manage rooms, bookings, users and customer messages from an admin panel.

The project was originally written in PHP and has been rewritten in Node.js. The PHP version remains available in the git history (before the `migrate-to-node` branch was merged).

**Technologies used:**

- Frontend: React, Vite, React Router, Bootstrap (`client/`)
- Backend: Express, TypeScript, Prisma, zod (`server/`)
- Database: MySQL 8

---

### Installation

**1. Prerequisites**

- [Node.js](https://nodejs.org) 20 or newer
- MySQL 8 (for example the [MySQL Installer](https://dev.mysql.com/downloads/installer/) on Windows)

**2. Create the database**

Create a database named `hostay_db` (charset `utf8mb4`) and import `hostay_db.sql`, for example in MySQL Workbench:

```sql
CREATE DATABASE hostay_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

Then *File → Open SQL Script…* → `hostay_db.sql`, double-click `hostay_db` to make it the default schema, and run the script.

**3. Configure and start the API** (http://localhost:4000)

```bash
cd server
cp .env.example .env      # set DATABASE_URL (MySQL password) and SESSION_SECRET
npm install
npm run db:generate
npm run db:normalize -- --apply   # one-time fix for Vietnamese text in the sample data (see below)
npm run dev
```

**4. Start the web client** (http://localhost:5173), in another terminal

```bash
cd client
npm install
npm run dev
```

Sign in with `admin` / `admin` and change the password from *Thông tin cá nhân*.

---

### Notes

- Do **not** run `prisma migrate` against the database; the Prisma schema maps the existing tables as-is. A `sessions` table is created automatically to store logins.
- Room images are stored in `server/uploads/`. Uploads made at runtime are git-ignored.
- Some Vietnamese text in the sample data is stored in decomposed Unicode (NFD), which breaks searches such as "Hà Nội". `npm run db:normalize` previews the affected cells and `npm run db:normalize -- --apply` rewrites them (back up the database first). New input is normalized automatically.
- Replying to customer messages by email needs the `SMTP_*` settings in `server/.env` (for Gmail, use an app password).
- Passwords from the original database (MD5) still work and are upgraded to bcrypt on the next login.

---

### Demo

<div align="center">
    <img src="demo/img-1.png" width="500"/>
</div>

<div align="center">
    <img src="demo/img-3.png" width="500"/>
</div>

<div align="center">
    <img src="demo/img-10.png" width="500"/>
</div>
