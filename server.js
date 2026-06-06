const express = require('express');
const session = require('express-session');
const path = require('path');
const fs = require('fs');
const multer = require('multer');
const bcrypt = require('bcryptjs');
const { Inquiry, News, Setting, Admin } = require('./database');
const { Resend } = require('resend');
require('dotenv').config();

const app = express();
const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;
const PORT = process.env.PORT || 8080;

// Body parsing middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Session configuration
app.use(session({
  secret: process.env.SESSION_SECRET || 'goura_montessori_secure_secret_key',
  resave: false,
  saveUninitialized: false,
  cookie: { maxAge: 24 * 60 * 60 * 1000 } // 24 hours
}));

// Configure Multer to store uploaded files in memory
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });


// Security helper middleware
function requireAdmin(req, res, next) {
  if (req.session && req.session.isAdmin) {
    return next();
  }
  res.status(401).json({ error: 'Unauthorized' });
}

// Intercept admin page to redirect if unauthenticated
app.get('/admin.html', (req, res, next) => {
  if (!req.session.isAdmin) {
    return res.redirect('/login.html');
  }
  next();
});

// Serve static files from the public folder (after routing intercepts)
// This secures server.js, database.js, .env, and other server files from public access.
app.use(express.static(path.join(__dirname, 'public')));

// --- API ENDPOINTS ---

// 1. Admission Inquiry Submission (Public)
app.post('/api/inquiry', async (req, res) => {
  const { parentName, childName, gradeLevel, phoneNumber, message } = req.body;
  if (!parentName || !childName || !gradeLevel || !phoneNumber) {
    return res.status(400).json({ error: 'All fields except message are required.' });
  }

  try {
    const inquiry = new Inquiry({ parentName, childName, gradeLevel, phoneNumber, message });
    await inquiry.save();

    // Send email notification to registered admin
    sendInquiryEmailToAdmin({ parentName, childName, gradeLevel, phoneNumber, message });

    res.json({ success: true, message: 'Inquiry submitted successfully.' });
  } catch (err) {
    console.error('Error inserting inquiry:', err);
    res.status(500).json({ error: 'Failed to submit inquiry.' });
  }
});

// 2. Admin Login (Public)
app.post('/api/login', async (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) {
    return res.status(400).json({ error: 'Username and password are required.' });
  }

  try {
    const admin = await Admin.findOne({ username });
    if (!admin || !bcrypt.compareSync(password, admin.password)) {
      return res.status(401).json({ error: 'Invalid credentials.' });
    }

    req.session.isAdmin = true;
    req.session.username = username;
    res.json({ success: true });
  } catch (err) {
    console.error('Database query error during login:', err);
    res.status(500).json({ error: 'Internal server error.' });
  }
});

