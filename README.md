# CloudPOS

CloudPOS is a high-performance, multi-tenant MERN stack (MongoDB, Express, React, Node.js) Software-as-a-Service (SaaS) Point of Sale platform. Designed for modern retail operations, it enables business owners to manage multiple stores, track product catalogs, manage stock levels, handle sales logs, record expenses, and run detailed analytics dashboards under complete tenant isolation.

---

## 🚀 Key Features

* **Multi-Tenant Isolation**: Secure, isolated database operations and catalog controls for different businesses under a single platform.
* **Interactive POS Terminal**: Fast cashier checkout registry with customer CRM integration.
* **Inventory Control & Logs**: Real-time stock levels tracking, automatic stock adjustment logs, and supplier/vendor management.
* **Analytics & Reporting**: Detailed sales reporting, expense trackers, and owner/superadmin dashboards.
* **Role-Based Access Control (RBAC)**: Secure routes and actions guarded for SuperAdmins, Business Owners, Cashiers, and Inventory Managers.
* **Enterprise Security**: Built-in system audit loggers, secure dual JWT (Access/Refresh) token authentication, and API request validation.

---

## 🛠️ Technology Stack

| Layer | Technologies |
| :--- | :--- |
| **Frontend** | React (Vite), Redux Toolkit, React Router DOM, Axios, Tailwind CSS, Lucide Icons |
| **Backend** | Node.js, Express.js, Mongoose (MongoDB ODM), Bcryptjs, JSON Web Tokens (JWT) |
| **Utilities** | Cloudinary (Image uploads), PDFKit (Receipt generation), QRCode (POS scans) |
| **CI/CD** | GitHub Actions, MongoDB Services |

---

## 📁 Workspace Directory Structure

```text
CloudPOS/
├── .github/                 # GitHub CI/CD workflows configuration
├── backend/                 # Node.js / Express.js Backend server
│   ├── src/
│   │   ├── config/          # Database configuration
│   │   ├── controllers/     # Business logic controllers
│   │   ├── middleware/      # Auth & error handling middlewares
│   │   ├── models/          # Mongoose database models
│   │   ├── routes/          # Express route endpoints
│   │   ├── utils/           # Token utilities, cloudinary, logger
│   │   └── tests/           # Integration tests and runner
│   ├── server.js            # Entry server file
│   └── .env                 # Local environmental variables
└── frontend/                # React / Vite Frontend application
    ├── src/
    │   ├── components/      # Common UI elements & layouts
    │   ├── features/        # Feature modules (Auth, POS, Inventory, etc.)
    │   ├── store/           # Redux global state store
    │   └── utils/           # Axios interceptors and helpers
    ├── vite.config.js       # Vite configuration
    └── tailwind.config.js   # Styling configuration
```

---

## ⚙️ Quick Start Installation

### Prerequisites
* [Node.js](https://nodejs.org/) (v18.x or higher)
* [MongoDB](https://www.mongodb.com/) (running locally on port `27017`)

### 1. Setup Backend
1. Navigate to the backend directory:
   ```bash
   cd backend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Configure the `.env` file (if not already set up):
   ```env
   PORT=5000
   MONGODB_URI=mongodb://127.0.0.1:27017/cloudpos
   JWT_SECRET=your_jwt_access_secret
   JWT_REFRESH_SECRET=your_jwt_refresh_secret
   CLOUDINARY_CLOUD_NAME=your_cloudinary_name
   CLOUDINARY_API_KEY=your_cloudinary_key
   CLOUDINARY_API_SECRET=your_cloudinary_secret
   ```
4. Start the backend development server:
   ```bash
   npm run dev
   ```

### 2. Setup Frontend
1. Open a new terminal and navigate to the frontend directory:
   ```bash
   cd frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the Vite development server:
   ```bash
   npm run dev
   ```
4. Open your browser and navigate to `http://localhost:5173`

---

## 🧪 Running Tests
To run the integration tests checking tenant isolation boundaries and inventory logs, navigate to the backend directory and execute:
```bash
cd backend
npm test
```

---

## 🛡️ License
Distributed under the MIT License.
