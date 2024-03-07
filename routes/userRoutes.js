const crypto = require('crypto')
const express = require('express');
const router = express.Router();
const path = require('path');
const User = require('../models/user');
const readHTMLFile = require('../read');
const transporter = require('../config/nodemailerSetup');
const handlebars = require('handlebars');
const Reading = require('../models/reading');

const checkIfUserExists = async (email) => {
    try {
        const user = await User.findOne({ email });
        return !!user;
    } catch (error) {
        console.error('Error checking user existence:', error);
        return false;
    }
};

const generateUnsubscribeToken = (length) => {
    return crypto.randomBytes(length).toString('hex');
};

const sendWelcomeEmail = async (email, name, zodiacSign, unsubscribeLink) => {
  readHTMLFile(path.join(__dirname ,'../routes/welcome.html'), async (err, html) => {
      if (err) {
          console.log('Error reading HTML file:', err);
          return;
      }
      const template = handlebars.compile(html);
      const replacements = {
          username: name,
          unsubscribeLink: unsubscribeLink
      };
      const htmlToSend = template(replacements);

      try {
          await transporter.sendMail({
              from: '<' + process.env.EMAIL + '> Zodiac Signs App',
              to: email,
              subject: 'Welcome',
              text: 'HI',
              html: htmlToSend
          });
      } catch (error) {
          console.error('Error sending email:', error);
      }
  });
};

router.get('/readings', async (req, res) => {
    try {
        const { zodiacSign } = req.query;
        const reading = await Reading.findOne({ zodiacSign });
       console.log(reading)
        if (reading) {
            res.status(200).json(reading);
        } else {
            res.status(404).json({ error: 'Reading not found' });
        }
    } catch (error) {
        console.error('Error fetching readings:', error);
        res.status(500).json({ error: 'An error occurred while fetching readings' });
    }
});
  
router.get('/checkUser', async (req, res) => {
    try {
        const { email } = req.query;
        const userExists = await checkIfUserExists(email);
        res.json({ exists: userExists });
    } catch (error) {
        console.error('Error checking user existence:', error);
        res.status(500).json({ error: 'An error occurred while checking user existence' });
    }
});

router.post('/subscribeNewsletter', async (req, res) => {
    try {
        const { name, email, zodiacSign } = req.body;
        const newUser = new User({
            name,
            email,
            zodiacSign,
            unsubscribeToken: generateUnsubscribeToken(32),
        });
        await newUser.save();
        const unsubscribeToken = newUser.unsubscribeToken;
        const unsubscribeLink = `http://localhost:${process.env.PORT}/unsubscribe?email=${encodeURIComponent(newUser.email)}&token=${encodeURIComponent(unsubscribeToken)}`;

        await sendWelcomeEmail(email, name, zodiacSign, unsubscribeLink);

        return res.status(200).json({ message: 'Subscription successful' });
    } catch (error) {
        console.error('Error subscribing to newsletter:', error);
        res.status(500).send('Error subscribing to newsletter');
    }
});

router.get('/unsubscribe', async (req, res) => {
    try {
        const { email, token } = req.query;
        const user = await User.findOne({ email, unsubscribeToken: token });

        if (user) {
            await User.deleteOne({ email });
            res.status(200).sendFile(path.join(__dirname, 'unsubscribed.html'));;
        } else {
            res.status(404).sendFile(path.join(__dirname, 'usernotfound.html'));
        }
    } catch (error) {
        console.error('Error unsubscribing user:', error);
        res.status(500).send('An error occurred while processing your request.');
    }
});

module.exports = router;
