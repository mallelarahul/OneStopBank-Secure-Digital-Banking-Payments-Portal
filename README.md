# OneStopBank – Secure Digital Banking & Payments Portal

## Project Description
OneStopBank is a **secure digital banking web application** that enables users to register, authenticate, and manage their bank accounts online. The platform supports core banking features such as **account management, balance tracking, deposits, withdrawals, fund transfers, transaction history, and security controls**.

The system is built with a **modern full-stack architecture** using **Spring Boot (backend)**, **React (frontend)**, and **MySQL (database)**. Security is enforced using **JWT-based authentication** and **PIN-based transaction authorization**, ensuring safe and reliable financial operations.

---

## Key Features
- User Registration & Login (JWT Authentication)
- Account Creation & Management
- Secure PIN-based Transactions
- Deposit, Withdraw & Fund Transfer
- Transaction History Tracking
- User Profile & Security Settings
- Role-based Protected Routes (Frontend)
- Full Frontend–Backend Integration

---

## Project Requirements

### Backend
- Java 17+
- Spring Boot
- Spring Security (JWT)
- Hibernate / JPA
- MySQL 8+
- Maven

### Frontend
- Node.js 18+
- React (Vite)
- TypeScript
- Tailwind CSS
- Axios
- React Router DOM

### Tools
- MySQL Workbench
- Postman / Swagger UI
- VS Code / IntelliJ IDEA

---

## Database Setup (Short)

Create the database:
```sql
CREATE DATABASE banking_portal;
```

Update `application.properties`:
```properties
spring.datasource.url=jdbc:mysql://localhost:3306/banking_portal
spring.datasource.username=root
spring.datasource.password=your_password
spring.jpa.hibernate.ddl-auto=update
```

> Database tables are **automatically created** by Hibernate when the application starts.

---

## How to Run the Project Locally

### Backend (Spring Boot)
```bash
cd BankingPortal-API
mvn clean install
mvn spring-boot:run
```

Backend runs on:
```
http://localhost:8180
```

Swagger UI:
```
http://localhost:8180/swagger-ui/index.html
```

---

### Frontend (React)
```bash
cd frontend
npm install
npm run dev
```

Frontend runs on:
```
http://localhost:5173
```

---

## Authentication Flow
1. User registers via frontend
2. Backend creates user & bank account
3. User logs in → JWT token issued
4. Token stored on frontend
5. Protected routes validated using JWT
6. Financial transactions require a valid PIN

---

## How to Test the Application
- Register a new user from the frontend
- Login and verify JWT token storage
- Deposit money and verify balance updates
- Perform fund transfers using PIN
- View transaction history
- Verify records in MySQL database

---

## Project Outcome
- Demonstrates **real-world digital banking workflows**
- Implements **secure authentication and authorization**
- Provides **end-to-end full-stack integration**
- Suitable for **3+ years experience** roles:
  - Java Full Stack Developer
  - Backend Engineer
  - Financial Application Developer

---

## Why This Project Is Used
This project simulates a **real digital banking system** used by financial platforms to securely manage users, accounts, and financial transactions while maintaining scalability and compliance-level security.

---

## License
This project is for **educational and demonstration purposes**.
