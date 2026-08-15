# 💬 Full-Stack Real-Time Chat App

<p align="center">
  <img src="https://img.shields.io/badge/React-2026-blue?style=for-the-badge&logo=react&logoColor=white" />
  <img src="https://img.shields.io/badge/Node.js-Express-green?style=for-the-badge&logo=node.js&logoColor=white" />
  <img src="https://img.shields.io/badge/MongoDB-Database-brightgreen?style=for-the-badge&logo=mongodb&logoColor=white" />
  <img src="https://img.shields.io/badge/Socket.io-Realtime-black?style=for-the-badge&logo=socket.io&logoColor=white" />
</p>

<p align="center">
  <strong>A modern, real-time full-stack chat application built with React, Node.js, MongoDB & Socket.io.</strong>
</p>

<p align="center">
  💬 Real-Time Messaging &nbsp;•&nbsp;
  🔐 JWT Authentication &nbsp;•&nbsp;
  🟢 Online Presence &nbsp;•&nbsp;
  📨 Welcome Emails
</p>

---

## ✨ Why ChatFlow?

ChatFlow is a **full-stack real-time messaging application** designed to provide a smooth and modern chatting experience.

It includes everything you'd expect from a production-style chat application — from **custom authentication and real-time messaging** to **image uploads, email notifications, API protection, and responsive UI**.

---

## 🚀 Features
🔐 Custom JWT Authentication (no 3rd-party auth)
⚡ Real-time Messaging via Socket.io
📨 Welcome Emails on Signup (Resend)
🟢 Online/Offline Presence Indicators
🔔 Notification & Typing Sounds (with toggle)
🗂️ Image Uploads (Cloudinary)
🧰 REST API with Node.js & Express
🧱 MongoDB for Data Persistence
🚦 API Rate-Limiting powered by Arcjet
🎨 Beautiful UI with React, Tailwind CSS & DaisyUI
🧠 Zustand for State Management
🧑‍💻 Git & GitHub Workflow (branches, PRs, merges)
🚀 Easy Deployment (free-tier)


## 🛠️ Tech Stack

### 🎨 Frontend

```text
React
Tailwind CSS
DaisyUI
Zustand
Axios
Socket.io Client
```

### ⚙️ Backend

```text
Node.js
Express.js
MongoDB
Mongoose
Socket.io
JWT
Cloudinary
Resend
Arcjet
```

### 🧰 Tools

```text
Git
GitHub
VS Code
Postman
```

---

## 🖥️ Preview

<p align="center">
  <img src="./screenshots/chat.png" width="90%" alt="ChatFlow Preview" />
</p>

> 💡 Add your best screenshot here. A good screenshot immediately makes the README look much more professional.

---

## 💎 Highlights

### ⚡ Real-Time Communication

Messages are delivered instantly using **Socket.io**, providing a smooth real-time chatting experience.

```text
👤 User A
    │
    │ 💬 "Hello!"
    ▼
┌───────────────┐
│   Socket.io   │
│    Server     │
└───────┬───────┘
        │
        ▼
👤 User B
```

### 🟢 Live Presence

The application keeps track of connected users and displays their online status in real time.

### 📨 Automated Emails

When a new user signs up, a welcome email is automatically sent using **Resend**.

### 🖼️ Cloud Image Uploads

Users can upload profile images, which are securely stored using **Cloudinary**.

### 🛡️ API Security

Arcjet helps protect the backend API with rate-limiting and security controls.

---

## 🧠 State Management

The application uses **Zustand** for global state management.

```text
              Zustand
                 │
       ┌─────────┼─────────┐
       ▼         ▼         ▼
   Auth State  Chat State  UI State
       │         │         │
       ▼         ▼         ▼
     User     Messages   Preferences
```

This keeps application state simple, centralized, and easy to maintain.

---

## 📂 Project Structure

```text
📦 chatflow
│
├── 📁 backend
│   ├── 📁 src
│   │   ├── 📁 controllers
│   │   ├── 📁 models
│   │   ├── 📁 routes
│   │   ├── 📁 middleware
│   │   ├── 📁 lib
│   │   └── server.js
│   │
│   └── package.json
│
├── 📁 frontend
│   ├── 📁 src
│   │   ├── 📁 components
│   │   ├── 📁 pages
│   │   ├── 📁 store
│   │   ├── 📁 libs
│   │   └── App.jsx
│   │
│   └── package.json
│
└── 📄 README.md
```

