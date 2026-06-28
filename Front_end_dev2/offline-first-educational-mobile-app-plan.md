# Offline-First Educational Mobile Application

## 3-Week Development Plan

## Collaboration Tools

- Slack (via VS Code; Siya will send the invite link)
- GitHub

## Team Structure

| Role | Responsibility |
| --- | --- |
| Frontend Developer 1 | Authentication, Subjects, Quiz Module |
| Frontend Developer 2 | Dashboard, Progress Tracking, UI Components |
| Backend Developer | APIs, Database, Authentication, Quiz Logic |
| Business Analyst | Requirements, Documentation, Testing, Project Coordination |

## Week 1: Project Setup & Planning

### Objective
Establish the project foundation, development environment, database structure, and system designs.

### Business Analyst
**Tasks**
- Finalize project requirements
- Create user stories
- Create product backlog
- Complete use case diagram
- Complete ERD diagram
- Finalize Figma wireframes
- Prepare sprint backlog

**Deliverables**
- Approved requirements document
- User stories
- ERD diagram
- Use case diagram
- Figma wireframes

### Frontend Developer 1
**Authentication Module**

**Tasks**
- Set up React Native project
- Configure Expo
- Set up React Navigation
- Create login screen
- Create registration screen
- Create forgot password screen

**Deliverables**
- /screens
  - LoginScreen.js
  - RegisterScreen.js
  - ForgotPassword.js
- /navigation
  - AppNavigator.js

### Frontend Developer 2
**UI Framework**

**Tasks**
- Create theme colors
- Create reusable components
- Create buttons
- Create cards
- Create inputs
- Create loading components

**Deliverables**
- /components
  - Button.js
  - Card.js
  - Input.js
  - Loader.js
- /theme
  - colors.js

### Backend Developer
**Authentication Services**

**Tasks**
- Set up Node.js backend
- Set up Express server
- Configure SQLite database
- Create user table
- Create authentication APIs

**Deliverables**
- POST /login
- POST /register
- GET /users

## Week 2: Core Student Features

### Objective
Develop the dashboard and subject management functionality.

### Business Analyst
**Tasks**
- Review sprint progress
- Update documentation
- Create test cases
- Review Figma screens
- Track team progress

**Deliverables**
- Test cases
- Updated documentation
- Sprint report

### Frontend Developer 1
**Subject Module**

**Tasks**
- Create subject list screen
- Create subject details screen
- Implement search functionality
- Display learning content

**Deliverables**
- SubjectScreen.js
- SubjectDetailsScreen.js
- SearchSubjects.js

### Frontend Developer 2
**Dashboard Module**

**Tasks**
- Create student dashboard
- Create dashboard cards
- Create progress summary section
- Display subject statistics

**Deliverables**
- DashboardScreen.js
- ProgressCard.js
- StatsCard.js

### Backend Developer
**Subject APIs**

**Tasks**
- Create subjects table
- Create CRUD operations
- Connect API to SQLite database

**Deliverables**
- GET /subjects
- POST /subjects
- PUT /subjects
- DELETE /subjects

## Week 3: Quiz & Progress Tracking

### Objective
Develop quiz functionality and learner progress tracking.

### Business Analyst
**Tasks**
- Test user flows
- Update system documentation
- Review functional requirements
- Prepare sprint review presentation

**Deliverables**
- Test results
- Updated documentation
- Sprint review report

### Frontend Developer 1
**Quiz Module**

**Tasks**
- Create quiz screen
- Display questions
- Handle answer selection
- Submit quiz answers

**Deliverables**
- QuizScreen.js
- QuestionCard.js
- AnswerSelection.js

### Frontend Developer 2
**Progress Module**

**Tasks**
- Create progress screen
- Create results screen
- Create score dashboard
- Display quiz history

**Deliverables**
- ProgressScreen.js
- ResultsScreen.js
- ScoreDashboard.js

### Backend Developer
**Quiz Services**

**Tasks**
- Create quiz table
- Create quiz APIs
- Create result APIs
- Implement score calculation logic

**Deliverables**
- GET /quiz
- POST /submitQuiz
- GET /results

## End of Week 3 Demo

The following application flow should be fully functional:

Login -> Student Dashboard -> Subject List -> Subject Details -> Quiz -> Results -> Progress Tracking

## MVP Features Completed After Week 3

### Authentication
- Login
- Registration

### Dashboard
- Student Dashboard

### Subjects
- Subject List
- Subject Details

### Quiz Module
- Quiz questions
- Quiz submission
- Quiz results

### Progress Tracking
- View scores
- View performance history

## Sprint Success Criteria

- User can register
- User can login
- User can access dashboard
- User can view subjects
- User can attempt quizzes
- User can receive results
- User progress is stored in database

## Risks and Mitigation

| Risk | Mitigation |
| --- | --- |
| Delayed development | Daily standups |
| Merge conflicts | Feature branch strategy |
| API issues | Early backend development |
| UI delays | Reusable components |
| Requirement changes | Weekly reviews |

## GitHub Branch Strategy

```text
main
├── frontend-auth
├── frontend-dashboard
├── frontend-subjects
├── frontend-quiz
├── backend-api
├── backend-database
└── documentation
```

## Rules

- Never commit directly to main
- Create pull requests for all features
- Review code before merging
- Keep commits small and descriptive

## Expected Outcome After Week 3

A working Minimum Viable Product (MVP) demonstrating:

- Authentication
- Dashboard
- Subject management
- Quiz functionality
- Progress tracking

Ready for Phase 2 enhancements:

- Teacher Dashboard
- Admin Dashboard
- Offline Sync
- Cloud Backup
- AI Features
