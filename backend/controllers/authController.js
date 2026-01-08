const { usersContainer, getItems } = require('../config/db');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

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
    console.log(`[EMAIL MOCK] Verification Code for ${email}: ${verificationCode}`);

    // User schema
    const newUser = {
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
      message: "Registration successful. Please verify your email."
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
        
        await usersContainer.item(user.id).replace(user);

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
        const { resource: user } = await usersContainer.item(userId).read();
        
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        if (role) user.role = role;
        if (status) user.status = status;

        const { resource: updatedUser } = await usersContainer.item(userId).replace(user);

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
        const { resource: user } = await usersContainer.item(req.user.id).read();

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        if (user.role === 'admin') {
             return res.status(400).json({ message: 'User is already an admin' });
        }

        user.accessRequested = true;
        
        await usersContainer.item(user.id).replace(user);

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
  requestAdminAccess
};
