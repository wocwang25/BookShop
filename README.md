# 📚 Project Title

A Node.js backend project organized with **feature-based MVC architecture**.

---

## 🚀 Getting Started

### 1. Clone the repository
```bash
git clone https://github.com/wocwang25/BookShop.git
cd your-project
```

### 2. Install dependencies
```bash
npm install
```

### 3. Setup environment variables
Create a `.env` file at the root with the following variables:

```dotenv
DB_USER = 
DB_PASS = 
DB_NAME = 
DB_HOST=
JWT_SECRET=yusatololicute
JWT_REFRESH_SECRET=lolicute
Admin_infor={"username":"","password":""} -> for create admin account


SALT_ROUNDS = 10

# https://cloud.mongodb.com/v2/67f48d7434c0ee782cdc44d5#/overview -> tao tai khoan roi cluster mien phi
# MONGO_URI=mongodb+srv://DB_USER:DB_PASS@cluster0.mongodb.net/DB_NAME

```

### 4. Run the project

- **Development mode** (with nodemon):
  ```bash
  npm run dev
  ```

- **Production mode**:
  ```bash
  npm start
  ```

---

## 📂 Project Structure

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
└── package.json
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

- **Võ Quốc Quang** – [https://github.com/wocwang25]

---

## 📜 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

