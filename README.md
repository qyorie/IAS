# 🛡️ SML(Share Mo Lang) — IAS Final Project

A secure **MERN Stack Blog Application** built with **MongoDB, Express.js, React, and Node.js**, demonstrating **user authentication**, **role-based access control (RBAC)**, and **web application security principles** such as XSS protection, CSRF defense, and input sanitization.

---

## 🧩 Overview

This project is part of the **Information Assurance and Security (IAS1) Final Project**.  
It implements a secure, multi-role **blog web application** that protects against common web threats while maintaining good usability and scalability.

---

## 🚀 Features

- 🧑‍💻 **User Authentication** (Register, Login via JWT)
- 🔐 **Role-Based Access Control (RBAC)** — Admin, User, Guest
- 📝 **Post Management** (Create, Read, Update, Delete)
- ❤️ **Like/Unlike Posts**
- 💬 **Comment System**
- 👮 **Admin Panel** — Manage Users and their Posts
- 🛡️ **Security Layers:**
  - Password hashing
  - CSRF protection
  - Input sanitization
  - HTTPS-ready configuration
  - Secure headers

---

## 👥 System Roles

| Role | Permissions |
|------|--------------|
| **Guest** | View posts and comments only |
| **User** | Create, edit, delete, like posts, and comment |
| **Admin** | Manage users and delete any post |

---

## 🔒 Security Features

| Feature | Library | Description |
|----------|----------|-------------|
| **Password Hashing** | `bcryptjs` | Safely stores user passwords |
| **Authentication** | `jsonwebtoken` | Issues secure access tokens |
| **Authorization (RBAC)** | Custom middleware | Restricts endpoints by role |
| **Input Sanitization** | `xss-clean`, `express-mongo-sanitize` | Prevents XSS & NoSQL injection |
| **Secure Headers** | `helmet` | Adds recommended HTTP headers |
| **CSRF Protection** | `csurf` | Prevents cross-site request forgery |
| **HTTPS Configuration** | Node `https` module | Encrypts data in transit |

---

## 🧱 Tech Stack

**Frontend:** React (Vite)  
**Backend:** Node.js + Express  
**Database:** MongoDB Atlas  
**Security Libraries:** bcryptjs, helmet, xss-clean, csurf, express-mongo-sanitize  
**Testing:** Postman

---

## 📂 Project Structure
```bash
IAS-PROJECT/
├── backend/
│ ├── src/
│ │ ├── config/
│ │ ├── controllers/
│ │ ├── middleware/
│ │ ├── models/
│ │ ├── routes/
│ │ ├── utils/
│ │ ├── app.js
│ │ └── server.js
│ ├── package.json
│ └── .env
│
├── frontend/
│
└── README.md
```
---
## ⚙️ Installation

### Backend
```bash
cd backend
npm install
npm run dev
```
### Frontend
```bash
cd frontend
npm install
npm run dev
```
---
## 🔑 Environment Variables

Create a .env file inside backend/ with:
```env
# Database
MONGODB_URI = your-database

# Server
PORT=5000
NODE_ENV=development
CLIENT_URL=http://localhost:3000

# Authentication
JWT_SECRET= your-super-secret-key
JWT_REFRESH_SECRET= your-super-secret-key
```
---
## 👨‍💻 Developers

Developed by BSCS-3A
- Troy Tristan Jacob
- Alexander Santos
- Michael Art Luna
- Jennylyn Bajan
- Marry Anne Abrasado

For educational purposes — Information Assurance and Security (IAS1).
