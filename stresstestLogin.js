import http from 'k6/http';
import { check } from 'k6';
import { Trend } from 'k6/metrics';

// Define custom metrics to track request duration
let loginDuration = new Trend('login_duration');

// Define the stress test options with stages
export let options = {
  stages: [
    { duration: '30s', target: 10 },   // Ramp-up to 10 users (testing the server's capacity)
    { duration: '1m', target: 20 },    // Increase to 20 users (testing the server's tolerance)
    { duration: '2m', target: 50 },    // Increase to 50 users (pushing beyond the limit)
    { duration: '1m', target: 0 },     // Ramp-down to 0 users after stress testing
  ],
  thresholds: {
    'login_duration': ['p(95)<500'],  // 95% of requests should be under 500ms
  },
};

export default function () {
  const url = 'https://your-username.pythonanywhere.com/client_login';  // Replace with your URL

  // Test payload (login credentials)
  const payload = {
    userName: 'johndoe',                // Username to login
    email: 'johndoe@example.com',       // Email for the user
    password: 'Password123',            // User password for login
  };

  // Send POST request to /client_login endpoint
  let response = http.post(url, payload);

  // Check that the response status is 200 OK
  check(response, {
    'is status 200': (r) => r.status === 200,
  });

  // Track the duration of the login process
  loginDuration.add(response.timings.duration);
}
