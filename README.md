# ShieldKe Backend

Backend API for **ShieldKe**, a Kenyan legal-tech platform that connects clients with verified lawyers for consultations and real-time communication.

This backend provides authentication, consultation management, messaging, and role-based access control for the ShieldKe platform.

---

## Overview

ShieldKe enables clients to request legal consultations from lawyers and communicate through a secure chat system once a consultation is accepted.

The backend is responsible for:

* User authentication and authorization
* Consultation request management
* Lawyer and client dashboards
* Real-time messaging using Socket.IO
* Role-based access control
* Secure API endpoints

---

## Tech Stack

* **Node.js**
* **Express.js**
* **MongoDB**
* **Mongoose**
* **JWT Authentication**
* **Socket.IO**
* **bcrypt**
* **dotenv**

---

## Project Structure

```
server/
│
├── controllers/
│   ├── authController.js
│   ├── consultationController.js
│   └── messageController.js
│
├── middleware/
│   └── authMiddleware.js
│
├── models/
│   ├── User.js
│   ├── Consultation.js
│   └── Message.js
│
├── routes/
│   ├── authRoutes.js
│   ├── consultationRoutes.js
│   └── messageRoutes.js
│
├── socket/
│   └── socket.js
│
├── config/
│   └── db.js
│
├── server.js
└── package.json
```

---

## Environment Variables

Create a `.env` file in the root directory.

```
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_secret_key
```

---

## Installation

Clone the repository

```
git clone https://github.com/Njonjo12/ShieldKe.git
```

Navigate into the backend folder

```
cd server
```

Install dependencies

```
npm install
```

Start the development server

```
npm run dev
```

Or start normally

```
node server.js
```

Server will run on:

```
http://localhost:5000
```

---

## Authentication

ShieldKe uses **JWT-based authentication**.

After login, the client must include the token in requests:

```
Authorization: Bearer <token>
```

---

## API Endpoints

### Authentication

#### Register User

```
POST /api/auth/register
```

Request body

```
{
  "name": "Kelvin",
  "email": "kelvin@email.com",
  "password": "password123",
  "role": "client"
}
```

Roles supported:

```
client
lawyer
```

---

#### Login

```
POST /api/auth/login
```

Response:

```
{
  "token": "JWT_TOKEN",
  "user": {
    "_id": "...",
    "name": "Kelvin",
    "role": "client"
  }
}
```

---

## Consultations

### Create Consultation (Client)

```
POST /api/consultations
```

Body

```
{
  "lawyerId": "LAWYER_ID",
  "message": "Need legal advice"
}
```

---

### Get Client Consultations

```
GET /api/consultations/client
```

Returns consultations requested by the logged-in client.

---

### Get Lawyer Consultations

```
GET /api/consultations/lawyer
```

Returns consultation requests sent to the lawyer.

---

### Update Consultation Status

```
PUT /api/consultations/:id/status
```

Body

```
{
  "status": "accepted"
}
```

Possible statuses:

```
pending
accepted
rejected
```

---

## Messaging

Messages are tied to a consultation.

### Get Consultation Messages

```
GET /api/messages/:consultationId
```

---

## Real-Time Chat

ShieldKe uses **Socket.IO** for live chat.

Events:

Join consultation room

```
joinRoom(consultationId)
```

Send message

```
sendMessage({
  consultation,
  sender,
  text
})
```

Receive message

```
receiveMessage(message)
```

---

## Security

The backend implements:

* JWT authentication
* Role-based authorization
* Protected routes
* Password hashing using bcrypt
* Request validation

---

## Debug Endpoint

Development-only endpoint to inspect consultations.

```
GET /api/consultations/debug/all
```

Returns all consultations with populated client and lawyer data.

Remove this route before production.

---

## Future Improvements

Planned backend improvements include:

* Payment integration
* Lawyer verification system
* Consultation scheduling
* File sharing in chat
* Automated dispute resolution
* Notification system

---

## License

MIT License

---

## Author

Kelvin Njonjo
Founder — ShieldKe
