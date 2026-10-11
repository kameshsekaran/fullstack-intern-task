# TemplateHub — Mini SaaS Template Store

A full-stack web application that allows users to explore website templates, register, log in, and save their favorite templates.

## Features

- User registration and login
- JWT-based authentication
- Password hashing using bcrypt
- Browse website templates
- Search templates by name and description
- Filter templates by category
- Add templates to favorites
- View saved favorites
- Protected favorites page
- Responsive user interface

## Technology Stack

### Frontend
- React.js
- Vite
- React Router DOM
- Axios
- CSS

### Backend
- Node.js
- Express.js
- SQLite
- better-sqlite3
- bcryptjs
- JSON Web Tokens
- dotenv

## Project Structure

```text
fullstack-intern-task/
├── client/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   └── index.css
│   └── package.json
├── server/
│   ├── server.js
│   ├── database.js
│   ├── package.json
│   └── .env
├── .gitignore
└── README.md
```

## Prerequisites

- Node.js
- npm

## Setup Instructions

### 1. Clone the repository

```bash
git clone https://github.com/kameshsekaran/fullstack-intern-task.git
cd fullstack-intern-task
```

Replace `YOUR_USERNAME` with your GitHub username.

### 2. Configure and start the backend

```bash
cd server
npm install
```

Create a `.env` file inside the `server` directory:

```env
PORT=5000
JWT_SECRET=your_secure_random_secret
```

Generate a secure secret using:

```bash
openssl rand -hex 32
```

Replace the placeholder with the generated value.

Start the backend:

```bash
npm run dev
```

The backend runs at:

http://localhost:5000

The SQLite database and sample templates are initialized automatically when the backend starts.

### 3. Start the frontend

Open another terminal:

```bash
cd fullstack-intern-task/client
npm install
npm run dev
```

Open the local URL displayed by Vite, usually:

http://localhost:5173

## API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| POST | /api/auth/register | Register a new user |
| POST | /api/auth/login | Log in and receive a JWT |
| GET | /api/templates | Retrieve all templates |
| GET | /api/templates/:id | Retrieve template details |
| POST | /api/favorites/:templateId | Add a favorite |
| GET | /api/favorites | Retrieve the authenticated user's favorites |

Favorites endpoints require a valid JWT in the Authorization header.

## Security

- Passwords are hashed before storage.
- Protected API endpoints verify JWTs.
- Environment variables are stored in `.env`.
- Environment files and database files should not be committed to GitHub.

## Author

Name: kamesh S

Email: kamesh15official@gmail.com


