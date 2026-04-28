# FitCore API

Backend API for fitness coaching, workout planning, nutrition planning, execution tracking, and user progress management.

FitCore API is a professional portfolio project built to model a realistic fitness domain with a strong focus on:

- clean domain design
- separation between **planning** and **real execution**
- historical/versioned data
- scalable package structure
- validation, testing, and API documentation

---

## Project purpose

The goal of the project is to provide a backend capable of managing the main workflows of a fitness coaching application:

- user management
- goal definition and historical goal changes
- workout plan creation and versioning
- diet plan creation and versioning
- real workout session tracking
- real nutrition tracking
- future support for daily evaluation and adjustment recommendations

A core design principle of the project is that **plans and execution are not the same thing**.

That means the system distinguishes between:

- what was **planned**
- what the user **actually did**

This makes the model much more realistic and better suited for future analysis, adherence tracking, and intelligent plan adjustments.

---

## Main design principles

### 1. Planning and execution are separated

Workout plans and diet plans represent the intended structure.

Real execution is stored separately through entities such as:

- `WorkoutSession`
- `WorkoutSessionExercise`
- `NutritionLog`
- `NutritionLogMeal`
- `NutritionLogMealFood`

This allows the API to support both:

- static plan usage without detailed tracking
- optional real-life logging and analysis

### 2. Historical versioning is preserved

The project supports historical/versioned data for:

- `GoalProfile`
- `WorkoutPlan`
- `DietPlan`

Instead of overwriting old data, new versions are created and linked to previous ones. This makes the model much more professional and future-proof.

### 3. Logs derive from the plan, but remain flexible

Examples:

- a `WorkoutSessionExercise` references `WorkoutExercise`
- a `NutritionLog` can optionally be linked to a `DietDay`
- a `NutritionLogMeal` can come from a `PlannedMeal` or be an extra meal

This keeps traceability while still allowing real-world flexibility.

---

## Current functional scope

### User management
- create users
- list users
- get user by id

### Goal profiles
- create goal profiles
- get active goal profile
- get goal profile history
- get goal profile by id
- preserve historical goal changes

### Workout plans
- create workout plans
- get active workout plan
- get workout plan history
- get workout plan by id
- support plan versioning

### Diet plans
- create diet plans
- get active diet plan
- get diet plan history
- get diet plan by id
- support plan versioning

### Workout execution
- create workout sessions
- list workout sessions
- filter workout sessions by date range
- get workout session by id
- add performed exercises to a real workout session
- list performed exercises of a real workout session

### Nutrition execution
- create nutrition logs
- list nutrition logs
- filter nutrition logs by date range
- get nutrition log by date
- add foods to real nutrition log meals
- list foods of a real nutrition log meal

### API quality features
- request validation
- structured global error handling
- i18n-ready validation and error messages
- Swagger / OpenAPI documentation
- service-layer tests
- web-layer tests

---

## Tech stack

- **Java 21**
- **Spring Boot 3.5.11**
- **Spring Web**
- **Spring Data JPA / Hibernate**
- **PostgreSQL**
- **Maven**
- **Spring Validation**
- **Springdoc OpenAPI / Swagger UI**
- **JUnit 5**
- **Mockito**

---

## Package structure

The project follows a **feature-based package structure**.

```text
com.gabri.fitcoreapi
├── common
├── config
├── exercise
├── goal
├── nutrition
├── progress
├── recommendation
├── user
└── workout
```

Each feature typically contains:

- `domain`
- `dto`
- `repository`
- `service`
- `web`

This structure keeps the project more modular and scalable than a flat layer-only package layout.

---

## Important domain entities

### Core entities
- `User`
- `GoalProfile`
- `WorkoutPlan`
- `WorkoutDay`
- `Exercise`
- `WorkoutExercise`
- `WorkoutSession`
- `WorkoutSessionExercise`
- `DietPlan`
- `DietDay`
- `Food`
- `PlannedMeal`
- `PlannedMealFood`
- `NutritionLog`
- `NutritionLogMeal`
- `NutritionLogMealFood`
- `ProgressRecord`
- `DailyEvaluation`
- `PlanAdjustmentRecommendation`

### Important relationships and rules
- `GoalProfile` is a dedicated entity, not just a field inside `User`
- `WorkoutPlan` and `DietPlan` support historical versioning
- `GoalProfile` also keeps historical changes over time
- `WorkoutSessionExercise` references `WorkoutExercise`
- `NutritionLog` represents the real day
- `NutritionLogMeal` represents the real meal of the day
- `NutritionLogMealFood` represents real consumed foods inside that meal
- `NutritionLog` can optionally be linked to a `DietDay`
- `NutritionLogMeal` can come from a `PlannedMeal` or be an extra meal

