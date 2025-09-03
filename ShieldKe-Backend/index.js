// index.js
const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors'); // ✅ import cors
const connectDB = require('./config/db');
const authRoutes = require('./routes/authRoutes');
const lawyerRoutes = require('./routes/lawyerRoutes');
const clientRoutes = require('./routes/clientRoutes');
const notFound = require('./middleware/notFound');
const errorHandler = require('./middleware/errorHandler');

dotenv.config();
connectDB();

const app = express();

// ✅ Middleware
app.use(cors()); // allow frontend -> backend calls
app.use(express.json());

// ✅ Test route (this is optional, just for debugging)
app.get('/', (req, res) => {
  res.json({ message: 'Backend is running on port 5000 🚀' });
});

// ✅ Routes
app.use('/api/auth', authRoutes);
app.use('/api/lawyers', lawyerRoutes);
app.use('/api/clients', clientRoutes);


// ✅ Error Handling
app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
