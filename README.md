Food Delivery Backend - Authentication Module
This is the authentication module for a food delivery platform, built with Node.js, Express.js, MongoDB Atlas, Redis Cloud, and AfroMessage for OTP-based user verification. It supports user registration, login, OTP verification, token refresh, and role-based access control (RBAC) for roles like customer, restaurant, driver, and admin. The module uses JSON Web Tokens (JWT) for secure authentication and Redis for temporary OTP storage.
Features
User Registration: Create accounts with email, phone, password, and role, triggering an OTP via AfroMessage.
OTP Verification: Verify user phone numbers using AfroMessage’s /challenge and /verify endpoints.
Login: Authenticate users and issue JWT access and refresh tokens.
Token Refresh: Generate new access tokens using refresh tokens.
RBAC: Restrict access based on user roles.
Security: Password hashing with bcrypt, secure HttpOnly cookies, and Redis for OTP storage.
Logging: Winston-based logging for debugging and monitoring.
Testing: Jest and Supertest for unit and integration tests.
Tech Stack
Backend: Node.js, Express.js
Database: MongoDB Atlas
Cache: Redis Cloud
Authentication: JWT, bcrypt
SMS Service: AfroMessage API
Validation: express-validator
Logging: Winston
Testing: Jest, Supertest, mongodb-memory-server
Dependencies: axios, cookie-parser, cors
Prerequisites
Node.js: v18 or higher
MongoDB Atlas: Account with a cluster and database user
Redis Cloud: Account with a database instance
AfroMessage: Account with API token and optional Sender ID/Identifier ID
Postman: For API testing
Docker: Optional, for containerized deployment
Setup Instructions

1. Clone the Repository

```
   git clone <repository-url>
   cd food-delivery-backend
```

2. Install Dependencies

```
   npm install
```

3. Configure Environment Variables
   Create a .env file in the root directory and add the following:
   ```
   PORT=5000
   MONGO_URI=mongodb+srv://<username>:<password>@cluster0.prx1c.mongodb.net/food-delivery?retryWrites=true&w=majority
   JWT_SECRET=your_jwt_secret_key
   JWT_REFRESH_SECRET=your_jwt_refresh_secret_key
   FRONTEND_URL=http://localhost:3000
   AFROMESSAGE_API_TOKEN=your_api_token_from_dashboard
   AFROMESSAGE_SENDER_ID=AfroMessage
   AFROMESSAGE_IDENTIFIER_ID=
   REDIS_URL=redis://default:<password>@redis-12345.c123.us-east-1-2.ec2.cloud.redislabs.com:12345
   MONGO_URI: Replace <username>, <password>, and cluster details with your MongoDB Atlas connection string.
   JWT_SECRET, JWT_REFRESH_SECRET: Generate secure keys using openssl rand -base64 32.
   AFROMESSAGE_API_TOKEN: Get from AfroMessage dashboard under “API Tokens” or “Developer Settings”.
   AFROMESSAGE_SENDER_ID: Use AfroMessage for beta testing; update to your verified Sender Name for production.
   AFROMESSAGE_IDENTIFIER_ID: Leave empty for default identifier; update if using multiple short codes.
   REDIS_URL: Replace <password> and endpoint with your Redis Cloud details.
   ```
4. Set Up MongoDB Atlas

```
   Sign up at MongoDB Atlas.
   Create a project (e.g., FoodDelivery) and a free-tier cluster.
   Add a database user (e.g., fooddeliveryuser) with a strong password.
   In Network Access, add 0.0.0.0/0 to allow all IPs (development only; restrict in production).
   Copy the connection string and update MONGO_URI in .env.
```

5. Set Up Redis Cloud

```
   Sign up at Redis Cloud.
   Create a free-tier database and select a region (e.g., us-east-1).
   Copy the public endpoint and password from the dashboard.
   Update REDIS_URL in .env.
```

6. Set Up AfroMessage

```
   Sign up at AfroMessage and verify your account.
   In the dashboard, find your API token under “API Tokens” or “Developer Settings”.
   Request a Sender ID (e.g., “FoodDelivery”) under “Sender Management” or “SMS Settings” and wait for verification (check email).
   For beta testing, use AFROMESSAGE_SENDER_ID=AfroMessage and leave AFROMESSAGE_IDENTIFIER_ID empty.
   Update .env with verified Sender ID and Identifier ID (if applicable) for production.
```

