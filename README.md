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
- register accounts through the authentication workflow
- retrieve the authenticated profile through `/api/users/me`
- enforce ownership on user-scoped resources

### Authentication and security
- short-lived JWT access tokens plus rotating opaque refresh tokens
- refresh-token revocation on logout and password change
- JSON responses for unauthenticated and forbidden requests
- authentication rate limiting and configurable CORS

### Goal profiles
- create goal profiles
- get active goal profile
- get goal profile history
- get goal profile by id
- preserve historical goal changes
- define measurable weight, body-fat, muscle-mass and target-date goals
- define intended training frequency and ordered priority muscle groups

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

### Workout session setup (current development branch)
- start a free workout or initialize a real session from a planned workout day
- copy ordered planned exercises and pending sets into the session on creation, preserving the original plan
- select muscle groups automatically (based on primary and secondary exercise activation) or manually
- store session-level muscle classification separately from actual performed-series statistics
- make legacy category and session-wide intensity optional; use recorded RPE/RIR on each set
- `GET /api/users/{userId}/workout-sessions/{workoutSessionId}/muscle-groups` returns the resolved session group labels

### Workout execution
- create workout sessions
- list workout sessions
- filter workout sessions by date range
- get workout session by id
- add performed exercises to a real workout session
- list performed exercises of a real workout session
- update, complete, cancel or delete non-completed sessions
- update/delete performed exercises and individual set logs
- derive exercise summaries from set logs

### Exercise catalog and discovery
- store image, thumbnail, and accessible alternative text per concrete exercise variant
- search variants by name or code
- filter by one or more equipment types
- filter by canonical muscles or muscle groups
- exclude stabilizers from aggregate discovery by default
- return paginated results suitable for web and mobile clients

### Workout plan structure
- create a workout plan with ordered days and ordered exercises
- retrieve the complete ordered plan structure
- reorder every exercise of an active workout day using stable database ids
- replace a complete active structure as a new historical version
- duplicate a previous structure into a new plan family

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
- PostgreSQL/Flyway integration test with Testcontainers
- Actuator health endpoint, Docker Compose and CI workflow

### Progress and training statistics
- register body-weight, body-fat, and muscle-mass measurements
- compare any training period with the immediately previous period
- report workouts, duration, completed sets, volume, and estimated one-repetition maximum
- distribute effective sets and volume across primary and secondary muscle groups
- exclude stabilizers from accumulated muscle distribution
- compare training adherence and measured trends with the active user goal
- return `INSUFFICIENT_DATA` when the available data cannot support a progress claim
- count only completed sessions and smooth body-measurement trends
- report the current value, remaining distance and completion percentage for measurable goals

### Training recommendations
- generate conservative training/recovery recommendations from the previous 28 days
- keep recommendation history and explicit pending/accepted/rejected states
- never mutate a workout plan automatically when a recommendation is accepted

### Exercise media
- upload JPEG, PNG or WebP media to a concrete variant through an administrator-only endpoint
- store media on a configurable filesystem path and expose stable URLs
- keep missing media as `null` until an original or licensed illustration is assigned

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
- `POST /api/auth/register`
- `POST /api/auth/login`
- `POST /api/auth/refresh`
- `POST /api/auth/logout`
- `POST /api/auth/change-password`
- `GET /api/users/me`
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
- `GET /api/users/{userId}/workout-plans/{workoutPlanId}/detail`
- `PUT /api/users/{userId}/workout-plans/{workoutPlanId}/days/{workoutDayId}/exercise-order`
- `PUT /api/users/{userId}/workout-plans/{workoutPlanId}`
- `POST /api/users/{userId}/workout-plans/{workoutPlanId}/duplicate`

### Exercise discovery
- `GET /api/exercise-variants/search`
- optional parameters: `q`, `equipment`, `muscleCode`, `muscleGroup`, `includeStabilizers`, `page`, and `size`

### Progress and statistics
- `POST /api/users/{userId}/progress-records`
- `GET /api/users/{userId}/progress-records`
- `GET /api/users/{userId}/training-statistics`

### Diet plans
- `POST /api/users/{userId}/diet-plans`
- `GET /api/users/{userId}/diet-plans`
- `GET /api/users/{userId}/diet-plans/active`
- `GET /api/users/{userId}/diet-plans/{dietPlanId}`

### Workout sessions
- `POST /api/users/{userId}/workout-sessions`
- `GET /api/users/{userId}/workout-sessions`
- `GET /api/users/{userId}/workout-sessions/{workoutSessionId}`
- `PATCH /api/users/{userId}/workout-sessions/{workoutSessionId}`
- `POST /api/users/{userId}/workout-sessions/{workoutSessionId}/complete`
- `POST /api/users/{userId}/workout-sessions/{workoutSessionId}/cancel`
- `DELETE /api/users/{userId}/workout-sessions/{workoutSessionId}`
- `POST /api/users/{userId}/workout-sessions/{workoutSessionId}/exercises`
- `GET /api/users/{userId}/workout-sessions/{workoutSessionId}/exercises`
- `PUT/DELETE /api/users/{userId}/workout-sessions/{workoutSessionId}/exercises/{sessionExerciseId}`
- `POST/GET/PUT/DELETE /api/users/{userId}/workout-session-exercises/{sessionExerciseId}/sets`

### Training recommendations
- `POST /api/users/{userId}/training-recommendations/generate`
- `GET /api/users/{userId}/training-recommendations`
- `POST /api/users/{userId}/training-recommendations/{recommendationId}/accept`
- `POST /api/users/{userId}/training-recommendations/{recommendationId}/reject`

### Exercise media
- `POST /api/exercise-variants/{code}/media` (`ADMIN`)
- `GET /media/exercises/{fileName}`

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

### FitCore Test Lab

With the API running, open:

- `http://localhost:8080/fitcore-lab/`

The local test client groups the catalogue by base exercise and lets the user configure equipment,
grip and the other execution attributes before showing the body map. It also covers workout-plan
editing, real session and set logging, goals, progress statistics, recommendations, and HTTP
diagnostics. Nutrition is intentionally excluded while that domain remains under review.

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
spring.jpa.hibernate.ddl-auto=validate
```

Adjust these values to match your local setup.

---

## Docker development environment

Provide secrets through environment variables and start both services:

```powershell
$env:DB_PASSWORD="choose-a-database-password"
$env:JWT_SECRET="a-base64-encoded-key-of-at-least-256-bits"
docker compose up --build
```

Exercise images are persisted in the `fitcore-media` volume. PostgreSQL data is persisted in
`fitcore-postgres`.

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
- JWT authentication and ownership authorization
- Flyway migrations
- canonical exercise and muscle catalogs
- body-map demonstration client and integrated FitCore Test Lab
- exercise discovery filters and paginated search
- ordered workout-plan structures
- comparative training statistics and conservative goal-progress assessment

The remaining major backend work is deliberately concentrated in richer nutrition workflows,
email-based verification/password recovery, and completion of the actual media catalog. The API
can upload and serve variant media, but original or properly licensed exercise illustrations still
need to be created and assigned before clients can display a complete exercise-image library.

Production web and mobile clients remain a later phase. The integrated Test Lab now provides a
responsive reference client for validating the stable API workflows during backend development.

---

## Future improvements

Possible future improvements include:

- richer daily evaluation and recommendation flows
- more complete progress tracking features
- frontend application
- deployment

---

## Author

Gabriel Diaz
