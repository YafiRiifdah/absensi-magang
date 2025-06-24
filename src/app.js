import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';

import authRoutes from './routes/authRoutes.js';
import studentRoutes from './routes/studentRoutes.js';
import mentorRoutes from './routes/mentorRoutes.js';
import adminRoutes from './routes/adminRoutes.js';
import scheduleRoutes from './routes/scheduleRoutes.js';
import userRoutes from './routes/userRoutes.js';
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5001;

// Middleware
app.use(express.json());
app.use(cors({
  origin: 'http://localhost:3000',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/student', studentRoutes);
app.use('/api/mentor', mentorRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/schedule', scheduleRoutes);
app.use('/api/users', userRoutes);

// Basic route
app.get('/', (req, res) => {
  res.send('Intern Attendance Backend API is running!');
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});