7. Run the Application
   Development:
   ```
   npm run dev
   ```
   Production (Docker):
   ```
   docker-compose up -d
   ```
   The server will run on http://localhost:5000 (or your configured PORT).
   API Endpoints
   Base URL
   ```
   http://localhost:5000/api/delivery/auth
   ```
   POST /register
   Register a new user and send an OTP via AfroMessage.
   Body (JSON):
   ```
   {
   "email": "test@example.com",
   "phone": "+251912345678",
   "password": "password123",
   "role": "customer"
   }
   ``
   Response (201 Created):
   ```
   {
   "status": "success",
   "data": {
   "userId": "<user-id>",
   "role": "customer"
   }
   }
   ```
   POST /verify-otp
   Verify the OTP sent to the user’s phone.
   Body (JSON):
   ```
   {
   "phone": "+251912345678",
   "otp": "123456"
   }
   ```
   Response (200 OK):
   ```
   {
   "status": "success",
   "data": {
   "userId": "<user-id>",
   "role": "customer"
   }
   }
   ```
   POST /login
   Log in a user and issue JWT tokens.
   Body (JSON):
   ```
   {
   "email": "test@example.com",
   "password": "password123"
   }
   ```
   Response (200 OK):
   ```
   {
   "status": "success",
   "data": {
   "userId": "<user-id>",
   "role": "customer"
   }
   }
   ```
   Cookies: Sets token (access) and refreshToken.
   POST /refresh-token
   Refresh the access token using a refresh token.
   Cookies: refreshToken
   Response (200 OK):
   ```
   {
   "status": "success",
   "data": {
   "userId": "<user-id>",
   "role": "customer"
   }
   }
   ```
   Cookies: Updates token (new access token).
   Testing with Postman
   Install Postman: Download from postman.com/downloads/.
   Create a Collection:
   In Postman, create a collection named “Auth API Tests”.
   Set Up Environment:
   Create an environment (e.g., “Test Env”) with variables:
   baseUrl: http://localhost:5000/api/delivery
   accessToken: (Leave blank, set dynamically)
   refreshToken: (Leave blank, set dynamically)
   Add Requests:
   POST /register:
   ```
   URL: {{baseUrl}}/auth/register
   Headers: Content-Type: application/json
   Body: See above.
   Tests:
   pm.test("Status code is 201", function () {
   pm.response.to.have.status(201);
   });
   pm.test("Response has userId", function () {
   var jsonData = pm.response.json();
   pm.expect(jsonData.data).to.have.property("userId");
   });
   ```
   POST /verify-otp:
   ```
   URL: {{baseUrl}}/auth/verify-otp
   Headers: Content-Type: application/json
   Body: See above.
   Tests:
   pm.test("Status code is 200", function () {
   pm.response.to.have.status(200);
   });
   pm.test("Response has userId", function () {
   var jsonData = pm.response.json();
   pm.expect(jsonData.data).to.have.property("userId");
   pm.environment.set("accessToken", pm.response.json().data.accessToken);
   pm.environment.set("refreshToken", pm.response.json().data.refreshToken);
   });
   ```
   POST /login:
   ```
   URL: {{baseUrl}}/auth/login
   Headers: Content-Type: application/json
   Body: See above.
   Tests:
   pm.test("Status code is 200", function () {
   pm.response.to.have.status(200);
   });
   pm.test("Sets tokens in cookies", function () {
   pm.expect(pm.cookies.get("token")).to.exist;
   pm.expect(pm.cookies.get("refreshToken")).to.exist;
   pm.environment.set("accessToken", pm.cookies.get("token"));
   pm.environment.set("refreshToken", pm.cookies.get("refreshToken"));
   });
   ```
   POST /refresh-token:
   ```
   URL: {{baseUrl}}/auth/refresh-token
   Headers: Cookie: refreshToken={{refreshToken}}
   Tests:
   pm.test("Status code is 200", function () {
   pm.response.to.have.status(200);
   });
   pm.test("Updates access token", function () {
   pm.expect(pm.cookies.get("token")).to.exist;
   pm.environment.set("accessToken", pm.cookies.get("token"));
   });
   Run Collection:
   Use the Collection Runner to execute requests in order.
   Verify all tests pass (e.g., status codes, response data, cookies).
   Error Cases:
   Test invalid inputs (e.g., existing email, wrong password, invalid OTP) and expect 400/401/403 responses.
   Publishing Tests
   In Postman, click the three dots next to “Auth API Tests” and select Publish.
   Choose your workspace and set visibility (e.g., “Team” or “Public”).
   Add a description (e.g., “Tests for food delivery auth API”).
   Copy the shareable link or export the collection as JSON to share with your team.
   Running Unit Tests
   Run Jest tests to verify backend logic:
   npm test
   Uses mongodb-memory-server for in-memory MongoDB testing.
   Mocks AfroMessage API calls with Jest.
   Deployment
   Local Deployment:
   ```
   Run npm run dev for development with nodemon.
   ```
   Docker Deployment:
   Build and run:
   ```
   docker-compose up -d
   ```
   Ensure .env is loaded into Docker (e.g., via docker-compose.yml).
   Production:
   Deploy to a cloud provider (e.g., AWS, Heroku).
   Restrict MongoDB Atlas IP access to your server’s IP (remove 0.0.0.0/0).
   Enable TLS for Redis Cloud (rediss://).
   Use a secrets manager for sensitive .env variables.
   Security Considerations
   MongoDB Atlas: Avoid 0.0.0.0/0 in production; use specific IPs or VPC peering.
   Redis Cloud: Enable TLS and ACLs for secure access.
   AfroMessage: Store API token securely; use verified Sender ID in production.
   JWT: Use strong secrets and short-lived access tokens (e.g., 1 hour).
   Cookies: Ensure HttpOnly, Secure, and SameSite=strict in production.
   Troubleshooting
   MongoDB Connection Issues: Verify MONGO_URI and network access in Atlas.
   Redis Connection Issues: Check REDIS_URL and ensure Redis Cloud instance is active.
   AfroMessage Errors: Test API token with cURL:
   curl -X GET -H "Authorization: Bearer your_api_token" \
   -H "Content-Type: application/json" \
   'https://api.afromessage.com/api/challenge?from=&sender=AfroMessage&to=+251912345678&pr=Your%20verification%20code%20is%20&sb=1&sa=0&ttl=300&len=6&t=0'
   Test Failures: Check logs in error.log or combined.log.
   Contributing
   Fork the repository.
   Create a feature branch (git checkout -b feature-name).
   Commit changes (git commit -m "Add feature").
   Push to the branch (git push origin feature-name).
   Open a pull request.
   License
   MIT License. See LICENSE for details.
   Contact
   For support, contact the team via support@afromessage.com or open an issue on the repository.
   �
