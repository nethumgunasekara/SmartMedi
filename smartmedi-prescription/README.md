# SmartMedi — Prescription Management module

A real, working slice of SmartMedi: full CRUD for prescriptions, backed by
an actual database via Spring Data JPA, with server-side validation on
every write. This is not a mockup — every endpoint below genuinely reads
from and writes to a database when you run it.

## What's in here

```
src/main/java/com/smartmedi/
  SmartMediApplication.java          - entry point
  prescription/
    Prescription.java                - the entity (JPA + validation annotations)
    PrescriptionStatus.java          - NEW / APPROVED / PARTIALLY_DISPENSED / ...
    PrescriptionRepository.java      - Spring Data JPA - real SQL, no boilerplate
    PrescriptionService.java         - CRUD logic + QR code generation
    PrescriptionController.java      - REST endpoints (Create, Read, Update, Delete)
    PrescriptionNotFoundException.java
    GlobalExceptionHandler.java      - turns validation/not-found errors into clean JSON
src/main/resources/application.properties   - database config (H2 by default)
src/test/java/.../PrescriptionControllerTest.java  - integration test, runs against a real DB
```

## Running it

You need Java 17+ and Maven (both bundled with IntelliJ, or install Maven
separately). From this folder:

```
mvn spring-boot:run
```

The app starts on `http://localhost:8080`. It uses an in-memory H2
database by default, so there's nothing to install first.

## Trying the CRUD endpoints

With the app running, in another terminal:

```bash
# Create
curl -X POST http://localhost:8080/api/prescriptions \
  -H "Content-Type: application/json" \
  -d '{"patientName":"S. Perera","doctorName":"Dr. Fernando","medicineName":"Amoxicillin 500mg","dosage":"1 tablet","frequency":"Twice daily","durationDays":7,"validUntil":"2026-12-01"}'

# Read all
curl http://localhost:8080/api/prescriptions

# Read one (replace 1 with the id you got back from Create)
curl http://localhost:8080/api/prescriptions/1

# Update
curl -X PUT http://localhost:8080/api/prescriptions/1 \
  -H "Content-Type: application/json" \
  -d '{"patientName":"S. Perera","doctorName":"Dr. Fernando","medicineName":"Amoxicillin 500mg","dosage":"2 tablets","frequency":"Twice daily","durationDays":7,"validUntil":"2026-12-01"}'

# Delete
curl -X DELETE http://localhost:8080/api/prescriptions/1

# Try an invalid one - this should come back 400 with field-level errors
curl -X POST http://localhost:8080/api/prescriptions -H "Content-Type: application/json" -d '{}'
```

Or just hit the same URLs from Postman / your browser (GET requests only
work directly in a browser; use Postman or curl for POST/PUT/DELETE).

You can also browse the actual database tables while the app is running,
at `http://localhost:8080/h2-console` — JDBC URL `jdbc:h2:mem:smartmedi`,
user `sa`, blank password.

## Proving it actually works

```
mvn test
```

This runs a real integration test that creates a prescription, reads it
back, updates it, deletes it, and confirms it's gone — against the real
database, not a mock. It also checks that an empty/invalid submission and
a past validity date both get rejected.

## Switching to MySQL for your submission

Open `application.properties`, comment out the H2 block, and uncomment
the MySQL block, filling in your own username/password. Nothing else in
the project changes — that's the benefit of Spring Data JPA over
hand-written SQL: the entity, repository, service and controller are
database-agnostic.

## What this covers vs. what's still needed

Genuinely working right now: CRUD operations, the database connection,
and input validation — for the Prescription Management module.

Not yet covered: the other five modules (QR verification, inventory,
dispensing, patient history, admin/reporting), and there's no UI yet —
this is a REST API only. Say the word and we can build a simple frontend
next so the UI Design criterion has something real behind it too.
