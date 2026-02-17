
const mongoose = require('mongoose');

const BASE_URL = 'http://localhost:3000'; // Make sure this matches your dev server port
const MONGO_URI = 'mongodb://localhost:27017/consistency-os';

// Define minimal schemas for direct DB manipulation
const HabitLogSchema = new mongoose.Schema({
    habitId: mongoose.Schema.Types.ObjectId,
    userId: mongoose.Schema.Types.ObjectId,
    date: String,
    completed: Boolean,
    createdAt: { type: Date, default: Date.now }
});
const HabitLog = mongoose.models.HabitLog || mongoose.model('HabitLog', HabitLogSchema);

async function verify() {
    console.log('🚀 Starting Streak Logic Verification...');

    // Connect to DB
    await mongoose.connect(MONGO_URI);
    console.log('✅ Connected to MongoDB');

    // 1. Register a test user
    const email = `streak_test_${Date.now()}@example.com`;
    const password = 'password123';
    const name = 'Streak Test User';

    console.log(`\n1. Registering user: ${email}...`);
    const registerRes = await fetch(`${BASE_URL}/api/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password }),
    });

    if (!registerRes.ok) {
        console.log('Registration might have failed (user exists?), trying login...');
    } else {
        console.log('✅ Registration successful');
    }

    // 2. Login
    console.log('\n2. Logging in...');
    const loginRes = await fetch(`${BASE_URL}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
    });

    if (!loginRes.ok) throw new Error('Login failed');
    const { token, user } = await loginRes.json();
    console.log('✅ Login successful');

    // 3. Create a habit
    console.log('\n3. Creating habit...');
    const habitRes = await fetch(`${BASE_URL}/api/habits/create`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ title: 'Test Streak Habit' }),
    });

    if (!habitRes.ok) throw new Error('Create habit failed');
    const habit = await habitRes.json(); // Usually returns { message: '...' }, oh wait, GET returns list. POST returns message.

    // We need the habit ID. Let's fetch the list.
    const listRes = await fetch(`${BASE_URL}/api/habits`, {
        headers: { 'Authorization': `Bearer ${token}` }
    });
    const habits = await listRes.json();
    const createdHabit = habits.find(h => h.title === 'Test Streak Habit');

    if (!createdHabit) throw new Error('Created habit not found');
    console.log(`✅ Habit created: ${createdHabit._id}`);

    // Verify initial streak
    if (createdHabit.streak !== 0) throw new Error(`Expected streak 0, got ${createdHabit.streak}`);
    console.log('✅ Initial streak is 0');

    // 4. Complete for TODAY via API
    console.log('\n4. Completing habit for TODAY via API...');
    const completeRes = await fetch(`${BASE_URL}/api/habits/complete`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ habitId: createdHabit._id }),
    });

    if (!completeRes.ok) throw new Error(`Complete failed: ${await completeRes.text()}`);
    console.log('✅ Marked as completed');

    // Verify streak is 1
    const listRes2 = await fetch(`${BASE_URL}/api/habits`, {
        headers: { 'Authorization': `Bearer ${token}` }
    });
    const habits2 = await listRes2.json();
    const updatedHabit = habits2.find(h => h._id === createdHabit._id);

    if (updatedHabit.streak !== 1) throw new Error(`Expected streak 1, got ${updatedHabit.streak}`);
    if (!updatedHabit.completedToday) throw new Error('Expected completedToday to be true');
    console.log('✅ Streak is 1 and completedToday is true');

    // 5. Manually insert YESTERDAY log
    console.log('\n5. Inserting YESTERDAY log via DB...');
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toISOString().split('T')[0];

    await HabitLog.create({
        habitId: createdHabit._id,
        userId: user.id, // User object from login response usually contains id or _id
        date: yesterdayStr,
        completed: true
    });
    console.log(`✅ Inserted log for ${yesterdayStr}`);

    // Verify streak is 2
    const listRes3 = await fetch(`${BASE_URL}/api/habits`, {
        headers: { 'Authorization': `Bearer ${token}` }
    });
    const habits3 = await listRes3.json();
    const streakHabit = habits3.find(h => h._id === createdHabit._id);

    if (streakHabit.streak !== 2) throw new Error(`Expected streak 2, got ${streakHabit.streak}`);
    console.log('✅ Streak is 2');

    // 6. Manually insert 2 DAYS AGO log
    console.log('\n6. Inserting 2 DAYS AGO log via DB...');
    const twoDaysAgo = new Date(today);
    twoDaysAgo.setDate(twoDaysAgo.getDate() - 2);
    const twoDaysAgoStr = twoDaysAgo.toISOString().split('T')[0];

    await HabitLog.create({
        habitId: createdHabit._id,
        userId: user.id,
        date: twoDaysAgoStr,
        completed: true
    });
    console.log(`✅ Inserted log for ${twoDaysAgoStr}`);

    // Verify streak is 3
    const listRes4 = await fetch(`${BASE_URL}/api/habits`, {
        headers: { 'Authorization': `Bearer ${token}` }
    });
    const habits4 = await listRes4.json();
    const streakHabit2 = habits4.find(h => h._id === createdHabit._id);

    if (streakHabit2.streak !== 3) throw new Error(`Expected streak 3, got ${streakHabit2.streak}`);
    console.log('✅ Streak is 3');

    // 7. Verify broken streak logic (skip 3 days ago, insert 4 days ago)
    console.log('\n7. Testing broken streak logic...');
    // We have logs for T, T-1, T-2. Streak is 3.
    // Let's insert T-4. Streak should still be 3 (because T-3 is missing).

    const fourDaysAgo = new Date(today);
    fourDaysAgo.setDate(fourDaysAgo.getDate() - 4);
    const fourDaysAgoStr = fourDaysAgo.toISOString().split('T')[0];
    await HabitLog.create({
        habitId: createdHabit._id,
        userId: user.id,
        date: fourDaysAgoStr,
        completed: true
    });
    console.log(`✅ Inserted log for ${fourDaysAgoStr} (skipping T-3)`);

    const listRes5 = await fetch(`${BASE_URL}/api/habits`, {
        headers: { 'Authorization': `Bearer ${token}` }
    });
    const habits5 = await listRes5.json();
    const brokenStreakHabit = habits5.find(h => h._id === createdHabit._id);

    if (brokenStreakHabit.streak !== 3) throw new Error(`Expected streak 3 (gap at T-3), got ${brokenStreakHabit.streak}`);
    console.log('✅ Streak correctly stopped at 3 despite older logs');

    console.log('\n🎉 ALL TESTS PASSED!');
    await mongoose.disconnect();
}

verify().catch(async err => {
    console.error('\n❌ TEST FAILED:', err);
    await mongoose.disconnect();
    process.exit(1);
});
