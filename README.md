>### Note:
>- This project **Xampp** for local hosting and development.
>- Copy `php.config.example.ini` to `php.config.ini` and edit the database / SMTP configuration there (this file is git-ignored, never commit it)
>- For assistance, please refer to [XAMPP Documentations](https://www.apachefriends.org/docs/)

### Introduction:

This project is inspired by hotel booking websites like [booking.com](booking.com) or [traveloka](traveloka), etc. Functionalities are rather simple as our skills are not quite there yet. But with that being said, we did try our best to complete the project.

**Technologies used:**

- Frontend: HTML5, CSS3, Bootstrap
- Backend: PHP
- Database: MySQL

---

### Installation:

**1. Prerequisite**

- Make sure you have XAMPP installed (If not, download and install it [here](https://www.apachefriends.org/download.html).

- After cloning the repo to your local computer, paste it to the following path: `xampp\htdocs`

**2. Edit config files to connect to port `3307`:**

Locate `xampp\phpMyAdmin\config.inc.php` or open XAMPP Control Panel and choose the `Config` option for `Apache`:

```php
$cfg['Servers'][$i]['auth_type'] = 'config';
$cfg['Servers'][$i]['user'] = 'root';
$cfg['Servers'][$i]['password'] = '';
$cfg['Servers'][$i]['extension'] = 'mysqli';
$cfg['Servers'][$i]['port'] = 3307;      # Edit or add this line
$cfg['Servers'][$i]['AllowNoPassword'] = true;
$cfg['Lang'] = '';
```

Locate `xampp\mysql\bin\my.ini` or open XAMPP Control Panel and choose the `Config` option for `MySQL`:

```ini
# password       = your_password
port=3307                                # Edit or add this line
socket="C:/xampp/mysql/mysql.sock"
```
```ini
# The MySQL server
default-character-set=utf8mb4
[mysqld]
port=3307                                # Edit or add this line
socket="C:/xampp/mysql/mysql.sock"
basedir="C:/xampp/mysql"

```

**3. Create a database on phpMyAdmin**

Create a new database by importing `hostay_db.sql` located at `xampp\htdocs\hostay` 

If your database was imported from an older version of `hostay_db.sql`, also run `migrations/001_password_hash.sql` so the password column can store modern password hashes.

**4. Start XAMPP**
- Launch the XAMPP Control Panel
- Start the Apache and MySQL services

---
### Code Construction

The graph below shows the construction of the project's code:
<div align="center">
    <img src="demo/systemdiagrameng.png" width="500"/>
</div>

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

---
### Node.js version (in progress)

The project is being rewritten with **Express + TypeScript + Prisma** (`server/`) and **React + Vite** (`client/`), using the same MySQL database.

```bash
# API (http://localhost:4000)
cd server
cp .env.example .env      # edit DATABASE_URL and SESSION_SECRET
npm install
npm run db:generate
npm run dev

# Web (http://localhost:5173), in another terminal
cd client
npm install
npm run dev
```

Do **not** run `prisma migrate` against the existing database; the Prisma schema maps the current tables as-is.
