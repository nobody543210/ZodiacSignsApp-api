const cron = require('node-cron');
const Reading = require('../models/reading');
const path = require('path'); 
const User = require('../models/user'); 
const transporter = require('./nodemailerSetup');
const EMAIL = process.env.EMAIL;
const readHTMLFile = require('../read');
const handlebars = require('handlebars');

const sendEmail = async (email, name, zodiacSign, reading, unsubscribeLink) => {
    readHTMLFile(path.join(__dirname ,'../routes/monthly.html'), async (err, html) => {
        if (err) {
            console.log('Error reading HTML file:', err);
            return;
        }
        const template = handlebars.compile(html);
        const replacements = {
            username: name,
            unsubscribeLink: unsubscribeLink,
            reading: reading
        };
        const htmlToSend = template(replacements);

        try {
            await transporter.sendMail({
                from: '<' + process.env.EMAIL + '> Zodiac Signs App',
                to: email,
                subject: 'Your Monthly Zodiac Reading',
                text: 'HI',
                html: htmlToSend
            });
        } catch (error) {
            console.error('Error sending email:', error);
        }
    });
};

cron.schedule('0 0 1 * *', async () => {
    try {
        const readingDocument = await Reading.findOne();
        if (!readingDocument) {
            console.error('No readings found in the database');
            return;
        }
        const readings = readingDocument.toObject(); 
        const users = await User.find({ email: { $exists: true, $ne: '' } });
        for (const user of users) {
            const zodiacSign = user.zodiacSign;
            const reading = readings[zodiacSign];
            if (!reading) {
                console.error(`Reading not found for zodiac sign ${zodiacSign}`);
                continue;
            }
            const unsubscribeToken = user.unsubscribeToken;
            const unsubscribeLink = `http://localhost:${process.env.PORT}/unsubscribe?email=${encodeURIComponent(user.email)}&token=${encodeURIComponent(unsubscribeToken)}`;
            await sendEmail(user.email, user.name, user.zodiacSign, reading, unsubscribeLink);
        }
        console.log('Monthly readings sent successfully');
    } catch (error) {
        console.error('Error sending monthly readings:', error);
    }
});