// HTML Email Template matching Goura City Montessori Website theme
function getEmailHtmlTemplate(otp) {
  return `
  <div style="font-family: 'Open Sans', 'Helvetica Neue', Helvetica, Arial, sans-serif; background-color: #FAF6EE; padding: 40px 20px; color: #2D2722; text-align: center;">
    <div style="max-width: 600px; margin: 0 auto; background-color: #FFFFFF; border: 1px solid #E6DEC9; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 12px rgba(178, 94, 67, 0.08); text-align: left;">
      <!-- Top Terracotta Header Accent -->
      <div style="background-color: #B25E43; height: 6px;"></div>
      
      <!-- Body Content -->
      <div style="padding: 40px 30px;">
        <!-- Logo Header -->
        <div style="margin-bottom: 30px; border-bottom: 1px solid #E6DEC9; padding-bottom: 20px;">
          <h1 style="font-family: 'Literata', Georgia, serif; color: #B25E43; font-size: 24px; margin: 0 0 6px 0; font-weight: normal; letter-spacing: 0.5px;">Goura City Montessori</h1>
          <p style="color: #7A6F62; font-size: 13px; margin: 0; text-transform: uppercase; letter-spacing: 1.5px; font-weight: 600;">Administration Security Portal</p>
        </div>
        
        <!-- Body Copy -->
        <p style="font-size: 16px; line-height: 1.6; color: #4E433A; margin: 0 0 20px 0;">Hello Administrator,</p>
        <p style="font-size: 15px; line-height: 1.6; color: #4E433A; margin: 0 0 24px 0;">We received a request to reset your Goura City Montessori administrator password. Please use the following 6-digit verification code (OTP) to proceed with the password recovery:</p>
        
        <!-- OTP Badge Card -->
        <div style="background-color: #FAF6EE; border: 1px dashed #B25E43; border-radius: 6px; padding: 24px; text-align: center; margin-bottom: 24px;">
          <span style="font-size: 36px; font-weight: bold; letter-spacing: 6px; color: #B25E43;">${otp}</span>
        </div>
        
        <!-- Expiry Notice -->
        <p style="font-size: 14px; line-height: 1.6; color: #8A7B6E; margin: 0 0 30px 0; text-align: center; font-style: italic;">This security code is active for <strong>15 minutes</strong> and can only be used once.</p>
        
        <p style="font-size: 14px; line-height: 1.6; color: #4E433A; margin: 0 0 10px 0;">If you did not initiate this request, please secure your account immediately.</p>
        
        <p style="font-size: 15px; line-height: 1.6; color: #4E433A; margin: 30px 0 0 0; border-top: 1px solid #E6DEC9; padding-top: 20px;">Warm regards,<br><strong style="color: #B25E43;">GCM Admin Security Team</strong></p>
      </div>
      
      <!-- Footer -->
      <div style="background-color: #FAF6EE; padding: 20px; text-align: center; font-size: 12px; color: #8A7B6E; border-top: 1px solid #E6DEC9;">
        <p style="margin: 0 0 6px 0;">Gaura City Montessori, Civil Lines, Hamirpur, Uttar Pradesh 210301</p>
        <p style="margin: 0;">&copy; 2026 Goura City Montessori. All rights reserved.</p>
      </div>
    </div>
  </div>`;
}

