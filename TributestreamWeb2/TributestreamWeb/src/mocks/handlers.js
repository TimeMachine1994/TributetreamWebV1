// src/mocks/handlers.js
 // src/mocks/handlers.js
import { http, HttpResponse } from 'msw';
 

// In-memory data structures to simulate the database
const tributes = [];
 
 
// In-memory data structures to simulate the database
const users = [
  // Pre-defined users for testing
  {
    id: 1,
    username: 'admin',
    email: 'admin@localhost.dev',
    password: 'password', // Plain text for simplicity; in real apps, use hashed passwords
    display_name: 'admin',
    nicename: 'admin',
  },
];

const validTokens = []; // Array to store valid tokens

export const handlers = [
  // Handler for POST /wp-json/jwt-auth/v1/token (Authenticate user and return token)
  http.post('/wp-json/jwt-auth/v1/token', async ({ request }) => {
    console.log('Received a POST request to /wp-json/jwt-auth/v1/token');

    // Parse request body
    const params = await request.json();
    const { username, password } = params;

    console.log('Authentication attempt for username:', username);

    // Find user
    const user = users.find(
      (u) => u.username === username && u.password === password
    );

    if (!user) {
      console.log('Invalid credentials for username:', username);
      return HttpResponse.json(
        {
          code: 'jwt_auth_failed',
          data: { status: 403 },
          message: 'Invalid Credentials.',
        },
        { status: 403 }
      );
    }

    // Generate a mock token (In reality, this should be a JWT)
    const token = btoa(`${username}:${password}:${Date.now()}`);
    validTokens.push(token);

    console.log('User authenticated successfully. Token generated:', token);

    const response = HttpResponse.json(
      {
        token,
        user_display_name: user.display_name,
        user_email: user.email,
        user_nicename: user.nicename,
      },
      { status: 200 }
    );
        // ============================================
    // Set the 'sessionToken' cookie in the response headers
    response.headers.append('Set-Cookie', `sessionToken=${token}; Path=/; HttpOnly`);

    // Return the response with the 'Set-Cookie' header
    return response;
  }),

 

  // Handler for POST /wp-json/jwt-auth/v1/token/validate (Validate token)
  http.post('/wp-json/jwt-auth/v1/token/validate', ({ request }) => {
    console.log('Received a POST request to /wp-json/jwt-auth/v1/token/validate');

    const authHeader = request.headers.get('Authorization');
    console.log('Authorization header:', authHeader);

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      console.log('No token provided in Authorization header.');
      return HttpResponse.json(
        {
          code: 'jwt_auth_no_token',
          data: { status: 403 },
          message: 'No token provided.',
        },
        { status: 403 }
      );
    }

    const token = authHeader.replace('Bearer ', '');
    console.log('Token extracted:', token);

    // Validate token
    const isValidToken = validTokens.includes(token);

    if (!isValidToken) {
      console.log('Invalid token:', token);
      return HttpResponse.json(
        {
          code: 'jwt_auth_invalid_token',
          data: { status: 403 },
          message: 'Invalid token.',
        },
        { status: 403 }
      );
    }

    console.log('Token is valid.');

    return HttpResponse.json(
      {
        code: 'jwt_auth_valid_token',
        data: { status: 200 },
      },
      { status: 200 }
    );
  }),

  // Handler for POST /wp-json/tributestream/v1/tribute
  http.post('/wp-json/tributestream/v1/tribute', async ({ request, cookies }) => {
    console.log('Received a POST request to /wp-json/tributestream/v1/tribute');

    // Simulate permission check (user must be logged in)
    const isUserLoggedIn = cookies.sessionToken !== undefined;
    console.log('User logged in:', isUserLoggedIn);

    if (!isUserLoggedIn) {
      console.log('User not logged in. Sending 401 Unauthorized response.');
      return new HttpResponse(null, { status: 401 });
    }

    // Parse request body
    const params = await request.json();
    const { user_id, loved_one_name, slug } = params;

    console.log('Request parameters:', params);

    // Simulate inserting into the database
    const newTribute = {
      id: tributes.length + 1,
      user_id,
      loved_one_name,
      slug,
    };
    tributes.push(newTribute);

    console.log('New tribute created and added to tributes array:', newTribute);
    console.log('Current tributes:', tributes);

    // Return success response
    return HttpResponse.json(
      { message: 'Tribute created successfully', id: newTribute.id },
      { status: 200 }
    );
  }),

  // Handler for POST /wp-json/tributestream/v1/register
  http.post('/wp-json/tributestream/v1/register', async ({ request }) => {
    console.log('Received a POST request to /wp-json/tributestream/v1/register');

    // Parse request body
    const params = await request.json();
    const { username, email, password, meta } = params;

    console.log('Registration parameters:', params);

    // Check if the username or email already exists
    const existingUser = users.find(
      (user) => user.username === username || user.email === email
    );
    console.log('Existing user check:', existingUser);

    if (existingUser) {
      console.log('Registration failed: Username or email already exists');
      return HttpResponse.json(
        { message: 'Registration failed: Username or email already exists' },
        { status: 400 }
      );
    }

    // Simulate user creation
    const newUser = {
      id: users.length + 1,
      username,
      email,
      password, // In a real app, passwords should be hashed!
      meta,
    };
    users.push(newUser);

    console.log('New user registered and added to users array:', newUser);
    console.log('Current users:', users);

    // Return success response
    return HttpResponse.json(
      { user_id: newUser.id, message: 'User registered successfully' },
      { status: 201 }
    );
  }),

  // Handler for GET /wp-json/tributestream/v1/register
  http.get('/wp-json/tributestream/v1/register', ({ request }) => {
    console.log('Received a GET request to /wp-json/tributestream/v1/register');

    // Return a simple message or registration info
    return HttpResponse.json(
      { message: 'Registration endpoint is available.' },
      { status: 200 }
    );
  }),
];
