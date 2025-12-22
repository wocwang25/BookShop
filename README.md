# 📚 BookShop

A Node.js/React fullstack project organized with **feature-based MVC architecture** for a bookshop, supporting both book sales and rentals.

**Note:** This project branch provides **two separate user interfaces**:

- The **Customer UI** (HTML/CSS/JS static pages) is served directly by the backend at [http://localhost:5000/](http://localhost:5000/) and is intended for end-users to browse and shop for books.
- The **Admin/Staff UI** (React, Vite) is a modern web application for administrators and staff, running independently at [http://localhost:5173/](http://localhost:5173/). To use this interface, navigate to the `bookstore-fe` folder, install dependencies, and start the development server as described below.

Each interface is developed and deployed separately to best serve its target
---

## 🚀 Getting Started

### 1. Clone the repository

```bash
git clone https://github.com/wocwang25/BookShop.git

git branch -a

git checkout testing_branch

git pull origin testing_branch
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

---

## 🖥️ Run the User Interfaces

### 1. Customer UI (HTML/CSS/JS - Static)

- **Mặc định chạy cùng backend** (port 5000).
- Sau khi chạy backend (xem hướng dẫn bên dưới), truy cập:
  ```
  http://localhost:5000/
  ```
- Giao diện này dành cho khách hàng, sử dụng các file HTML/CSS/JS tĩnh trong thư mục `Frontend`.

---

### 2. Admin/Staff UI (React)

- **Chạy riêng bằng Vite (port 5173 mặc định)**

```bash
cd bookstore-fe
npm install
npm run dev
```
- Truy cập giao diện admin/staff tại:
  ```
  http://localhost:5173/
  ```
- Giao diện này dành cho quản trị viên và nhân viên, phát triển bằng React.

---

## 🛠️ Run the Backend

### 1. Check the needed npm and node environment

```bash
node -v
npm -v
```

### 2. Build and start backend

```bash
npm install
npm run dev 
```
- The backend app will be available at: http://localhost:5000

---

## 🐳 Run the project with Docker (optional)

```bash
docker-compose up --build
```
- The app will be available at: http://localhost:5000

To stop:
```bash
docker-compose down
```

To remove all containers, networks, and volumes:
```bash
docker-compose down -v
```

---

## 🌐 Deploy in web for free (optional)
Visit website render.com and follow the instruction to deploy easily.

## ✍️ Author


- **Võ Quốc Quang** –
