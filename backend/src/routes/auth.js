import express from 'express';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import User from '../models/User.js';
import { protect } from '../middleware/auth.js';
import { upload } from '../middleware/upload.js';
import { sendOtp } from '../services/email.js';
import {
  isMySQLActive,
  mysqlFindUserByEmail,
  mysqlFindUserById,
  mysqlCreateUser,
  mysqlUpdateUser
} from '../config/mysql.js';

const router = express.Router();

function signToken(user) {
  const role = user.email?.toLowerCase() === 'brayw433@gmail.com' ? 'admin' : (user.role || 'user');
  return jwt.sign(
    { id: user.id || user._id, email: user.email, role },
    process.env.JWT_SECRET || 'glowora-dev-secret',
    { expiresIn: '7d' }
  );
}

function userResponse(user, token) {
  const role = user.email?.toLowerCase() === 'brayw433@gmail.com' ? 'admin' : (user.role || 'user');
  return {
    token,
    user: {
      _id: String(user.id || user._id),
      id: user.id || user._id,
      name: user.name,
      email: user.email,
      role,
      isAdmin: role === 'admin',
      phone: user.phone || '',
      address: user.address || '',
      city: user.city || '',
      state: user.state || '',
      zipCode: user.zipCode || '',
      photoUrl: user.photoUrl || (user.photoContentType ? `/api/images/user/${user._id}` : null),
    },
  };
}

// Helper to generate and send OTP
async function generateAndSendOtp(user, isMySQL = false) {
  const code = Math.floor(100000 + Math.random() * 900000).toString();
  const salt = await bcrypt.genSalt(10);
  const otpHash = await bcrypt.hash(code, salt);
  const otpExpires = new Date(Date.now() + 10 * 60 * 1000);
  const otpCooldownUntil = new Date(Date.now() + 60 * 1000);

  if (isMySQL && (user.id || user._id)) {
    await mysqlUpdateUser(user.id || user._id, {
      otpHash,
      otpExpires,
      otpCooldownUntil,
    });
  } else if (user.save) {
    user.otpHash = otpHash;
    user.otpExpires = otpExpires;
    user.otpCooldownUntil = otpCooldownUntil;
    await user.save();
  }

  await sendOtp(user.email, code);
}

