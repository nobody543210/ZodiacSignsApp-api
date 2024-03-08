require('dotenv').config();
require('./config/sendMonthlyReadings');
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const corsOptions = require('./config/corsOptions');
const connectDB = require('./config/dbConnection');
const { logger } = require('./middleware/logEvents');
const app = express();
const userRoutes = require('./routes/userRoutes');
const PORT = process.env.PORT || 3500;
connectDB();

app.use(cors(corsOptions));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(logger); 

app.use('/', userRoutes);

mongoose.connection.once('open', () => {
    console.log('MongoDB connection established successfully');
    app.listen(PORT,()=> console.log(`server running on port ${PORT}`))
});
