const express = require('express');
const multer = require('multer');
const bcrypt = require('bcrypt');
const nodemailer = require('nodemailer');

const app = express();
const upload = multer({ dest: 'uploads/' });

app.use(express.json());

app.post('/register', upload.single('profile_photo'), async (req, res) => {
    const { username, email, password } = req.body;
    const profilePhoto = req.file;

    // Input validation
    if (!username || !email || !password) {
        return res.status(400).json({ success: false, message: 'All fields are required.' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Save user to database (replace this with actual DB logic)
    console.log('Saving user:', { username, email, hashedPassword, profilePhoto });

    // Send email confirmation
    const transporter = nodemailer.createTransport({
        service: 'Gmail',
        auth: { user: 'your-email@gmail.com', pass: 'your-password' },
    });

    try {
        await transporter.sendMail({
            from: '"Your App" <your-email@gmail.com>',
            to: email,
            subject: 'Registration Successful',
            text: `Hi ${username}, your account has been created!`,
        });
        res.json({ success: true });
    } catch (error) {
        console.error('Email sending failed:', error);
        res.status(500).json({ success: false, message: 'Registration succeeded but email failed.' });
    }
});

app.listen(3000, () => console.log('Server running on http://localhost:3000'));