// HTML Email Template for Admissions/Contact Inquiries matching Goura City Montessori Website theme
function getEnquiryEmailHtmlTemplate(inquiry) {
  const { parentName, childName, gradeLevel, phoneNumber, message } = inquiry;
  return `
  <div style="font-family: 'Open Sans', 'Helvetica Neue', Helvetica, Arial, sans-serif; background-color: #FAF6EE; padding: 40px 20px; color: #2D2722; text-align: center;">
    <div style="max-width: 600px; margin: 0 auto; background-color: #FFFFFF; border: 1px solid #E6DEC9; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 12px rgba(178, 94, 67, 0.08); text-align: left;">
      <!-- Top Terracotta Header Accent -->
      <div style="background-color: #B25E43; height: 6px;"></div>
      
      <!-- Body Content -->
      <div style="padding: 40px 30px;">
        <!-- Logo Header -->
        <div style="margin-bottom: 30px; border-bottom: 1px solid #E6DEC9; padding-bottom: 20px;">
          <h1 style="font-family: 'Literata', Georgia, serif; color: #B25E43; font-size: 24px; margin: 0 0 6px 0; font-weight: normal; letter-spacing: 0.5px;">Goura City Montessori</h1>
          <p style="color: #7A6F62; font-size: 13px; margin: 0; text-transform: uppercase; letter-spacing: 1.5px; font-weight: 600;">New Admissions & Inquiry Desk</p>
        </div>
        
        <!-- Body Copy -->
        <p style="font-size: 16px; line-height: 1.6; color: #4E433A; margin: 0 0 20px 0;">Hello Administrator,</p>
        <p style="font-size: 15px; line-height: 1.6; color: #4E433A; margin: 0 0 24px 0;">A new user inquiry has been submitted through the school portal. Below are the details:</p>
        
        <!-- Inquiry Details Card -->
        <div style="background-color: #FAF6EE; border: 1px solid #E6DEC9; border-radius: 6px; padding: 20px; margin-bottom: 24px;">
          <table style="width: 100%; border-collapse: collapse; font-size: 14px;">
            <tr>
              <td style="padding: 6px 0; font-weight: 600; color: #7A6F62; width: 140px;">Parent Name:</td>
              <td style="padding: 6px 0; color: #2D2722;">${parentName}</td>
            </tr>
            <tr>
              <td style="padding: 6px 0; font-weight: 600; color: #7A6F62;">Child Name:</td>
              <td style="padding: 6px 0; color: #2D2722;">${childName}</td>
            </tr>
            <tr>
              <td style="padding: 6px 0; font-weight: 600; color: #7A6F62;">Grade Level:</td>
              <td style="padding: 6px 0; color: #2D2722;">${gradeLevel}</td>
            </tr>
            <tr>
              <td style="padding: 6px 0; font-weight: 600; color: #7A6F62;">Phone Number:</td>
              <td style="padding: 6px 0; color: #2D2722;"><a href="tel:${phoneNumber.replace(/\s+/g, '')}" style="color: #B25E43; text-decoration: none; font-weight: 600;">${phoneNumber}</a></td>
            </tr>
            ${message ? `
            <tr>
              <td style="padding: 12px 0 6px 0; font-weight: 600; color: #7A6F62; vertical-align: top;" colspan="2">Inquiry / Message:</td>
            </tr>
            <tr>
              <td style="padding: 6px 12px; color: #4E433A; background-color: #FFFFFF; border: 1px solid #E6DEC9; border-radius: 4px; line-height: 1.5;" colspan="2">${message}</td>
            </tr>` : ''}
          </table>
        </div>
        
        <p style="font-size: 14px; line-height: 1.6; color: #4E433A; margin: 0 0 10px 0;">Please follow up with the parent directly as soon as possible.</p>
        
        <p style="font-size: 15px; line-height: 1.6; color: #4E433A; margin: 30px 0 0 0; border-top: 1px solid #E6DEC9; padding-top: 20px;">Warm regards,<br><strong style="color: #B25E43;">GCM Inquiry Dispatcher</strong></p>
      </div>
      
      <!-- Footer -->
      <div style="background-color: #FAF6EE; padding: 20px; text-align: center; font-size: 12px; color: #8A7B6E; border-top: 1px solid #E6DEC9;">
        <p style="margin: 0 0 6px 0;">Gaura City Montessori, Civil Lines, Hamirpur, Uttar Pradesh 210301</p>
        <p style="margin: 0;">&copy; 2026 Goura City Montessori. All rights reserved.</p>
      </div>
    </div>
  </div>`;
}

// Send Inquiry details via Resend with simulated fallback logging
async function sendInquiryEmailToAdmin(inquiry) {
  let adminEmail = 'arpitkumar1101@gmail.com';
  try {
    const row = await Admin.findOne();
    if (row && row.username) {
      adminEmail = row.username;
    }
  } catch (err) {
    console.warn('Failed to retrieve registered admin email for inquiry notification. Defaulting to arpitkumar1101@gmail.com');
  }

  const htmlContent = getEnquiryEmailHtmlTemplate(inquiry);

  if (resend) {
    try {
      const response = await resend.emails.send({
        from: 'Goura City Montessori Portal <onboarding@resend.dev>',
        to: adminEmail,
        subject: `New School Inquiry: ${inquiry.parentName} (${inquiry.gradeLevel})`,
        html: htmlContent
      });
      if (response && !response.error) {
        console.log(`Inquiry notification email successfully sent to admin (${adminEmail}) via Resend. ID: ${response.data.id}`);
      } else {
        console.error('Resend returned error details for inquiry notification:', response.error);
      }
    } catch (err2) {
      console.error('Failed to send inquiry notification via Resend SDK:', err2);
    }
  }

  // Always log simulated email as fallback or verification log
  const logPath = path.join(__dirname, 'simulated_emails.log');
  const divider = '='.repeat(60);
  const logMessage = `
${divider}
Date: ${new Date().toLocaleString()}
To: ${adminEmail}
Subject: New School Inquiry: ${inquiry.parentName} (${inquiry.gradeLevel})
Parent: ${inquiry.parentName}
Child: ${inquiry.childName}
Grade: ${inquiry.gradeLevel}
Phone: ${inquiry.phoneNumber}
Message: ${inquiry.message || ''}

--- Styled HTML Message Sent ---
${htmlContent}
${divider}
`;
  fs.appendFileSync(logPath, logMessage, 'utf8');
}

