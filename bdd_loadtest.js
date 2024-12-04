import http from 'k6/http';
import { check } from 'k6';
import { Trend } from 'k6/metrics';

// Define custom metrics to track request duration for registration and login
let registrationDuration = new Trend('registration_duration');
let loginDuration = new Trend('login_duration');

// Define the load test options for gradual increase in users, assuming server can handle 10 requests at the same time
export let options = {
  stages: [
    { duration: '30s', target: 10 },   // Ramp-up to 10 users (server's capacity)
    { duration: '1m', target: 20 },    // Ramp-up to 20 users
    { duration: '2m', target: 50 },    // Ramp-up to 50 users (stress test the server beyond capacity)
    { duration: '1m', target: 0 },     // Ramp-down to 0 users after stress testing
  ],
  thresholds: {
    'registration_duration': ['p(95)<500'], // 95% of registration requests should be under 500ms
    'login_duration': ['p(95)<500'],    // 95% of login requests should be under 500ms
  },
};

// Function to generate random user data for registration and login
function generateRandomUserData() {
  const randomSuffix = Math.random().toString(36).substring(2, 15);
  return {
    fullName: `User ${randomSuffix}`,
    userName: `user_${randomSuffix}`,
    email: `user_${randomSuffix}@example.com`,
    password: `Password123`,
    phone: `1234567890`,
  };
}

export default function () {
  const registerUrl = 'https://your-username.pythonanywhere.com/client_register';  // Replace with your registration URL
  const loginUrl = 'https://your-username.pythonanywhere.com/client_login';        // Replace with your login URL

  // Generate random data for each iteration
  const randomUserData = generateRandomUserData();

  // Simulate registration request
  let registerResponse = http.post(registerUrl, randomUserData);
  check(registerResponse, {
    'Registration: is status 200': (r) => r.status === 200,
  });

  // Track the duration of the registration request
  registrationDuration.add(registerResponse.timings.duration);

  // Simulate login request using the same random user data
  const loginPayload = {
    userName: randomUserData.userName,
    email: randomUserData.email,
    password: randomUserData.password,
  };

  let loginResponse = http.post(loginUrl, loginPayload);
  check(loginResponse, {
    'Login: is status 200': (r) => r.status === 200,
  });

  // Track the duration of the login request
  loginDuration.add(loginResponse.timings.duration);
}
