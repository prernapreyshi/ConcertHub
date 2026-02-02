# 🎶 ConcertHub – Full Stack Concert Ticket Booking System

ConcertHub is a **full-stack concert ticket booking application** that allows users to select seats, lock them temporarily, make payments, and receive confirmed bookings with barcode-based tickets.

This project is designed to simulate a **real-world ticket booking system** using a featured **Arijit Singh Live Concert** use case.

---

**Live Demo:** 
https://concert-hub-wfui.vercel.app

---

##  Features

### 🎤 Concert Details
- Single featured concert (Arijit Singh Live)
- Displays artist, venue, date, time, and ticket price

###  Seat Booking System
- Interactive seat layout with rows and seat numbers
- Seat states:
  - `available`
  - `selected`
  - `locked`
  - `booked`
- Prevents double booking

###  Seat Locking
- Seats are locked for a limited time (5 minutes)
- Auto-unlock on logout or cancellation
- Lock ownership per user

### User Authentication
- User registration and login
- Authentication handled on backend (demo-ready logic)

### Payment Integration
- Razorpay payment flow (backend-ready)
- Secure order creation and verification
- Payment simulation supported for development

### Booking & Ticket Generation
- Unique booking ID for each order
- Booking history per user
- Barcode string generated for each ticket

---

## Tech Stack

### Frontend
- **Next.js (App Router)**
- **React**
- **TypeScript**
- **Context API**
- **Tailwind CSS**
- **ShadCN UI**

### Backend
- **Node.js**
- **Next.js API Routes**
- **MongoDB** (Bookings, users, seats)
- **Redis** (Seat locking & temporary state)
- **Razorpay** (Payment processing)

---


---

## Installation & Setup

1️⃣ Clone the Repository

git clone https://github.com/prernapreyshi/ConcertHub.git
cd ConcertHub

2️⃣ Install Dependencies
npm install

3️⃣ Environment Variables
Create a .env.local file in the root directory.

4️⃣ Run the Application
npm run dev


