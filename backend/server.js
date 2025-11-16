
// NHEA BACKEND API - PostgreSQL Version
// Node.js + Express + PostgreSQL + Prisma ORM
// ============================================

// server.js
require('dotenv').config();
const express = require('express');
const { PrismaClient } = require('@prisma/client');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');

const app = express();
const prisma = new PrismaClient();

// ============================================
// MIDDLEWARE & SECURITY
// ============================================
app.get('/', (req, res) => {
  res.send('🚀 NHEA Backend API is running!');
});

app.use(helmet());
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5000',
  credentials: true
}));
app.use(express.json());

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100
});
app.use('/api/', limiter);

// ============================================
// UTILITIES
// ============================================

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp-relay.brevo.com',
  port: process.env.SMTP_PORT || 587,
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS
  }
});

const generateVerificationCode = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

const sendVerificationEmail = async (email, code) => {
  try {
    const mailOptions = {
      from: process.env.EMAIL_FROM || 'noreply@nhea.com',
      to: email,
      subject: 'NHEA - Verify Your Email',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #2563eb;">Welcome to NHEA 2025!</h2>
          <p>Your verification code is:</p>
          <div style="background: #f3f4f6; padding: 20px; text-align: center; font-size: 32px; font-weight: bold; letter-spacing: 5px; margin: 20px 0;">
            ${code}
          </div>
          <p>This code will expire in 15 minutes.</p>
        </div>
      `
    };
    await transporter.sendMail(mailOptions);
  } catch (error) {
    console.log('Email error (can ignore for now):', error.message);
  }
};

const logAudit = async (userId, action, details, ipAddress) => {
  try {
    await prisma.auditLog.create({
      data: {
        userId,
        action,
        details: JSON.stringify(details),
        ipAddress
      }
    });
  } catch (error) {
    console.error('Audit log error:', error);
  }
};

// ============================================
// AUTHENTICATION MIDDLEWARE
// ============================================

const authenticateToken = async (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'Access token required' });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: { id: true, name: true, email: true, role: true, isVerified: true }
    });
    
    if (!user) return res.status(401).json({ error: 'User not found' });
    req.user = user;
    next();
  } catch (error) {
    return res.status(403).json({ error: 'Invalid or expired token' });
  }
};

const requireAdmin = (req, res, next) => {
  if (req.user.role !== 'ADMIN') {
    return res.status(403).json({ error: 'Admin access required' });
  }
  next();
};

const requireVerified = (req, res, next) => {
  if (!req.user.isVerified) {
    return res.status(403).json({ error: 'Email verification required' });
  }
  next();
};

// ============================================
// AUTHENTICATION ROUTES
// ============================================

app.post('/api/auth/signup', async (req, res) => {
  try {
    const { name, email, password } = req.body;
    
    if (!name || !email || !password) {
      return res.status(400).json({ error: 'All fields are required' });
    }
    
    if (password.length < 8) {
      return res.status(400).json({ error: 'Password must be at least 8 characters' });
    }

    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ error: 'Email already registered' });
    }

    const hashedPassword = await bcrypt.hash(password, 12);
    const verificationCode = generateVerificationCode();
    const verificationCodeExpiry = new Date(Date.now() + 15 * 60 * 1000);

    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        verificationCode,
        verificationCodeExpiry
      }
    });

    await sendVerificationEmail(email, verificationCode);
    await logAudit(user.id, 'USER_SIGNUP', { email }, req.ip);

    res.status(201).json({
      message: 'User created. Please check your email for verification code.',
      userId: user.id,
      email: user.email
    });
  } catch (error) {
    console.error('Signup error:', error);
    res.status(500).json({ error: 'Server error during signup' });
  }
});

app.post('/api/auth/verify-email', async (req, res) => {
  try {
    const { email, code } = req.body;
    
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) return res.status(404).json({ error: 'User not found' });
    if (user.isVerified) return res.status(400).json({ error: 'Email already verified' });
    if (user.verificationCode !== code) {
      return res.status(400).json({ error: 'Invalid verification code' });
    }
    if (new Date() > user.verificationCodeExpiry) {
      return res.status(400).json({ error: 'Verification code expired' });
    }

    const updatedUser = await prisma.user.update({
      where: { id: user.id },
      data: {
        isVerified: true,
        verificationCode: null,
        verificationCodeExpiry: null
      }
    });

    const token = jwt.sign(
      { userId: updatedUser.id, role: updatedUser.role },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    await logAudit(updatedUser.id, 'EMAIL_VERIFIED', { email }, req.ip);

    res.json({
      token,
      user: {
        id: updatedUser.id,
        name: updatedUser.name,
        email: updatedUser.email,
        role: updatedUser.role
      }
    });
  } catch (error) {
    console.error('Verification error:', error);
    res.status(500).json({ error: 'Server error during verification' });
  }
});

app.post('/api/auth/resend-code', async (req, res) => {
  try {
    const { email } = req.body;
    
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) return res.status(404).json({ error: 'User not found' });
    if (user.isVerified) return res.status(400).json({ error: 'Email already verified' });

    const verificationCode = generateVerificationCode();
    const verificationCodeExpiry = new Date(Date.now() + 15 * 60 * 1000);

    await prisma.user.update({
      where: { id: user.id },
      data: { verificationCode, verificationCodeExpiry }
    });

    await sendVerificationEmail(email, verificationCode);
    res.json({ message: 'Verification code resent' });
  } catch (error) {
    console.error('Resend code error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

app.post('/api/auth/signin', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) return res.status(401).json({ error: 'Invalid credentials' });

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) return res.status(401).json({ error: 'Invalid credentials' });
    if (!user.isVerified) return res.status(403).json({ error: 'Please verify your email first' });

    const token = jwt.sign(
      { userId: user.id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    await logAudit(user.id, 'USER_SIGNIN', { email }, req.ip);

    res.json({
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    console.error('Signin error:', error);
    res.status(500).json({ error: 'Server error during signin' });
  }
});

// ============================================
// CATEGORY ROUTES
// ============================================

app.get('/api/categories', async (req, res) => {
  try {
    const categories = await prisma.category.findMany({
      where: { isActive: true },
      orderBy: { createdAt: 'desc' }
    });
    res.json(categories);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

app.post('/api/categories', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { name, description } = req.body;
    
    const category = await prisma.category.create({
      data: { name, description }
    });

    await logAudit(req.user.id, 'CATEGORY_CREATED', { categoryId: category.id, name }, req.ip);
    res.status(201).json(category);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

app.put('/api/categories/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const category = await prisma.category.update({
      where: { id: parseInt(req.params.id) },
      data: req.body
    });

    await logAudit(req.user.id, 'CATEGORY_UPDATED', { categoryId: category.id }, req.ip);
    res.json(category);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// ============================================
// NOMINATION ROUTES
// ============================================

app.post('/api/nominations', authenticateToken, requireVerified, async (req, res) => {
  try {
    const { categoryId, nomineeName, nomineeEmail, organization, reason } = req.body;

    if (!categoryId || !nomineeName || !nomineeEmail || !reason) {
      return res.status(400).json({ error: 'Missing required fields' });
    }
    
    if (reason.length < 100) {
      return res.status(400).json({ error: 'Reason must be at least 100 characters' });
    }

    const category = await prisma.category.findUnique({
      where: { id: parseInt(categoryId) }
    });
    if (!category) return res.status(404).json({ error: 'Category not found' });

    const nomination = await prisma.nomination.create({
      data: {
        categoryId: parseInt(categoryId),
        nomineeName,
        nomineeEmail,
        organization,
        reason,
        submittedById: req.user.id
      }
    });

    await logAudit(req.user.id, 'NOMINATION_SUBMITTED', { nominationId: nomination.id }, req.ip);
    res.status(201).json(nomination);
  } catch (error) {
    console.error('Nomination error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

app.get('/api/nominations', authenticateToken, async (req, res) => {
  try {
    const { status, categoryId } = req.query;
    const where = {};

    if (req.user.role === 'PUBLIC') {
      where.status = 'APPROVED';
    } else if (status) {
      where.status = status.toUpperCase();
    }

    if (categoryId) {
      where.categoryId = parseInt(categoryId);
    }

    const nominations = await prisma.nomination.findMany({
      where,
      include: {
        category: { select: { name: true } },
        submittedBy: { select: { name: true, email: true } }
      },
      orderBy: { createdAt: 'desc' }
    });

    res.json(nominations);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

app.patch('/api/nominations/:id/review', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { status } = req.body;
    
    if (!['APPROVED', 'REJECTED'].includes(status.toUpperCase())) {
      return res.status(400).json({ error: 'Invalid status' });
    }

    const nomination = await prisma.nomination.update({
      where: { id: parseInt(req.params.id) },
      data: {
        status: status.toUpperCase(),
        reviewedById: req.user.id,
        reviewedAt: new Date()
      }
    });

    await logAudit(req.user.id, 'NOMINATION_REVIEWED', { nominationId: nomination.id, status }, req.ip);
    res.json(nomination);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// ============================================
// VOTING ROUTES
// ============================================

app.post('/api/votes', authenticateToken, requireVerified, async (req, res) => {
  try {
    const { categoryId, nominationId } = req.body;

    const settings = await prisma.eventSettings.findFirst();
    if (settings && !settings.votingEnabled) {
      return res.status(403).json({ error: 'Voting is currently disabled' });
    }

    if (settings) {
      const now = new Date();
      if (settings.votingStartDate && now < settings.votingStartDate) {
        return res.status(403).json({ error: 'Voting has not started yet' });
      }
      if (settings.votingEndDate && now > settings.votingEndDate) {
        return res.status(403).json({ error: 'Voting has ended' });
      }
    }

    const nomination = await prisma.nomination.findFirst({
      where: { id: parseInt(nominationId), status: 'APPROVED' }
    });
    if (!nomination) {
      return res.status(404).json({ error: 'Nomination not found or not approved' });
    }

    const existingVote = await prisma.vote.findFirst({
      where: {
        userId: req.user.id,
        categoryId: parseInt(categoryId)
      }
    });

    if (existingVote) {
      return res.status(400).json({ error: 'You have already voted in this category' });
    }

    const vote = await prisma.vote.create({
      data: {
        userId: req.user.id,
        categoryId: parseInt(categoryId),
        nominationId: parseInt(nominationId),
        ipAddress: req.ip
      }
    });

    await logAudit(req.user.id, 'VOTE_CAST', { voteId: vote.id, categoryId }, req.ip);
    res.status(201).json({ message: 'Vote recorded successfully', vote });
  } catch (error) {
    console.error('Vote error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

app.get('/api/votes/my-votes', authenticateToken, requireVerified, async (req, res) => {
  try {
    const votes = await prisma.vote.findMany({
      where: { userId: req.user.id },
      include: {
        category: { select: { name: true } },
        nomination: { select: { nomineeName: true } }
      }
    });

    res.json(votes);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

app.get('/api/votes/analytics', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const totalVotes = await prisma.vote.count();
    const uniqueVoters = await prisma.vote.groupBy({
      by: ['userId']
    });

    const votesByCategory = await prisma.vote.groupBy({
      by: ['categoryId'],
      _count: { id: true }
    });

    const categoriesWithVotes = await Promise.all(
      votesByCategory.map(async (item) => {
        const category = await prisma.category.findUnique({
          where: { id: item.categoryId }
        });
        return {
          categoryName: category?.name,
          voteCount: item._count.id
        };
      })
    );

    const topNominees = await prisma.vote.groupBy({
      by: ['nominationId'],
      _count: { id: true },
      orderBy: { _count: { id: 'desc' } },
      take: 10
    });

    const nomineesWithDetails = await Promise.all(
      topNominees.map(async (item) => {
        const nomination = await prisma.nomination.findUnique({
          where: { id: item.nominationId },
          include: { category: true }
        });
        return {
          nomineeName: nomination?.nomineeName,
          categoryName: nomination?.category.name,
          voteCount: item._count.id
        };
      })
    );

    res.json({
      totalVotes,
      uniqueVoters: uniqueVoters.length,
      votesByCategory: categoriesWithVotes,
      topNominees: nomineesWithDetails
    });
  } catch (error) {
    console.error('Analytics error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// ============================================
// EVENT SETTINGS
// ============================================

app.get('/api/settings', async (req, res) => {
  try {
    let settings = await prisma.eventSettings.findFirst();
    if (!settings) {
      settings = await prisma.eventSettings.create({ data: {} });
    }
    res.json(settings);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

app.put('/api/settings', authenticateToken, requireAdmin, async (req, res) => {
  try {
    let settings = await prisma.eventSettings.findFirst();
    
    if (!settings) {
      settings = await prisma.eventSettings.create({ data: req.body });
    } else {
      settings = await prisma.eventSettings.update({
        where: { id: settings.id },
        data: { ...req.body, updatedAt: new Date() }
      });
    }

    await logAudit(req.user.id, 'SETTINGS_UPDATED', req.body, req.ip);
    res.json(settings);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

app.post('/api/settings/reveal-winners', authenticateToken, requireAdmin, async (req, res) => {
  try {
    let settings = await prisma.eventSettings.findFirst();
    
    if (!settings) {
      settings = await prisma.eventSettings.create({
        data: { resultsAnnounced: true }
      });
    } else {
      settings = await prisma.eventSettings.update({
        where: { id: settings.id },
        data: { resultsAnnounced: true }
      });
    }

    await logAudit(req.user.id, 'WINNERS_REVEALED', {}, req.ip);
    res.json({ message: 'Winners revealed successfully', settings });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// ============================================
// RSVP ROUTES
// ============================================

app.post('/api/rsvp', authenticateToken, requireVerified, async (req, res) => {
  try {
    const { attending, numberOfGuests } = req.body;

    const existingRsvp = await prisma.rSVP.findUnique({
      where: { userId: req.user.id }
    });

    let rsvp;
    if (existingRsvp) {
      rsvp = await prisma.rSVP.update({
        where: { userId: req.user.id },
        data: { attending, numberOfGuests }
      });
    } else {
      rsvp = await prisma.rSVP.create({
        data: {
          userId: req.user.id,
          attending,
          numberOfGuests
        }
      });
    }

    await logAudit(req.user.id, 'RSVP_SUBMITTED', { attending, numberOfGuests }, req.ip);
    res.json(rsvp);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

app.get('/api/rsvp/me', authenticateToken, requireVerified, async (req, res) => {
  try {
    const rsvp = await prisma.rSVP.findUnique({
      where: { userId: req.user.id }
    });
    res.json(rsvp || null);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

app.get('/api/rsvp/stats', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const totalRSVPs = await prisma.rSVP.count();
    const attending = await prisma.rSVP.count({ where: { attending: true } });
    const notAttending = await prisma.rSVP.count({ where: { attending: false } });
    
    const guestsResult = await prisma.rSVP.aggregate({
      where: { attending: true },
      _sum: { numberOfGuests: true }
    });

    res.json({
      totalRSVPs,
      attending,
      notAttending,
      totalGuests: guestsResult._sum.numberOfGuests || 0
    });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// ============================================
// ADMIN DASHBOARD STATS
// ============================================

app.get('/api/admin/dashboard-stats', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const totalNominations = await prisma.nomination.count();
    const pendingNominations = await prisma.nomination.count({ where: { status: 'PENDING' } });
    const approvedNominations = await prisma.nomination.count({ where: { status: 'APPROVED' } });
    const totalVotes = await prisma.vote.count();
    const totalCategories = await prisma.category.count();
    const totalUsers = await prisma.user.count({ where: { role: 'PUBLIC' } });

    res.json({
      totalNominations,
      pendingNominations,
      approvedNominations,
      totalVotes,
      totalCategories,
      totalUsers
    });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// ============================================
// SERVER START
// ============================================

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`✅ PostgreSQL connected via Prisma`);
});

// Graceful shutdown
process.on('SIGTERM', async () => {
  console.log('SIGTERM received, closing server...');
  await prisma.$disconnect();
  process.exit(0);
});

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});
