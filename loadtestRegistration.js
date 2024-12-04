import http from 'k6/http';
import { check } from 'k6';
import { Trend } from 'k6/metrics';

// Define custom metrics to track request duration
let registrationDuration = new Trend('registration_duration');

// Define the load test options
export let options = {
  stages: [
    { duration: '30s', target: 10 },   // Ramp-up to 10 users (testing the server's capacity)
    { duration: '1m', target: 20 },    // Increase to 20 users (testing the server's tolerance)
    { duration: '2m', target: 50 },    // Increase to 50 users (pushing beyond the limit)
    { duration: '1m', target: 0 },     // Ramp-down to 0 users after load testing
  ],
  thresholds: {
    'registration_duration': ['p(95)<500'], // 95% of requests should be under 500ms
  },
};

export default function () {
  // Define the URL for the /client_register endpoint
  const url = 'https://your-username.pythonanywhere.com/client_register';  // Replace with your URL

  // Test payload (static registration data)
  const payload = {
    fullName: 'John Doe',               // Full name of the user
    userName: 'johndoe',                // Username to register
    email: 'johndoe@example.com',       // Email for the user
    password: 'Password123',            // User password for registration
    phone: '1234567890',                // Phone number of the user
  };

  // Send POST request to /client_register endpoint
  let response = http.post(url, payload);

  // Check that the response status is 200 OK
  check(response, {
    'is status 200': (r) => r.status === 200,
  });

  // Track the duration of the registration process
  registrationDuration.add(response.timings.duration);
}
