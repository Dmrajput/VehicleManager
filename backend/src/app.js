const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');

const { notFound, errorHandler } = require('./middleware/errorHandler');

const authRoutes = require('./routes/authRoutes');
const vehicleRoutes = require('./routes/vehicleRoutes');
const fuelRoutes = require('./routes/fuelRoutes');
const serviceRoutes = require('./routes/serviceRoutes');
const reminderRoutes = require('./routes/reminderRoutes');
const userRoutes = require('./routes/userRoutes');

const app = express();

app.use(helmet());
app.use(cors());
app.use(express.json({ limit: '5mb' }));
app.use(express.urlencoded({ extended: true }));
if (process.env.NODE_ENV !== 'test') {
  app.use(morgan('dev'));
}

const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 300,
  standardHeaders: true,
  legacyHeaders: false,
});
app.use('/api', apiLimiter);

// Root route so health checks / browser visits to "/" get a friendly 200
// instead of a 404 (Render pings the root path).
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'Vehicle Manager API',
    health: '/api/health',
    version: '1.0.0',
  });
});

app.get('/api/health', (req, res) => {
  res.json({ success: true, message: 'Vehicle Manager API is running', time: new Date() });
});

app.use('/api/auth', authRoutes);
app.use('/api/vehicle', vehicleRoutes);
app.use('/api/fuel', fuelRoutes);
app.use('/api/service', serviceRoutes);
app.use('/api/reminders', reminderRoutes);
app.use('/api/user', userRoutes);

app.use(notFound);
app.use(errorHandler);

module.exports = app;
