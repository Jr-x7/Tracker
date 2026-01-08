const { usersContainer, getItems } = require('../config/db');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const sendEmail = require('../utils/sendEmail');
const crypto = require('crypto');

// Helper to strip Cosmos system fields
const sanitizeUser = (user) => {
    const { _rid, _self, _etag, _attachments, _ts, ...cleanUser } = user;
    return cleanUser;
};

// Generate JWT
const generateToken = (id, email, role) => {
  return jwt.sign({ id, email, role }, process.env.JWT_SECRET, {
    expiresIn: '30d',
  });
};

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
const registerUser = async (req, res) => {
  const { name, email, password, confirmPassword } = req.body;

  if (!name || !email || !password || !confirmPassword) {
    return res.status(400).json({ message: 'Please add all fields' });
  }

  if (password !== confirmPassword) {
    return res.status(400).json({ message: 'Passwords do not match' });
  }

  try {
    // Check if user exists
    const querySpec = {
      query: "SELECT * FROM c WHERE c.email = @email",
      parameters: [{ name: "@email", value: email }]
    };
    const existingUsers = await getItems(usersContainer, querySpec);

    if (existingUsers.length > 0) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Generate Verification Code
    const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();
    
    // Send Email
    const message = `Your verification code is: ${verificationCode}`;
    try {
        await sendEmail({
            email,
            subject: 'Tracker App - Email Verification',
            message,
            html: `<h1>Email Verification</h1><p>Your verification code is:</p><h2>${verificationCode}</h2>`
        });
    } catch (emailError) {
        console.error("Email send failed:", emailError);
        // Continue creating user, but warn logging
    }

    // User schema
    const newUser = {
      id: crypto.randomUUID(), // Explicit ID generation to be safe
      name,
      email,
      password: hashedPassword,
      role: 'viewer', // default
      status: 'pending', // pending admin approval
      isVerified: false, // pending email verification
      verificationCode, 
      createdAt: new Date().toISOString()
    };
    
    // Auto-admin for dev secret (optional - keeping for initial setup ease)
    if (req.body.secret === 'admin-secret-key') {
        newUser.role = 'admin';
        newUser.status = 'active'; // Admin key bypasses approval
        newUser.isVerified = true;  // Admin key bypasses verification
    }

    const { resource: createdUser } = await usersContainer.items.create(newUser);

    res.status(201).json({
      _id: createdUser.id,
      name: createdUser.name,
      email: createdUser.email,
      role: createdUser.role,
      status: createdUser.status,
      isVerified: createdUser.isVerified,
      message: "Registration successful. Please check your email for the verification code."
    });
  } catch (error) {
    console.error("Error creating user:", error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Verify Email
// @route   POST /api/auth/verify-email
// @access  Public
const verifyEmail = async (req, res) => {
    const { email, code } = req.body;

    try {
        const querySpec = {
            query: "SELECT * FROM c WHERE c.email = @email",
            parameters: [{ name: "@email", value: email }]
        };
        const users = await getItems(usersContainer, querySpec);
        const user = users[0];

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        if (user.isVerified) {
            return res.status(400).json({ message: 'User already verified' });
        }

        if (user.verificationCode !== code) {
            return res.status(400).json({ message: 'Invalid verification code' });
        }

        user.isVerified = true;
        user.verificationCode = undefined; // Clear code
        
        // Fix: Use ID as Partition Key and sanitize
        const cleanUser = sanitizeUser(user);
        await usersContainer.item(user.id, user.id).replace(cleanUser);

        res.status(200).json({ message: 'Email verified successfully. Waiting for Admin approval.' });

    } catch (error) {
        console.error("Verification error:", error);
        res.status(500).json({ message: 'Server error' });
    }
}

// @desc    Authenticate a user
// @route   POST /api/auth/login
// @access  Public
const loginUser = async (req, res) => {
  const { email, password } = req.body;

  try {
    // Check for user email
    const querySpec = {
      query: "SELECT * FROM c WHERE c.email = @email",
      parameters: [{ name: "@email", value: email }]
    };
    const users = await getItems(usersContainer, querySpec);
    const user = users[0];

    // Check credentials
    if (!user || !(await bcrypt.compare(password, user.password))) {
        return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Check Verification
    if (!user.isVerified) {
        return res.status(403).json({ message: 'Email not verified. Please verify your email.' });
    }

    // Check Status (Admin Approval)
    if (user.status !== 'active') {
        if (user.status === 'rejected') {
            return res.status(403).json({ message: 'Your account has been rejected by the admin.' });
        }
        return res.status(403).json({ message: 'Account pending Admin approval.' });
    }

    res.json({
        _id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        token: generateToken(user.id, user.email, user.role),
    });

  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Forgot Password
// @route   POST /api/auth/forgot-password
// @access  Public
const forgotPassword = async (req, res) => {
    const { email } = req.body;

    try {
        const querySpec = {
            query: "SELECT * FROM c WHERE c.email = @email",
            parameters: [{ name: "@email", value: email }]
        };
        const users = await getItems(usersContainer, querySpec);
        const user = users[0];

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Generate Reset Code
        const resetCode = Math.floor(100000 + Math.random() * 900000).toString();
        
        // Save code and expiry (10 mins)
        user.resetPasswordToken = resetCode; 
        user.resetPasswordExpire = Date.now() + 10 * 60 * 1000;

        const cleanUser = sanitizeUser(user);
        await usersContainer.item(user.id, user.id).replace(cleanUser);

        // Send Email
        const message = `Your password reset code is: ${resetCode}`;
        try {
            await sendEmail({
                email,
                subject: 'Tracker App - Password Reset Code',
                message,
                html: `<h1>Password Reset</h1><p>Your reset code is:</p><h2>${resetCode}</h2><p>This code expires in 10 minutes.</p>`
            });
            res.status(200).json({ message: 'Reset code sent to email' });
        } catch (emailError) {
            console.error("Email send failed:", emailError);
            user.resetPasswordToken = undefined;
            user.resetPasswordExpire = undefined;
            
            const revertedUser = sanitizeUser(user);
            await usersContainer.item(user.id, user.id).replace(revertedUser);
            
            return res.status(500).json({ message: 'Email could not be sent' });
        }

    } catch (error) {
        console.error("Forgot Password error:", error);
        res.status(500).json({ message: 'Server error' });
    }
}

// @desc    Reset Password
// @route   POST /api/auth/reset-password
// @access  Public
const resetPassword = async (req, res) => {
    const { email, code, newPassword } = req.body;

    try {
        const querySpec = {
            query: "SELECT * FROM c WHERE c.email = @email",
            parameters: [{ name: "@email", value: email }]
        };
        const users = await getItems(usersContainer, querySpec);
        const user = users[0];

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        if (user.resetPasswordToken !== code || user.resetPasswordExpire < Date.now()) {
            return res.status(400).json({ message: 'Invalid or expired token' });
        }

        // Set new password
        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(newPassword, salt);
        
        // Clear token
        user.resetPasswordToken = undefined;
        user.resetPasswordExpire = undefined;

        const cleanUser = sanitizeUser(user);
        await usersContainer.item(user.id, user.id).replace(cleanUser);

        res.status(200).json({ message: 'Password updated successfully' });

    } catch (error) {
        console.error("Reset Password error:", error);
        res.status(500).json({ message: 'Server error' });
    }
}


// @desc    Get user data
// @route   GET /api/auth/me
// @access  Private
const getMe = async (req, res) => {
    res.status(200).json(req.user);
};

// @desc    Grant access / Approve User
// @route   PUT /api/auth/grant-access/:id
// @access  Private/Admin
const grantAccess = async (req, res) => {
    const userId = req.params.id;
    const { role, status } = req.body; // 'admin'/'viewer', 'active'/'rejected'

    try {
        // Fix: Use PK in read
        const { resource: user } = await usersContainer.item(userId, userId).read();
        
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        if (role) user.role = role;
        if (status) user.status = status;

        const cleanUser = sanitizeUser(user);
        const { resource: updatedUser } = await usersContainer.item(userId, userId).replace(cleanUser);

        res.json({
            _id: updatedUser.id,
            name: updatedUser.name,
            email: updatedUser.email,
            role: updatedUser.role,
            status: updatedUser.status
        });

    } catch (error) {
        console.error("Update role error:", error);
        res.status(500).json({ message: 'Server Error' });
    }
}

// @desc    Request Admin Access
// @route   POST /api/auth/request-access
// @access  Private
const requestAdminAccess = async (req, res) => {
    try {
        // Fix: Use PK in read
        const { resource: user } = await usersContainer.item(req.user.id, req.user.id).read();

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        if (user.role === 'admin') {
             return res.status(400).json({ message: 'User is already an admin' });
        }

        user.accessRequested = true;
        
        const cleanUser = sanitizeUser(user);
        await usersContainer.item(user.id, user.id).replace(cleanUser);

        res.status(200).json({ message: 'Admin access requested successfully' });

    } catch (error) {
        console.error("Request access error:", error);
        res.status(500).json({ message: 'Server error' });
    }
}

// @desc    Get all users
// @route   GET /api/auth/users
// @access  Private/Admin
const getUsers = async (req, res) => {
    try {
        const querySpec = {
            query: "SELECT c.id, c.name, c.email, c.role, c.status, c.isVerified, c.accessRequested, c.createdAt FROM c"
        };
        const users = await getItems(usersContainer, querySpec);
        res.json(users);
    } catch (error) {
        console.error("Get users error:", error);
        res.status(500).json({ message: 'Server Error' });
    }
}

module.exports = {
  registerUser,
  loginUser,
  getMe,
  grantAccess,
  getUsers,
  verifyEmail,
  requestAdminAccess,
  forgotPassword,
  resetPassword
};
