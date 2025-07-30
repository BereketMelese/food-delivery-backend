// jest.setup.js
// This file runs before your test environment is set up.

// Load environment variables from .env.test when NODE_ENV is 'test'
// (or just load .env.test directly for testing purposes)
require("dotenv").config({ path: ".env.test" });

// Ensure Redis and MongoDB connections are attempted here.
// If your `server.js` tries to connect on import, and you want to ensure
// it uses the test env vars, this dotenv config needs to run before `app` is loaded.
// Alternatively, ensure your server's connect functions are called *after*
// your app instance is exported.
