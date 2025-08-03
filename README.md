# DocConnect - Smart Access to Medical Care

**DocConnect** is an AI-powered web application designed to revolutionise healthcare accessibility and efficiency by facilitating intelligent, secure, and user-friendly healthcare management. This project is the final year capstone submission for the Bachelor of Science in Computer Science at SZABIST University, Islamabad.

## 🚀 Project Overview

DocConnect bridges the gap between patients and healthcare providers by integrating advanced technologies such as:

* Optical Character Recognition (OCR) for prescription analysis
* AI-powered health predictions and disease detection
* Virtual video consultations
* Smart dashboards for patients and doctors
* Secure, role-based access and authentication

The platform simplifies tasks like appointment scheduling, prescription tracking, and virtual consultation through a mobile-friendly interface and real-time data updates.

---

## ✨ Features

### 🧠 AI & OCR

* Disease prediction based on symptoms and reports
* Intelligent prescription analysis
* Personalized health suggestions

### 📅 Patient Services

* Schedule physical and virtual appointments
* Upload prescriptions and reports
* Automated reminders and notifications
* Lab test bookings & sample collection

### 🧑‍⚕️ Doctor Interface

* Real-time patient analytics
* Virtual video/audio sessions with patients
* Custom role-based data access

### 📊 Admin Dashboard

* User management and analytics
* Activity logs and system overview
* Secure login and session control

### 🩺 Virtual Health Assistant

* 24/7 availability
* Health tips, reminders, and medication details
* Follow-up management

---

## 🏥 Target Users

* Patients (especially elderly & chronically ill)
* Physicians, nurses, and administrative staff
* Hospitals, clinics, and diagnostic centers
* Digital health startups and telemedicine providers

---

## 💡 Objectives

* Enhance healthcare accessibility for patients across demographics
* Automate and streamline medical processes using OCR and AI
* Improve communication between patients and healthcare providers
* Reduce medication errors and improve diagnosis accuracy

---

## 🛠️ Tech Stack

| Layer    | Technology Used                              |
| -------- | -------------------------------------------- |
| Frontend | Next.js, React, TypeScript                   |
| Backend  | Next.js, Flask                               |
| AI/ML    | Python, OpenCV, Tesseract, Scikit-learn      |
| OCR      | Tesseract OCR                                |
| Database | MongoDB / PostgreSQL                         |
| DevOps   | Docker                                       |

---

## 📁 Modules

* 🔐 **Authentication & Access Control**
* 📦 **Prescription & Report Upload (OCR)**
* 📅 **Appointment Booking (Real-time availability)**
* 🧪 **Home Lab Testing**
* 🧬 **Health Predictions & Dashboards**
* 💬 **Virtual Assistant & P2P Chat**
* 💳 **Payment Gateway**
* 📈 **Admin & Analytics Panel**

---
## 🚀 Quick Start

### 📦 Clone the Repository

```bash
git clone https://github.com/your-username/docconnect.git
cd docconnect
```

---

## 🐳 Run with Docker (Production)

### Build and Run with Docker Compose

```bash
docker-compose up --build
```

Your app will be available at:

* Frontend: [http://localhost:3000](http://localhost:3000)
* Backend: [http://localhost:5000](http://localhost:5000)

### 🐋 Sample `docker-compose.yml`

```yaml
version: "3.8"

services:
  frontend:
    build: ./frontend
    ports:
      - "3000:3000"
    restart: unless-stopped

  backend:
    build: ./backend
    ports:
      - "5000:5000"
    restart: unless-stopped
```

### Optional: Run Individual Containers

```bash
# Backend
cd Backend
docker build -t docconnect-backend .
docker run -p 5000:5000 docconnect-backend

# Frontend
cd .
docker build -t docconnect-frontend .
docker run -p 3000:3000 docconnect-frontend
```

---

## 🧪 Testing

* Unit Testing: User login, appointment booking, symptom-based predictions
* Integration Testing: Account management, AI module
* System Testing: Authentication, performance, and response validation

---

## 🔮 Future Enhancements

* Integration with wearable devices
* Advanced NLP for doctor notes
* Advanced AI for multi-disease prediction
* Cross-region deployment (Kubernetes)

---

## 📜 Authors

* **Qasim Ajab Khan** (2112131)
* **Abdul Muizz** (2112278)
* **Abdullah Siraj** (2112280)

Supervised by: *Mr. Fakhar-ul-Islam*
Shaheed Zulfikar Ali Bhutto Institute of Science and Technology (SZABIST), Islamabad

---

# 📄 License

**DocConnect - Smart Access to Medical Care**

Copyright (c) 2025  
Qasim Ajab Khan (2112131)  
Abdul Muizz (2112278)  
Abdullah Siraj (2112280)  
Supervised by Mr. Fakhar-ul-Islam  
Shaheed Zulfikar Ali Bhutto Institute of Science and Technology (SZABIST), Islamabad

---

## [Academic Use Only License](./LICENSE.md)

This project is submitted as a **Final Year Project** in partial fulfillment of the requirements for the degree of **Bachelor of Science (Computer Science)**.

You are permitted to:

- View and study the source code for educational purposes.
- Reference the ideas, concepts, or structure with proper citation.

You are **not permitted to**:

- Use this code for any commercial purpose.
- Redistribute this project or its derivatives without explicit written permission from the original authors.
- Claim authorship or ownership over this project or its components.
- Publish or upload substantial parts of this work to commercial platforms without proper attribution.

---

## Disclaimer

This software is provided *"as is"*, without warranty of any kind. It is meant solely for academic demonstration and is not intended for use in production environments or real-world healthcare deployment without extensive review and certification.

For permissions beyond the scope of this license, please contact the original authors via GitHub or through SZABIST University.