---

## API overview

### Users
- `POST /api/users`
- `GET /api/users`
- `GET /api/users/{userId}`

### Goal profiles
- `POST /api/users/{userId}/goal-profiles`
- `GET /api/users/{userId}/goal-profiles`
- `GET /api/users/{userId}/goal-profiles/active`
- `GET /api/users/{userId}/goal-profiles/{goalProfileId}`

### Workout plans
- `POST /api/users/{userId}/workout-plans`
- `GET /api/users/{userId}/workout-plans`
- `GET /api/users/{userId}/workout-plans/active`
- `GET /api/users/{userId}/workout-plans/{workoutPlanId}`

### Diet plans
- `POST /api/users/{userId}/diet-plans`
- `GET /api/users/{userId}/diet-plans`
- `GET /api/users/{userId}/diet-plans/active`
- `GET /api/users/{userId}/diet-plans/{dietPlanId}`

### Workout sessions
- `POST /api/users/{userId}/workout-sessions`
- `GET /api/users/{userId}/workout-sessions`
- `GET /api/users/{userId}/workout-sessions/{workoutSessionId}`
- `POST /api/users/{userId}/workout-sessions/{workoutSessionId}/exercises`
- `GET /api/users/{userId}/workout-sessions/{workoutSessionId}/exercises`

### Nutrition logs
- `POST /api/users/{userId}/nutrition-logs`
- `GET /api/users/{userId}/nutrition-logs`
- `GET /api/users/{userId}/nutrition-logs/by-date`
- `POST /api/users/{userId}/nutrition-logs/{nutritionLogId}/meals/{nutritionLogMealId}/foods`
- `GET /api/users/{userId}/nutrition-logs/{nutritionLogId}/meals/{nutritionLogMealId}/foods`

---

## Validation and error handling

The API includes:

- Jakarta Validation for request validation
- a global exception handler
- structured error response DTOs
- i18n-ready messages through message bundles

This means invalid requests and domain errors are returned in a more consistent and professional format.

---

## Internationalization

The project is prepared for multilingual validation and error messages.

Message keys are externalized into message bundles instead of hardcoding user-facing text directly in Java code.

Current focus:

- English
- Spanish

---

## Swagger / OpenAPI

Swagger UI is enabled for local exploration and testing of the API.

Typical local routes:

- `/swagger-ui/index.html`
- `/api-docs`

This makes it easier to inspect endpoints, request bodies, and responses during development.

---

## Testing strategy

The project currently includes:

- **unit tests** for service-layer business logic
- **web-layer tests** for main REST controllers

The goal is to validate both:

- business rules and versioning behavior
- API contract behavior and response structure

---

## How to run the project

### Requirements
- Java 21
- PostgreSQL
- Maven Wrapper included in the repository

### Run with Maven Wrapper

#### Linux / macOS
```bash
./mvnw spring-boot:run
```

#### Windows PowerShell
```powershell
.\mvnw.cmd spring-boot:run
```

---

## How to run tests

#### Linux / macOS
```bash
./mvnw test
```

#### Windows PowerShell
```powershell
.\mvnw.cmd test
```

---

## Local database configuration

You need a local PostgreSQL database configured in `application.properties`.

Example:

```properties
spring.datasource.url=jdbc:postgresql://localhost:5432/fitcore_api
spring.datasource.username=your_username
spring.datasource.password=your_password
spring.jpa.hibernate.ddl-auto=update
```

Adjust these values to match your local setup.

---

## Current project status

At the current stage, the backend already includes:

- domain modelling
- versioned planning entities
- execution tracking entities
- DTOs
- repositories
- services
- REST controllers
- validation
- global exception handling
- i18n support preparation
- Swagger/OpenAPI
- service and web-layer tests

The next major backend steps planned are:

- Spring Security
- authorization by ownership
- Flyway migrations
- final technical polish

The frontend is planned as a later phase, once the API surface is stable enough to support realistic user flows.

---

## Future improvements

Possible future improvements include:

- authentication and authorization
- database migrations with Flyway
- richer daily evaluation and recommendation flows
- more complete progress tracking features
- frontend application
- deployment

---

## Author

Gabriel Diaz

