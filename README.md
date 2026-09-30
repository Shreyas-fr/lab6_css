# Salt & Pepper Password Protection - Cryptographic Hash Functions Practical

A beginner-friendly MERN stack web application demonstrating the **Salt and Pepper** password hashing technique using Node.js, Express, MongoDB, and React.

---

## 📌 Practical Concepts Breakdown

### 1. **Salt**
- **Definition**: A random string generated for each user during registration.
- **Storage**: Stored in the MongoDB database alongside the username and password hash.
- **Purpose**: Prevents **Rainbow Table attacks** (precomputed hash lookup tables) and ensures two users with identical passwords receive completely different hashes.

### 2. **Pepper**
- **Definition**: A secret value (e.g. single character chosen from candidate set `'A'-'Z'`) added to the password.
- **Storage**: **NEVER STORED IN THE DATABASE**.
- **Purpose**: Protects against **database breaches**. Even if an attacker steals the entire database (`username`, `salt`, `hash`), they still cannot compute or verify passwords without knowing the secret pepper.

### 3. **SHA-256 Hashing**
- The server hashes: `SHA-256(password + salt + pepper)`.

---

## 🛠 Project Structure

```text
10705/
├── server/                 # Node.js + Express Backend
│   ├── models/
│   │   └── User.js         # Mongoose Schema (stores username, salt, hash)
│   ├── routes/
│   │   └── auth.js         # Salt generation & Pepper brute-force verification logic
│   ├── package.json
│   └── server.js           # Express app & Mongo DB connection (auto fallback to memory server)
├── client/                 # React Frontend (Vite)
│   ├── src/
│   │   ├── App.jsx         # UI with Form, Success/Error message, Cryptographic Inspector
│   │   ├── index.css       # Clean dark-mode styles
│   │   └── main.jsx
│   ├── index.html
│   ├── package.json
│   └── vite.config.js
└── README.md
```

---

## 🚀 How to Run the Project

### 1. Install Dependencies
In two terminal windows (or inside `server` and `client` directories):

**Backend:**
```bash
cd server
npm install
```

**Frontend:**
```bash
cd client
npm install
```

---

### 2. Start the Backend Server
```bash
cd server
npm start
```
*Note: The server will automatically connect to local MongoDB. If local MongoDB is not running, it will automatically spin up an **In-Memory MongoDB Server**, so no extra setup is required!*

---

### 3. Start the React Frontend
```bash
cd client
npm run dev
```

Open your browser and navigate to: `http://localhost:5173`

---

## 🧪 Testing the Practical Application

1. **Register a User**:
   - Enter a username (`alice`) and password (`mySecret123`).
   - Click **Register**.
   - Observe the **Cryptographic Inspector**:
     - Random Salt generated (16-byte hex).
     - Secret Pepper selected by server (e.g. `'K'`).
     - SHA-256 hash computed: `SHA256("mySecret123" + salt + "K")`.
   - Inspect the **MongoDB Database Contents** table below:
     - Notice that `username`, `salt`, and `hash` are stored, but **`pepper` is explicitly NOT STORED**.

2. **Login Verification**:
   - Enter `alice` and `mySecret123` -> Click **Login**.
   - Result: **Login Successful!**
   - The Cryptographic Inspector shows how the server retrieved the stored salt & hash, iterated through candidate peppers (`A-Z`), found candidate `'K'`, and matched the hash.

3. **Failed Login Verification**:
   - Enter `alice` and wrong password `wrongpass` -> Click **Login**.
   - Result: **Login Unsuccessful: Invalid Password!** (None of the candidate peppers produced a matching hash).