---

# ⚙️ Getting Started

Follow these steps to run the project locally.

### 1. Clone the repository

```bash
git clone https://github.com/yourusername/chatflow.git

cd chatflow
```

### 2. Setup Backend

```bash
cd backend

npm install

npm run dev
```

### 3. Setup Frontend

Open a new terminal:

```bash
cd frontend

npm install

npm run dev
```

---

## 🔑 Environment Variables

Create a `.env` file inside the `backend` folder:

```env
PORT=3000

MONGODB_URI=your_mongodb_uri

JWT_SECRET=your_jwt_secret

CLIENT_URL=http://localhost:5173

RESEND_API_KEY=your_resend_api_key

CLOUDINARY_CLOUD_NAME=your_cloudinary_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret

ARCJET_KEY=your_arcjet_key
```

Frontend `.env`:

```env
VITE_API_URL=http://localhost:3000/api
```

> 🔒 Never commit your `.env` files or expose your API keys publicly.

---

## 🔄 Application Flow

```text
                 ┌──────────────┐
                 │    React     │
                 │   Frontend   │
                 └──────┬───────┘
                        │
                 REST API / Socket.io
                        │
                        ▼
                 ┌──────────────┐
                 │   Express    │
                 │    Server    │
                 └──────┬───────┘
                        │
              ┌─────────┼─────────┐
              ▼         ▼         ▼
          MongoDB   Cloudinary  Resend
              │
              ▼
          Socket.io
              │
              ▼
       Real-Time Messages
```

---

## 🌿 Git Workflow

This project follows a feature-based Git workflow.

```bash
# Create a feature branch
git checkout -b feature/chat-system

# Make your changes
git add .

# Commit
git commit -m "feat: add real-time messaging"

# Push
git push origin feature/chat-system
```

Then create a **Pull Request → Review → Merge**.

---

## 🚀 Deployment

The application is designed to be **free-tier friendly** and can be deployed using services such as Sevalla.

```text
Frontend
   │
   ▼
Deployment Platform
   │
   ▼
Backend API
   │
   ├──► MongoDB
   ├──► Cloudinary
   ├──► Resend
   └──► Arcjet
```

---

## 📚 What I Learned

Building this project helped me understand how a real-world full-stack application works, including:

* 🔐 Building authentication from scratch
* ⚡ Implementing WebSocket communication
* 🟢 Managing online/offline users
* 🧠 Managing global state with Zustand
* 🧰 Designing REST APIs
* 🍃 Working with MongoDB & Mongoose
* ☁️ Handling cloud image uploads
* 📨 Integrating email services
* 🛡️ Protecting APIs with rate limiting
* 🌿 Working with Git branches and pull requests
* 🚀 Deploying a full-stack application

---

## 🌟 Future Improvements

* 👥 Group conversations
* 📎 File sharing
* 😊 Emoji reactions
* 🗑️ Message deletion
* ✏️ Message editing
* 🔍 Chat search
* 📱 PWA / mobile support

---

## 🤝 Contributing

Contributions, issues and feature requests are welcome!

If you have an idea that could improve the project, feel free to open an issue or submit a pull request.

---

## ⭐ Show Your Support

If you like this project, consider giving it a **⭐ star** on GitHub.

It really helps and motivates me to keep building! ❤️

---

## 👨‍💻 Author

### Arjun Shah

**Full-Stack Developer • AI Enthusiast • Tech Explorer**

<p align="left">
  <a href="https://github.com/yourusername">
    <img src="https://img.shields.io/badge/GitHub-181717?style=for-the-badge&logo=github&logoColor=white" />
  </a>
  <a href="https://linkedin.com/in/yourusername">
    <img src="https://img.shields.io/badge/LinkedIn-0A66C2?style=for-the-badge&logo=linkedin&logoColor=white" />
  </a>
</p>

---

<p align="center">
  <strong>💬 Built with passion, JavaScript & lots of ☕</strong>
</p>

<p align="center">
  ⭐ Star this repository if you found it useful!
</p>