// Log simulated email to simulated_emails.log
function logSimulatedEmail(email, otp, htmlContent) {
  const logPath = path.join(__dirname, 'simulated_emails.log');
  const divider = '='.repeat(60);
  const logMessage = `
${divider}
Date: ${new Date().toLocaleString()}
To: ${email}
Subject: Admin Password Reset Verification Code
OTP: ${otp}

--- Styled HTML Message Sent ---
${htmlContent}
${divider}
`;
  fs.appendFileSync(logPath, logMessage, 'utf8');
}

// Send OTP via Resend with simulated fallback logging
async function sendResetEmail(email, otp) {
  const htmlContent = getEmailHtmlTemplate(otp);
  let sentViaResend = false;

  if (resend) {
    try {
      const response = await resend.emails.send({
        from: 'Goura City Montessori Security <onboarding@resend.dev>',
        to: email,
        subject: 'Admin Password Reset Verification Code',
        html: htmlContent
      });
      if (response && !response.error) {
        sentViaResend = true;
        console.log(`Reset email successfully sent to ${email} via Resend. ID: ${response.data.id}`);
      } else {
        console.error('Resend returned error details:', response.error);
      }
    } catch (err) {
      console.error('Failed to send reset email via Resend SDK:', err);
    }
  }

  // Always log simulated email as fallback or verification log
  logSimulatedEmail(email, otp, htmlContent);
  return sentViaResend;
}

// 2a. Request Password Reset OTP (Public)
app.post('/api/forgot-password/request', async (req, res) => {
  let { email } = req.body;
  if (!email) {
    email = 'arpitkumar1101@gmail.com';
  }

  try {
    const admin = await Admin.findOne({ username: email });
    if (!admin) {
      // Return a success message to prevent user enumeration
      return res.json({ success: true, message: 'If the email matches a registered administrator account, a verification code has been sent.' });
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiry = Date.now() + 15 * 60 * 1000; // 15 mins

    admin.resetOtp = otp;
    admin.resetOtpExpiry = expiry;
    await admin.save();

    const sentReal = await sendResetEmail(email, otp);
    res.json({
      success: true,
      message: sentReal
        ? 'Verification code has been successfully dispatched to your email address.'
        : 'Verification code simulated. Please review simulated_emails.log to retrieve the OTP.'
    });
  } catch (err) {
    console.error('Database query error during forgot password:', err);
    res.status(500).json({ error: 'Internal database error.' });
  }
});

// 2b. Verify OTP and Reset Password (Public)
app.post('/api/forgot-password/verify-reset', async (req, res) => {
  let { email, otp, newPassword } = req.body;
  if (!email) {
    email = 'arpitkumar1101@gmail.com';
  }
  if (!otp || !newPassword) {
    return res.status(400).json({ error: 'Verification code and new password are required.' });
  }

  try {
    const admin = await Admin.findOne({ username: email });
    if (!admin) {
      return res.status(404).json({ error: 'Administrator account not found.' });
    }

    if (!admin.resetOtp || admin.resetOtp !== otp) {
      return res.status(400).json({ error: 'Invalid verification code.' });
    }

    if (!admin.resetOtpExpiry || admin.resetOtpExpiry < Date.now()) {
      return res.status(400).json({ error: 'Verification code has expired. Please request a new one.' });
    }

    const salt = bcrypt.genSaltSync(10);
    const hashedPassword = bcrypt.hashSync(newPassword, salt);

    admin.password = hashedPassword;
    admin.resetOtp = undefined;
    admin.resetOtpExpiry = undefined;
    await admin.save();

    res.json({ success: true, message: 'Password reset successfully. You can now log in.' });
  } catch (err) {
    console.error('Database query error during verification:', err);
    res.status(500).json({ error: 'Internal database error.' });
  }
});

// 3. Admin Logout (Public)
app.post('/api/logout', (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      console.error('Session destroy error:', err);
      return res.status(500).json({ error: 'Failed to log out.' });
    }
    res.json({ success: true });
  });
});

