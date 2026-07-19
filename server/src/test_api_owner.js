async function run() {
  try {
    // 1. Log in as owner
    console.log('Logging in as owner...');
    const loginRes = await fetch('http://localhost:5000/api/v1/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        email: 'owner@test.com',
        password: 'Password@123'
      })
    });
    
    const loginData = await loginRes.json();
    if (!loginRes.ok) {
      console.error('Login failed:', loginData);
      return;
    }

    const token = loginData.data.tokens.access.token;
    console.log('Logged in! Token retrieved.');

    // 2. Call attendance/today
    console.log('Fetching today status...');
    const todayRes = await fetch('http://localhost:5000/api/v1/attendance/today', {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });

    const todayData = await todayRes.json();
    console.log('Response status:', todayRes.status);
    console.log('Response data:', JSON.stringify(todayData, null, 2));

  } catch (err) {
    console.error('API call failed:', err.message);
  }
}

run();
