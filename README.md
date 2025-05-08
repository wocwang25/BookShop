# 📚 Project Title

A Node.js backend project organized with **feature-based MVC architecture**.

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
DB_USER = 
DB_PASS = 
DB_NAME = 
DB_HOST=
JWT_SECRET=yusatololicute
JWT_REFRESH_SECRET=lolicute
Admin_infor={"username":"","password":""} # for create admin account

SALT_ROUNDS = 10

# MONGO_URI=mongodb+srv://DB_USER:DB_PASS@cluster0.mongodb.net/DB_NAME
```
https://cloud.mongodb.com/v2/67f48d7434c0ee782cdc44d5#/overview -> tao tai khoan roi cluster mien phi

### 3. Run the project with Docker

#### 3.1. Build and start the containers
```bash
docker-compose up --build
```
- The first time, use `--build` to ensure dependencies are installed.
- The app will be available at: http://localhost:3000

#### 3.2. Stop the containers
```bash
docker-compose down
```

#### 3.3. (Optional) Remove all containers, networks, and volumes
```bash
docker-compose down -v
```

---

## 📂 Project Structure (sample)

```bash
.
├── features/
│   ├── auth/
│   │   ├── auth.controller.js
│   │   ├── auth.routes.js
│   │   └── auth.service.js
│   ├── user/
│   │   ├── user.model.js
│   │   ├── user.controller.js
│   │   ├── user.routes.js
│   │   └── user.service.js
│   └── ...
├── middlewares/
│   ├── authMiddleware.js
│   └── errorHandler.js
├── config/
│   └── database.js
├── utils/
│   └── helpers.js
├── app.js
├── server.js
├── Dockerfile
├── docker-compose.yml
├── .dockerignore
├── package.json
└── package-lock.json
```

---

## 📦 Main Dependencies

| Package       | Version |
|---------------|---------|
| express       | ^4.x    |
| mongoose      | ^7.x    |
| bcrypt        | ^5.x    |
| jsonwebtoken  | ^9.x    |

---

## 🛠 Features

- 🛡️ User authentication (Login, Register, Change Password)
- 🔑 JWT Authentication + Authorization
- 🚀 Rate Limiter for Login
- 🧹 Organized Feature-based MVC structure
- 💬 Multi-language error handling (optional idea)
- 🔒 Password hashing with bcrypt

---

## ✍️ Author

- **Võ Quốc Quang** – [My GitHub](https://github.com/wocwang25)

---

## 📜 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
