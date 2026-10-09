# Workshop Registration Service

A full-stack web application for managing workshops and attendee registrations. The system provides role-based access control, workshop management, registration and cancellation, registration history, and capacity management to prevent over-registration.

## Tech Stack

| Layer       | Technology              |
| ----------- | ----------------------- |
| Frontend    | React, Vite, JavaScript |
| HTTP Client | Axios                   |
| Backend     | Java, Spring Boot       |
| API         | REST API                |
| Database    | MySQL                   |

## Features

* **Role-based access control:** Admin, Manager, and Staff roles.
* **User management:** Admins can create user accounts and assign roles.
* **Workshop management:** Create, update, and view workshops.
* **Workshop search and filtering:** Filter workshops by date range, status, and available seats.
* **Attendee registration:** Register attendees using their name and email address.
* **Registration cancellation:** Cancel registrations while retaining historical records.
* **Registration history:** Track registration and cancellation details.
* **Capacity management:** Validate workshop capacity on the backend before accepting registrations.
* **REST API integration:** Connect the React frontend with the Spring Boot backend.

## Prerequisites

Install the following before running the application:

* [Node.js and npm](https://nodejs.org/)
* [Java JDK](https://adoptium.net/) compatible with the backend project
* [MySQL Server](https://dev.mysql.com/downloads/mysql/)
* [Apache Maven](https://maven.apache.org/) (if the project does not include Maven Wrapper)
* Git

## Getting Started

### 1. Clone the Repository

```bash
git clone https://github.com/LinalUthsara/Workshop
cd workshop-registration-service
```

### 2. Configure the MySQL Database

Start MySQL and create the database:

```sql
CREATE DATABASE workshophub;
```

Configure the database connection in the backend's `application.properties` file or through environment variables.

Example configuration:

```properties
spring.datasource.url=jdbc:mysql://localhost:3306/workshophub
spring.datasource.username=${DB_USERNAME:root}
spring.datasource.password=${DB_PASSWORD}

spring.jpa.hibernate.ddl-auto=update
```

Set `DB_PASSWORD` to your local MySQL password. Use the database name and property names expected by your actual backend configuration.

### 3. Run the Backend

Open a terminal and navigate to the backend directory:

```bash
cd Backend
```

Run the Spring Boot application using Maven:

```bash
mvn spring-boot:run
```

Alternatively, if Maven Wrapper is included:

**Windows:**

```bash
mvnw.cmd spring-boot:run
```

**Linux/macOS:**

```bash
./mvnw spring-boot:run
```

The backend will usually start at:

```text
http://localhost:8080
```

Confirm the actual port in your backend configuration.

### 4. Configure and Run the Frontend

Open a separate terminal:

```bash
cd Frontend
npm install
```

Start the Vite development server:

```bash
npm run dev
```

Open the URL displayed in the terminal, commonly:

```text
http://localhost:5173
```

## API Endpoints

The following table describes the intended API operations. Confirm the exact paths against your Spring Boot controllers.

| Method | Endpoint                         | Description                     |
| ------ | -------------------------------- | ------------------------------- |
| POST   | `/api/auth/login`                | Authenticate a user             |
| GET    | `/api/workshops`                 | List and filter workshops       |
| GET    | `/api/workshops/{id}`            | Get workshop details            |
| POST   | `/api/workshops`                 | Create a workshop               |
| PUT    | `/api/workshops/{id}`            | Update a workshop               |
| POST   | `/api/registrations`             | Register an attendee            |
| GET    | `/api/registrations`             | View registrations              |
| PUT    | `/api/registrations/{id}/cancel` | Cancel a registration           |
| GET    | `/api/registrations/history`     | View registration history       |
| POST   | `/api/users`                     | Create a user and assign a role |

**Note:** These are representative endpoints, not a verified list of implemented routes. Update them to match the actual API.

## Preventing Over-Registration

Workshop capacity is enforced by the backend rather than relying only on frontend validation.

Before accepting a registration, the backend checks the number of active registrations against the workshop's capacity. To handle concurrent requests safely, the capacity check and registration insert should be performed within a transaction with suitable concurrency control, such as locking the relevant workshop row.

Cancelled registrations should no longer count towards capacity, while their records remain available for historical review.

The concurrency-control approach described here should match the method implemented in the source code.


## Assumptions and Limitations

* Each registration represents one attendee identified by name and email.
* Cancelled registrations are retained for historical review.
* The first administrator account may be seeded for initial setup.
* Features such as waitlists, advanced reporting, and deployment may be outside the current assessment scope.

## Future Improvements

* Automated unit and integration tests.
* Docker-based local development.
* CI/CD pipeline and cloud deployment.
* Waitlist support and email notifications.
* Expanded audit logging and reporting.

