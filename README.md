# 🎣 PhishNet - Phishing Simulation Toolkit

<img src="https://github.com/gh0st-bit/PhishNet/blob/main/phishnet/src/assets/img/Logo/logo.jpg" width="300" alt="PhishNet Banner">

[![GitHub License](https://img.shields.io/badge/license-MIT-blue.svg)](https://github.com/yourusername/phishnet/blob/main/LICENSE)
[![Node.js Version](https://img.shields.io/badge/node-%3E%3D%2016.0.0-brightgreen)](https://nodejs.org/)
[![React Version](https://img.shields.io/badge/react-%5E18.2.0-blue)](https://reactjs.org/)

**PhishNet** is a comprehensive phishing simulation and cybersecurity awareness platform designed to empower organizations to identify vulnerabilities, train employees, and build a human firewall against phishing attacks.

---

## 🚀 Features

- **Realistic Phishing Simulations**
  - Customizable email templates (email phishing, smishing, spear-phishing).
  - Schedule automated campaigns with dynamic content.
- **Interactive Training Modules**
  - Gamified lessons on spotting phishing attempts.
  - Progress tracking and certificates.
- **Advanced Analytics**
  - Real-time dashboards with user engagement metrics.
  - Compliance reports for GDPR, HIPAA, ISO 27001.
- **Role-Based Access Control**
  - Granular permissions for Admins, Security Teams, and Training Managers.
- **Automated Defense**
  - Quarantine suspicious emails & orchestrate incident response workflows.

---

## 🛠️ Installation

### Prerequisites
- Node.js (v16+)
- PostgreSQL (v12+)
- Git

### Backend Setup

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/phishnet.git
   cd phishnet/backend

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure environment variables**
   ```bash
   cp .env.example .env
   # Update PostgreSQL and JWT credentials in .env
   ```

4. **Run database migrations**
   ```bash
   npm run migrate
   ```

5. **Start the server**
   ```bash
   npm start
   ```

### Frontend Setup

1. **Navigate to the frontend directory**
   ```bash
   cd ../frontend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start the React app**
   ```bash
   npm run dev
   ```

---

## 🖥️ Usage

1. **Login**  
   Visit `http://localhost:3000` and sign in with:
   - Admin: `admin@phishnet.com` / `admin123`
   - User: `user@phishnet.com` / `user123`

2. **Create a Phishing Campaign**  
   - Navigate to **Phishing Simulation → New Campaign**.
   - Choose a template, set targets, and schedule the test.

3. **Assign Training**  
   - Go to **Cybersecurity Training → Assign Modules**.
   - Select users/groups and track completion.

4. **Analyze Results**  
   - View real-time metrics in **Analytics & Reports**.

---

## 📸 Screenshots

| Dashboard | Campaign Creation | Training Module |
|-----------|-------------------|-----------------|
| ![Dashboard](https://via.placeholder.com/300x200.png?text=Dashboard) | ![Campaign](https://via.placeholder.com/300x200.png?text=Campaign+Creator) | ![Training](https://via.placeholder.com/300x200.png?text=Training+Module) |

---

## 🧰 Tech Stack

**Backend**  
![Node.js](https://img.shields.io/badge/Node.js-339933?logo=nodedotjs&logoColor=white)
![Express](https://img.shields.io/badge/Express-000000?logo=express&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-4169E1?logo=postgresql&logoColor=white)
![JWT](https://img.shields.io/badge/JWT-000000?logo=jsonwebtokens&logoColor=white)

**Frontend**  
![React](https://img.shields.io/badge/React-61DAFB?logo=react&logoColor=black)
![Redux](https://img.shields.io/badge/Redux-764ABC?logo=redux&logoColor=white)
![MaterialUI](https://img.shields.io/badge/Material%20UI-007FFF?logo=mui&logoColor=white)

**Tools**  
![Git](https://img.shields.io/badge/Git-F05032?logo=git&logoColor=white)
![ESLint](https://img.shields.io/badge/ESLint-4B32C3?logo=eslint&logoColor=white)
![Jest](https://img.shields.io/badge/Jest-C21325?logo=jest&logoColor=white)

---

## 🤝 Contributing

1. Fork the repository.
2. Create a feature branch: `git checkout -b feature/amazing-feature`.
3. Commit changes: `git commit -m 'Add amazing feature'`.
4. Push to the branch: `git push origin feature/amazing-feature`.
5. Open a Pull Request.

**Code Standards**  
- Follow [Airbnb JavaScript Style Guide](https://airbnb.io/javascript/).
- Write unit tests for new features.

---

## 📜 License

Distributed under the MIT License. See [LICENSE](LICENSE) for details.

---
