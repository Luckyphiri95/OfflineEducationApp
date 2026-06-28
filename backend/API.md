# Offline Education App - Backend API Documentation

## Base URL
http://localhost:5000/api

---

# 🔐 Authentication

## Register User
POST /auth/register

### Body
{
  "username": "John",
  "email": "john@gmail.com",
  "password": "123456"
}

### Response
{
  "message": "User registered successfully",
  "userId": 1
}

---

## Login User
POST /auth/login

### Body
{
  "email": "john@gmail.com",
  "password": "123456"
}

### Response
{
  "message": "Login successful",
  "user": {
    "id": 1,
    "username": "John",
    "email": "john@gmail.com"
  }
}

---

## Get All Users
GET /auth/users

### Response
[
  {
    "id": 1,
    "username": "John",
    "email": "john@gmail.com",
    "created_at": "2026-01-01"
  }
]

---

# 📚 Subjects

## Get All Subjects
GET /subjects

### Response
[
  {
    "id": 1,
    "name": "Mathematics",
    "description": "Basic algebra",
    "created_at": "2026-01-01"
  }
]

---

## Create Subject
POST /subjects

### Body
{
  "name": "Mathematics",
  "description": "Basic algebra"
}

### Response
{
  "message": "Subject created successfully",
  "subjectId": 1
}

---

## Update Subject
PUT /subjects/:id

### Body
{
  "name": "Updated Name",
  "description": "Updated description"
}

---

## Delete Subject
DELETE /subjects/:id

### Response
{
  "message": "Subject deleted successfully"
}

---

# 🧠 Quiz System

## Get Quiz Questions
GET /quiz

### Response
[
  {
    "id": 1,
    "subject_id": 1,
    "question": "What is 2 + 2?",
    "option_a": "1",
    "option_b": "2",
    "option_c": "4",
    "option_d": "5",
    "correct_answer": "4"
  }
]

---

## Submit Quiz
POST /submitQuiz

### Body
{
  "user_id": 1,
  "subject_id": 1,
  "answers": {
    "1": "4",
    "2": "Pretoria"
  }
}

### Response
{
  "message": "Quiz submitted",
  "score": 2,
  "total": 2,
  "resultId": 1
}

---

## Get Results
GET /results

### Response
[
  {
    "id": 1,
    "user_id": 1,
    "subject_id": 1,
    "score": 2,
    "total_questions": 2,
    "completed_at": "2026-01-01"
  }
]

---

# 📌 Notes
- SQLite database used for storage
- Passwords are hashed using bcrypt
- Quiz scoring is handled automatically in backend