const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const prisma = require('../config/db');
const { saveBase64Image } = require('../config/multer');

const register = async (req, res) => {
  try {
    const { name, email, password, role, employeeId, department, signatureData } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Name, email, and password are required fields.'
      });
    }

    const existingUser = await prisma.user.findUnique({
      where: { email: email.toLowerCase().trim() }
    });

    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'A user with this email already exists.'
      });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    let signatureUrl = null;
    if (req.file) {
      signatureUrl = `/uploads/signatures/${req.file.filename}`;
    } else if (signatureData) {
      signatureUrl = saveBase64Image(signatureData, 'user-sig');
    }

    // Role validation: Public registration only allows EMPLOYEE or ACCOUNTS (DIRECTOR is restricted)
    const validRoles = ['EMPLOYEE', 'ACCOUNTS'];
    const assignedRole = validRoles.includes(role?.toUpperCase()) ? role.toUpperCase() : 'EMPLOYEE';

    const user = await prisma.user.create({
      data: {
        name: name.trim(),
        email: email.toLowerCase().trim(),
        password: hashedPassword,
        role: assignedRole,
        employeeId: employeeId ? employeeId.trim() : null,
        department: department ? department.trim() : null,
        signatureUrl: signatureUrl
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        employeeId: true,
        department: true,
        signatureUrl: true,
        createdAt: true
      }
    });

    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET || 'secret_key',
      { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    );

    res.status(201).json({
      success: true,
      message: 'Account registered successfully.',
      data: {
        user,
        token
      }
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({
      success: false,
      message: 'An error occurred during registration.'
    });
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide both email and password.'
      });
    }

    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase().trim() }
    });

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password.'
      });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password.'
      });
    }

    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET || 'secret_key',
      { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    );

    res.status(200).json({
      success: true,
      message: 'Login successful.',
      data: {
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          employeeId: user.employeeId,
          department: user.department,
          signatureUrl: user.signatureUrl,
          createdAt: user.createdAt
        },
        token
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: 'An error occurred during login.'
    });
  }
};

const getCurrentUser = async (req, res) => {
  try {
    res.status(200).json({
      success: true,
      data: req.user
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve current user.'
    });
  }
};

const updateSignature = async (req, res) => {
  try {
    let signatureUrl = null;
    if (req.file) {
      signatureUrl = `/uploads/signatures/${req.file.filename}`;
    } else if (req.body.signatureData) {
      signatureUrl = saveBase64Image(req.body.signatureData, 'user-sig');
    }

    if (!signatureUrl) {
      return res.status(400).json({
        success: false,
        message: 'No signature image provided.'
      });
    }

    const updatedUser = await prisma.user.update({
      where: { id: req.user.id },
      data: { signatureUrl },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        signatureUrl: true
      }
    });

    res.status(200).json({
      success: true,
      message: 'Signature updated successfully.',
      data: updatedUser
    });
  } catch (error) {
    console.error('Signature update error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update signature.'
    });
  }
};

module.exports = {
  register,
  login,
  getCurrentUser,
  updateSignature
};
