const allowedOrigins = [
    'https://zodiacsignsapp.onrender.com',
    'https://localhost:3000/',
    'https://localhost:3000/',
    'https://127.0.0.1:3000/'
];

const corsOptions = {
    origin: (origin, callback) => {
        if (allowedOrigins.indexOf(origin) !== -1 || !origin) {
            callback(null, true)
        } else {
            callback(new Error('Not allowed by CORS'));
        }
    },
    optionsSuccessStatus: 200
}

module.exports = corsOptions;
