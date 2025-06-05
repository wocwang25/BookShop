# 📚 BookShop Backend

A Node.js backend project organized with **feature-based MVC architecture** for a bookshop, supporting both book sales and rentals.

---

## 🚀 Getting Started

### 1. Clone the repository

```bash
git clone https://github.com/wocwang25/BookShop.git
cd ./BookShop/Backend
```

### 2. Setup environment variables

Create a `.env` file at the root with the following variables (do **not** commit this file):

```dotenv
DB_USER=
DB_PASS=
DB_NAME=
DB_HOST=
JWT_SECRET=
JWT_REFRESH_SECRET=
SALT_ROUNDS=10
```

### 3. Run the project with Docker

#### 3.1. Build and start the containers

```bash
docker-compose up --build
```

- The first time, use `--build` to ensure dependencies are installed.
- The app will be available at: http://localhost:5000

#### 3.2. Stop the containers

```bash
docker-compose down
```

#### 3.3. (Optional) Remove all containers, networks, and volumes

```bash
docker-compose down -v
```

---

## 📂 Project Structure

```bash
Backend/
├── app.js
├── server.js
├── Dockerfile
├── docker-compose.yml
├── .dockerignore
├── package.json
├── .env
├── uploads/
├── src/
│   ├── config/
│   │   ├── db.js
│   ├── controllers/
│   ├── models/
│   ├── routes/
│   ├── services/
│   └── test/
```

---

## 📦 Main Dependencies

| Package      | Version |
| ------------ | ------- |
| express      | ^4.x    |
| mongoose     | ^8.x    |
| bcrypt       | ^5.x    |
| jsonwebtoken | ^9.x    |
| multer       | ^2.x    |
| csv-parser   | ^3.x    |
| redis        | ^5.x    |

---

## 🛠 Features

- 🛡️ User authentication (Login, Register, Change Password)
- 🔑 JWT Authentication + Authorization
- 🚀 Rate Limiter for Login
- 🧹 Feature-based MVC structure
- � Book management (CRUD, import from CSV)
- 🛒 Cart (add, update, remove items)
- 🧾 Sales invoice & rental invoice management
- 💸 Payment receipt & debt management
- ⭐ Favourite books
- 📝 Book reviews
- 📦 Inventory & debt reporting
- 🔒 Password hashing with bcrypt

---

## ✍️ Author

- **Võ Quốc Quang** – [My GitHub](https://github.com/wocwang25)

---
