const express = require('express');
const crypto = require('crypto');
const User = require('../models/User');

const router = express.Router();

// Define the set of possible peppers.
// For practical demonstration, using uppercase letters 'A' through 'Z' (26 possibilities).
const POSSIBLE_PEPPERS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');

// Helper function to hash Password + Salt + Pepper using SHA-256
function computeSha256Hash(password, salt, pepper) {
  const combined = password + salt + pepper;
  return crypto.createHash('sha256').update(combined).digest('hex');
}

// 1. REGISTER USER
router.post('/register', async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ success: false, message: 'Username and password are required.' });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ username: username.trim() });
    if (existingUser) {
      return res.status(400).json({ success: false, message: 'Username already taken. Please choose another.' });
    }

    // Step A: Generate a random 16-byte hex Salt
    const salt = crypto.randomBytes(16).toString('hex');

    // Step B: Pick a random Pepper from the possible peppers set
    const selectedPepper = POSSIBLE_PEPPERS[Math.floor(Math.random() * POSSIBLE_PEPPERS.length)];

    // Step C: Compute SHA-256 hash of Password + Salt + Pepper
    const hash = computeSha256Hash(password, salt, selectedPepper);

    // Step D: Store username, salt, and hash in MongoDB. DO NOT store the pepper!
    const newUser = new User({
      username: username.trim(),
      salt: salt,
      hash: hash
    });

    await newUser.save();

    return res.status(201).json({
      success: true,
      message: 'User registered successfully!',
      storedDataInDB: {
        username: newUser.username,
        salt: newUser.salt,
        hash: newUser.hash,
        pepperStatus: 'NOT STORED IN DATABASE (Kept secret on server)'
      },
      practicalDemoDetails: {
        rawPassword: password,
        generatedSalt: salt,
        secretPepperUsed: selectedPepper,
        combinedString: password + salt + selectedPepper,
        computedSha256Hash: hash
      }
    });
  } catch (error) {
    console.error('Registration Error:', error);
    return res.status(500).json({ success: false, message: 'Server error during registration: ' + error.message });
  }
});

// 2. LOGIN USER
router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ success: false, message: 'Username and password are required.' });
    }

    // Step A: Fetch stored user from MongoDB
    const user = await User.findOne({ username: username.trim() });
    if (!user) {
      return res.status(404).json({ success: false, message: 'Login Unsuccessful: User does not exist.' });
    }

    // Step B: Retrieve stored salt and stored hash
    const storedSalt = user.salt;
    const storedHash = user.hash;

    // Step C: Try all possible peppers, hash entered password + salt + candidate pepper, compare with stored hash
    let matchedPepper = null;
    let attempts = 0;
    const pepperLog = [];

    for (const pepperCandidate of POSSIBLE_PEPPERS) {
      attempts++;
      const candidateHash = computeSha256Hash(password, storedSalt, pepperCandidate);

      pepperLog.push({
        candidate: pepperCandidate,
        hash: candidateHash,
        isMatch: candidateHash === storedHash
      });

      if (candidateHash === storedHash) {
        matchedPepper = pepperCandidate;
        break; // Match found!
      }
    }

    // Step D: Check if any candidate pepper produced a matching hash
    if (matchedPepper) {
      return res.status(200).json({
        success: true,
        message: 'Login Successful!',
        details: {
          username: user.username,
          storedSalt,
          storedHash,
          matchedPepper,
          attemptsTaken: attempts,
          totalPeppersTested: POSSIBLE_PEPPERS.length
        }
      });
    } else {
      return res.status(401).json({
        success: false,
        message: 'Login Unsuccessful: Invalid Password!',
        details: {
          username: user.username,
          storedSalt,
          storedHash,
          matchedPepper: null,
          attemptsTaken: attempts,
          totalPeppersTested: POSSIBLE_PEPPERS.length
        }
      });
    }
  } catch (error) {
    console.error('Login Error:', error);
    return res.status(500).json({ success: false, message: 'Server error during login: ' + error.message });
  }
});

// 3. GET ALL USERS (Database Inspector for Practical Presentation)
router.get('/users', async (req, res) => {
  try {
    const users = await User.find({}, 'username salt hash createdAt').sort({ createdAt: -1 });
    return res.status(200).json({ success: true, users });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Error fetching database records: ' + error.message });
  }
});

// 4. CLEAR DATABASE (Reset tool for demonstration)
router.delete('/users', async (req, res) => {
  try {
    await User.deleteMany({});
    return res.status(200).json({ success: true, message: 'Database reset successfully.' });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Error clearing database: ' + error.message });
  }
});

module.exports = router;
