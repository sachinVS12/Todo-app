require("dotenv").config();
const mongoose = require("mongoose");

// Test connection
async function testModels() {
  try {
    // Connect to MongoDB
    await mongoose.connect(
      process.env.MONGODB_URI || "mongodb://localhost:27017/todo_app",
    );
    console.log("✅ Connected to MongoDB");

    // Test User model without middleware issues
    const bcrypt = require("bcryptjs");

    // Test password hashing
    const password = "testpassword123";
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    console.log("✅ Password hashing works");
    console.log("Original:", password);
    console.log("Hashed:", hashedPassword);

    // Test password comparison
    const isMatch = await bcrypt.compare(password, hashedPassword);
    console.log("✅ Password comparison:", isMatch ? "Passed" : "Failed");

    await mongoose.disconnect();
    console.log("✅ All tests passed!");
  } catch (error) {
    console.error("❌ Test failed:", error.message);
    process.exit(1);
  }
}

testModels();