router.post('/register', upload.single('photo'), async (req, res) => {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Name, email, and password are required' });
    }
    if (password.length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters' });
    }

    const adminEmails = ['admin@glowora.com', 'brayw433@gmail.com'];
    const isAdminEmail = adminEmails.includes(email.toLowerCase());

    const hashedPassword = await bcrypt.hash(password, 10);

    // MySQL flow
    if (isMySQLActive()) {
      let mysqlUser = await mysqlFindUserByEmail(email);
      if (mysqlUser) {
        if (mysqlUser.isEmailVerified || isAdminEmail) {
          return res.status(400).json({ message: 'Email already registered' });
        }
        await mysqlUpdateUser(mysqlUser.id, {
          name,
          password: hashedPassword,
        });
        mysqlUser = await mysqlFindUserById(mysqlUser.id);
      } else {
        mysqlUser = await mysqlCreateUser({
          name,
          email: email.toLowerCase(),
          password: hashedPassword,
          role: isAdminEmail ? 'admin' : 'user',
          isEmailVerified: isAdminEmail ? true : false,
        });
      }

      if (isAdminEmail) {
        const token = signToken(mysqlUser);
        return res.status(201).json(userResponse(mysqlUser, token));
      }

      await generateAndSendOtp(mysqlUser, true);
      return res.status(200).json({
        requireVerification: true,
        email: mysqlUser.email,
        message: 'Verification OTP sent to your email address.',
      });
    }

    // MongoDB fallback
    try {
      let user = await User.findOne({ email: email.toLowerCase() });
      if (user) {
        if (user.isVerified || isAdminEmail) {
          return res.status(400).json({ message: 'Email already registered' });
        }
        user.name = name;
        user.password = password;
        if (req.file) {
          user.photoData = req.file.buffer;
          user.photoContentType = req.file.mimetype;
        }
      } else {
        const userData = {
          name,
          email: email.toLowerCase(),
          password,
          isVerified: isAdminEmail ? true : false,
          role: isAdminEmail ? 'admin' : 'user'
        };
        if (req.file) {
          userData.photoData = req.file.buffer;
          userData.photoContentType = req.file.mimetype;
        }
        user = new User(userData);
      }

      if (isAdminEmail) {
        await user.save();
        const token = signToken(user);
        return res.status(201).json(userResponse(user, token));
      }

      await generateAndSendOtp(user);
      return res.status(200).json({
        requireVerification: true,
        email: user.email,
        message: 'Verification OTP sent to your email address.',
      });
    } catch {
      return res.status(500).json({ message: 'Registration failed' });
    }
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    // Check MySQL
    if (isMySQLActive()) {
      const mysqlUser = await mysqlFindUserByEmail(email);
      if (mysqlUser) {
        const isMatch = await bcrypt.compare(password, mysqlUser.password);
        if (!isMatch) {
          return res.status(401).json({ message: 'Invalid email or password' });
        }

        const adminEmails = ['admin@glowora.com', 'brayw433@gmail.com'];
        const isAdminEmail = adminEmails.includes(mysqlUser.email.toLowerCase()) || mysqlUser.role === 'admin';

        if (!mysqlUser.isEmailVerified && !isAdminEmail) {
          await generateAndSendOtp(mysqlUser, true);
          return res.status(403).json({
            requireVerification: true,
            email: mysqlUser.email,
            message: 'Your email is not verified. A verification code has been sent to your email.',
          });
        }

        const token = signToken(mysqlUser);
        return res.json(userResponse(mysqlUser, token));
      }
    }

    // MongoDB fallback
    try {
      const user = await User.findOne({ email: email.toLowerCase() }).select('+password +otpCooldownUntil');
      if (user && (await user.comparePassword(password))) {
        const adminEmails = ['admin@glowora.com', 'brayw433@gmail.com'];
        const isAdminEmail = adminEmails.includes(user.email.toLowerCase()) || user.role === 'admin';

        if (!user.isVerified && !isAdminEmail) {
          if (!user.otpCooldownUntil || user.otpCooldownUntil < Date.now()) {
            await generateAndSendOtp(user);
          }
          return res.status(403).json({
            requireVerification: true,
            email: user.email,
            message: 'Your email is not verified. A verification code has been sent to your email.',
          });
        }

        const token = signToken(user);
        return res.json(userResponse(user, token));
      }
    } catch {
      // Fallback
    }

    return res.status(401).json({ message: 'Invalid email or password' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.post('/verify-otp', async (req, res) => {
  try {
    const { email, code, password, newPassword } = req.body;
    if (!email || !code) {
      return res.status(400).json({ message: 'Email and verification code are required' });
    }

    // Check MySQL
    if (isMySQLActive()) {
      const mysqlUser = await mysqlFindUserByEmail(email);
      if (mysqlUser) {
        if (!mysqlUser.otpHash) {
          return res.status(400).json({ message: 'No active OTP found. Please request a new one.' });
        }
        const isMatch = await bcrypt.compare(code, mysqlUser.otpHash);
        if (!isMatch) {
          return res.status(400).json({ message: 'Invalid verification code' });
        }

        const updates = { isEmailVerified: 1, otpHash: null, otpExpires: null };
        if (password || newPassword) {
          updates.password = await bcrypt.hash(password || newPassword, 10);
        }
        const updated = await mysqlUpdateUser(mysqlUser.id, updates);
        const token = signToken(updated);
        return res.json(userResponse(updated, token));
      }
    }

    // MongoDB fallback
    try {
      const user = await User.findOne({ email: email.toLowerCase() }).select('+otpHash +otpExpires');
      if (user) {
        if (user.otpExpires && user.otpExpires < Date.now()) {
          return res.status(400).json({ message: 'Verification code has expired. Please request a new one.' });
        }
        const isMatch = await bcrypt.compare(code, user.otpHash);
        if (!isMatch) {
          return res.status(400).json({ message: 'Invalid verification code' });
        }
        user.isVerified = true;
        if (password || newPassword) {
          user.password = password || newPassword;
        }
        user.otpHash = undefined;
        user.otpExpires = undefined;
        await user.save();

        const token = signToken(user);
        return res.json(userResponse(user, token));
      }
    } catch {
      // Fallback
    }

    return res.status(404).json({ message: 'User not found' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.post('/resend-otp', async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ message: 'Email is required' });
    }

    if (isMySQLActive()) {
      const mysqlUser = await mysqlFindUserByEmail(email);
      if (mysqlUser) {
        await generateAndSendOtp(mysqlUser, true);
        return res.json({ message: 'Verification OTP resent to your email address.' });
      }
    }

    try {
      const user = await User.findOne({ email: email.toLowerCase() }).select('+otpCooldownUntil');
      if (user) {
        await generateAndSendOtp(user);
        return res.json({ message: 'Verification OTP resent to your email address.' });
      }
    } catch {
      // Fallback
    }

    return res.status(404).json({ message: 'User not found' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.post('/google', async (req, res) => {
  try {
    const { credential } = req.body;
    if (!credential) {
      return res.status(400).json({ message: 'Google credential (ID Token) is required' });
    }

    const response = await fetch(`https://oauth2.googleapis.com/tokeninfo?id_token=${credential}`);
    if (!response.ok) {
      return res.status(400).json({ message: 'Invalid Google credential' });
    }

    const payload = await response.json();
    const { sub, email, name, picture, email_verified } = payload;

    const clientId = process.env.GOOGLE_CLIENT_ID || '798271672760-6ud5snsd4ga49og0u0jhnqj27hueh209.apps.googleusercontent.com';
    if (payload.aud !== clientId) {
      return res.status(400).json({ message: 'Invalid client application ID' });
    }

    if (email_verified !== 'true' && email_verified !== true) {
      return res.status(400).json({ message: 'Google account email is not verified' });
    }

    if (isMySQLActive()) {
      let mysqlUser = await mysqlFindUserByEmail(email);
      let isNew = false;
      if (!mysqlUser) {
        const dummyPassword = await bcrypt.hash(`google_${sub}_${Date.now()}`, 10);
        mysqlUser = await mysqlCreateUser({
          name,
          email: email.toLowerCase(),
          password: dummyPassword,
          role: 'user',
          photoUrl: picture || '',
          isEmailVerified: true,
        });
        isNew = true;
      }
      const token = signToken(mysqlUser);
      return res.json({
        ...userResponse(mysqlUser, token),
        requirePasswordSetup: isNew,
      });
    }

    // MongoDB fallback
    try {
      let user = await User.findOne({
        $or: [
          { googleId: sub },
          { email: email.toLowerCase() }
        ]
      });

      let isNewUser = false;
      if (user) {
        if (!user.isVerified) {
          user.isVerified = true;
          await user.save();
        }
      } else {
        const adminEmails = ['admin@glowora.com', 'brayw433@gmail.com'];
        const isAdminEmail = adminEmails.includes(email.toLowerCase());
        user = new User({
          name,
          email: email.toLowerCase(),
          googleId: sub,
          isVerified: true,
          role: isAdminEmail ? 'admin' : 'user'
        });
        await user.save();
        isNewUser = true;
      }

      const token = signToken(user);
      return res.json({
        ...userResponse(user, token),
        requirePasswordSetup: isNewUser
      });
    } catch {
      return res.status(500).json({ message: 'Google sign-in failed' });
    }
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.post('/forgot-password', async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ message: 'Email is required' });
    }

    if (isMySQLActive()) {
      const mysqlUser = await mysqlFindUserByEmail(email);
      if (mysqlUser) {
        await generateAndSendOtp(mysqlUser, true);
        return res.json({ message: 'A password reset code has been sent to your email.' });
      }
    }

    try {
      const user = await User.findOne({ email: email.toLowerCase() });
      if (user) {
        await generateAndSendOtp(user);
        return res.json({ message: 'A password reset code has been sent to your email.' });
      }
    } catch {
      // Fallback
    }

    return res.status(404).json({ message: 'No user registered with this email address' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.post('/reset-password', async (req, res) => {
  try {
    const { email, code, newPassword } = req.body;
    if (!email || !code || !newPassword) {
      return res.status(400).json({ message: 'Email, code, and new password are required' });
    }
    if (newPassword.length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters' });
    }

    if (isMySQLActive()) {
      const mysqlUser = await mysqlFindUserByEmail(email);
      if (mysqlUser && mysqlUser.otpHash) {
        const isMatch = await bcrypt.compare(code, mysqlUser.otpHash);
        if (!isMatch) {
          return res.status(400).json({ message: 'Invalid reset code' });
        }
        const hashedPassword = await bcrypt.hash(newPassword, 10);
        const updated = await mysqlUpdateUser(mysqlUser.id, {
          password: hashedPassword,
          isEmailVerified: 1,
          otpHash: null,
          otpExpires: null,
        });
        const token = signToken(updated);
        return res.json(userResponse(updated, token));
      }
    }

    try {
      const user = await User.findOne({ email: email.toLowerCase() }).select('+otpHash +otpExpires');
      if (user) {
        const isMatch = await bcrypt.compare(code, user.otpHash);
        if (!isMatch) return res.status(400).json({ message: 'Invalid reset code' });
        user.password = newPassword;
        user.isVerified = true;
        user.otpHash = undefined;
        user.otpExpires = undefined;
        await user.save();
        const token = signToken(user);
        return res.json(userResponse(user, token));
      }
    } catch {
      // Fallback
    }

    return res.status(404).json({ message: 'User not found' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.get('/me', protect, async (req, res) => {
  try {
    const userId = req.user.id || req.user._id;
    if (isMySQLActive()) {
      const mysqlUser = await mysqlFindUserById(userId);
      if (mysqlUser) {
        return res.json({
          _id: String(mysqlUser.id),
          id: mysqlUser.id,
          name: mysqlUser.name,
          email: mysqlUser.email,
          role: mysqlUser.role,
          phone: mysqlUser.phone || '',
          address: mysqlUser.address || '',
          city: mysqlUser.city || '',
          state: mysqlUser.state || '',
          zipCode: mysqlUser.zipCode || '',
          photoUrl: mysqlUser.photoUrl,
        });
      }
    }

    try {
      const user = await User.findById(userId);
      if (user) {
        return res.json({
          _id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          phone: user.phone || '',
          address: user.address || '',
          city: user.city || '',
          state: user.state || '',
          zipCode: user.zipCode || '',
          photoUrl: user.photoContentType ? `/api/images/user/${user._id}` : null,
        });
      }
    } catch {
      // Fallback
    }

    return res.status(404).json({ message: 'User not found' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.put('/profile', protect, async (req, res) => {
  try {
    const userId = req.user.id || req.user._id;
    const { name, phone, address, city, state, zipCode } = req.body;

    if (isMySQLActive()) {
      const updated = await mysqlUpdateUser(userId, {
        name,
        phone,
        address,
        city,
        state,
        zipCode,
      });
      return res.json({ message: 'Profile updated successfully', user: updated });
    }

    try {
      const user = await User.findById(userId);
      if (user) {
        if (name) user.name = name;
        if (phone !== undefined) user.phone = phone;
        if (address !== undefined) user.address = address;
        if (city !== undefined) user.city = city;
        if (state !== undefined) user.state = state;
        if (zipCode !== undefined) user.zipCode = zipCode;
        await user.save();
        return res.json({ message: 'Profile updated successfully', user });
      }
    } catch {
      // Fallback
    }

    return res.status(404).json({ message: 'User not found' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

export default router;
