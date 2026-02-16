
const BASE_URL = 'http://localhost:3001';

async function verify() {
    console.log('🚀 Starting Habit API Verification...');

    // 1. Register a test user
    const email = `testuser_${Date.now()}@example.com`;
    const password = 'password123';
    const name = 'Test User';

    console.log(`\n1. Registering user: ${email}...`);
    const registerRes = await fetch(`${BASE_URL}/api/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password }),
    });

    if (!registerRes.ok) {
        const text = await registerRes.text();
        console.error(`❌ Registration failed: ${registerRes.status} ${text}`);
        // If registration fails, try login (in case user exists, though unlikely with timestamp)
    } else {
        console.log('✅ Registration successful');
    }

    // 2. Login to get token
    console.log('\n2. Logging in...');
    const loginRes = await fetch(`${BASE_URL}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
    });

    if (!loginRes.ok) {
        throw new Error(`Login failed: ${loginRes.status} ${await loginRes.text()}`);
    }

    const loginData = await loginRes.json();
    const token = loginData.token;
    console.log('✅ Login successful, token received');

    // 3. Create a habit
    const habitTitle = 'Drink 2L Water';
    console.log(`\n3. Creating habit: "${habitTitle}"...`);
    const createRes = await fetch(`${BASE_URL}/api/habits/create`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ title: habitTitle }),
    });

    if (!createRes.ok) {
        throw new Error(`Create habit failed: ${createRes.status} ${await createRes.text()}`);
    }

    const createdHabit = await createRes.json();
    console.log('✅ Habit created:', createdHabit._id);

    // 4. List habits
    console.log('\n4. Listing habits...');
    const listRes = await fetch(`${BASE_URL}/api/habits`, {
        headers: { 'Authorization': `Bearer ${token}` }
    });

    if (!listRes.ok) {
        throw new Error(`List habits failed: ${listRes.status} ${await listRes.text()}`);
    }

    const habits = await listRes.json();
    const found = habits.find(h => h._id === createdHabit._id);

    if (found) {
        console.log(`✅ Habit found in list. Total habits: ${habits.length}`);
    } else {
        throw new Error('❌ Created habit NOT found in list');
    }

    // 5. Delete habit
    console.log(`\n5. Deleting habit: ${createdHabit._id}...`);
    const deleteRes = await fetch(`${BASE_URL}/api/habits/${createdHabit._id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
    });

    if (!deleteRes.ok) {
        throw new Error(`Delete habit failed: ${deleteRes.status} ${await deleteRes.text()}`);
    }

    console.log('✅ Habit deleted');

    // 6. Verify deletion
    console.log('\n6. Verifying deletion...');
    const listRes2 = await fetch(`${BASE_URL}/api/habits`, {
        headers: { 'Authorization': `Bearer ${token}` }
    });

    const habits2 = await listRes2.json();
    const found2 = habits2.find(h => h._id === createdHabit._id);

    if (!found2) {
        console.log('✅ Habit successfully removed from list');
    } else {
        throw new Error('❌ Habit still exists in list after deletion');
    }

    console.log('\n🎉 ALL TESTS PASSED!');
}

verify().catch(err => {
    console.error('\n❌ TEST FAILED:', err);
    process.exit(1);
});
