const express = require('express');
const userModel = require('./models/user')
const userRouter = require('./routes/userRouter');
const eventRouter = require('./routes/eventRouter');
const galleryRouter = require('./routes/galleryRouter');
const appLogger = require('./middlewares/appLogger');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const expressSession = require('express-session')
const db = require('./config/mongoose-config');
const errorMidddleware = require('./middlewares/errorMiddleware');
const app = express();
const PORT = process.env.PORT || 9000;

app.use(cors());

require('dotenv').config();
app.use(appLogger);
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(errorMidddleware)

app.use(expressSession({
  resave:false,
  saveUninitialized:false,
  secret:process.env.EXPRESS_SESSION_SECRET,
  cookie: { secure: true }
}))

db.on('connected', () => {
  console.log('Mongoose connected to MongoDB Atlas');
});

db.on('error', (err) => {
  console.error('Mongoose connection error:', err);
});

db.on('disconnected', () => {
  console.log('Mongoose disconnected from MongoDB Atlas');
});

app.get('/verify-email', async (req, res) => {
  const { token } = req.query;

  try {
    // Find the user with the matching token
    const user = await userModel.findOne({ verificationToken: token, tokenExpiry: { $gt: Date.now() } });

    if (!user) {
      return res.status(400).json({ message: 'Invalid or expired token.' });
    }

    // Mark the user as verified
    user.isVerified = true;
    user.verificationToken = undefined;
    user.tokenExpiry = undefined;
    
    await user.save();
console.log("Email verified successfully");

    res.status(200).json({ message: 'Email verified successfully. You can now log in.' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
    console.log("Error: ",error);
    
  }
});


app.use('/api/user', userRouter);
// app.use('/api/admin', adminRouter);
app.use('/api/event', eventRouter);
app.use('/api/gallery', galleryRouter);

app.listen(PORT,"0.0.0.0", () => {
  console.log(`Server started on port ${PORT}`);
});