// 4. Get Inquiries (Admin Only)
app.get('/api/inquiries', requireAdmin, async (req, res) => {
  try {
    const rows = await Inquiry.find().sort({ createdAt: -1 });
    res.json(rows);
  } catch (err) {
    console.error('Error fetching inquiries:', err);
    res.status(500).json({ error: 'Failed to fetch inquiries.' });
  }
});

// 5. Delete Inquiry (Admin Only)
app.delete('/api/inquiries/:id', requireAdmin, async (req, res) => {
  const { id } = req.params;
  try {
    await Inquiry.findByIdAndDelete(id);
    res.json({ success: true });
  } catch (err) {
    console.error('Error deleting inquiry:', err);
    res.status(500).json({ error: 'Failed to delete inquiry.' });
  }
});

// 6. Get News Feed (Public)
app.get('/api/news', async (req, res) => {
  const limit = req.query.limit ? parseInt(req.query.limit, 10) : null;
  try {
    let query = News.find().sort({ createdAt: -1 });
    if (limit && !isNaN(limit)) {
      query = query.limit(limit);
    }
    const rows = await query;
    res.json(rows);
  } catch (err) {
    console.error('Error fetching news:', err);
    res.status(500).json({ error: 'Failed to fetch news.' });
  }
});

// 7. Add News Article (Admin Only, supports image upload)
app.post('/api/news', requireAdmin, upload.single('newsImage'), async (req, res) => {
  const { title, content, date, category } = req.body;
  if (!title || !content || !date || !category) {
    return res.status(400).json({ error: 'Title, content, date, and category are required.' });
  }

  let imageUrl = null;
  if (req.file) {
    const base64Data = req.file.buffer.toString('base64');
    imageUrl = `data:${req.file.mimetype};base64,${base64Data}`;
  }

  try {
    const newsItem = new News({ title, content, imageUrl, date, category });
    await newsItem.save();
    res.json({ success: true, message: 'News article created successfully.' });
  } catch (err) {
    console.error('Error inserting news:', err);
    res.status(500).json({ error: 'Failed to add news article.' });
  }
});

// 8. Delete News Article (Admin Only)
app.delete('/api/news/:id', requireAdmin, async (req, res) => {
  const { id } = req.params;
  try {
    await News.findByIdAndDelete(id);
    res.json({ success: true });
  } catch (err) {
    console.error('Error deleting news:', err);
    res.status(500).json({ error: 'Failed to delete news article.' });
  }
});

// 9. Get Settings (Public)
app.get('/api/settings', async (req, res) => {
  try {
    const rows = await Setting.find();
    const settingsMap = {};
    rows.forEach(r => {
      settingsMap[r.key] = r.value;
    });
    res.json(settingsMap);
  } catch (err) {
    console.error('Error fetching settings:', err);
    res.status(500).json({ error: 'Failed to fetch settings.' });
  }
});

// 10. Update Settings (Admin Only)
app.post('/api/settings', requireAdmin, async (req, res) => {
  const { phone, email, address, announcement, map_link, announcement_enabled } = req.body;

  try {
    const updates = { phone, email, address, announcement, map_link, announcement_enabled };
    for (const [key, value] of Object.entries(updates)) {
      if (value !== undefined) {
        await Setting.findOneAndUpdate({ key }, { value }, { upsert: true });
      }
    }
    res.json({ success: true, message: 'Settings updated successfully.' });
  } catch (err) {
    console.error('Error updating settings:', err);
    res.status(500).json({ error: 'Failed to update settings.' });
  }
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running at http://localhost:${PORT}`);
});
