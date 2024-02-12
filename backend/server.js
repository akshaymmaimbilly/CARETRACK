const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cors = require('cors');
const bcrypt = require('bcrypt');
const multer = require('multer');
const app = express();

app.use(cors());
app.use(bodyParser.json());

// MongoDB Connection
const mongoURI = 'mongodb+srv://akshaymmaimbilly:akshaymm@cluster0.iyvhtug.mongodb.net/?retryWrites=true&w=majority';

mongoose.connect(mongoURI, { useNewUrlParser: true, useUnifiedTopology: true });

const connection = mongoose.connection;

connection.on('error', (err) => {
  console.error('MongoDB connection error:', err);
});

connection.once('open', async () => {
  console.log('Connected to MongoDB');

  // Define Patient Schema
  const patientSchema = new mongoose.Schema({
    personalDetails: {
      id: String,
      name: String,
      gender: String,
      dob: Date,
      age: Number,
      place: String
    },
    contactDetails: {
      phoneNumber: String,
      bystanderPhoneNumber: String,
      email: String
    },
    medicalRecords: {
      allergies: String,
      treatments: String,
      medicalAlerts: String,
      principleDoctor: String,
      hospital: String,
      reasonForAdmission: String,
      principleDiagnosis: String,
      otherDiagnosis: String,
      operationProcedure: String,
      description: String,
      medicines: String,
      patientHistory: String
    }
  });
  const Patient = mongoose.model('Patient', patientSchema);

  // Define User Schema
  const userSchema = new mongoose.Schema({
    username: String,
    password: String,
  });

  const User = mongoose.model('User', userSchema);

  const imageSchema = new mongoose.Schema({
    name: {
      type: String,
      required: true
    },
    path: {
      type: String,
      required: true
    },
    createdAt: {
      type: Date,
      default: Date.now
    }
  });
  
  // Create the Image model
  const Image = mongoose.model('Image', imageSchema);

  // Multer configuration
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, '.');
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + '-' + file.originalname);
  }
});

const upload = multer({ storage: storage });
  // User Registration Endpoint
  app.post('/api/user/register', async (req, res) => {
    const { username, password } = req.body;

    try {
      const existingUser = await User.findOne({ username });

      if (existingUser) {
        return res.json({ success: false, message: 'Username already exists' });
      }

      const hashedPassword = await bcrypt.hash(password, 10);

      const newUser = new User({ username, password: hashedPassword });
      await newUser.save();

      res.json({ success: true, message: 'User registered successfully' });
    } catch (error) {
      console.error('Error during user registration:', error.message);
      res.status(500).json({ success: false, message: 'Internal server error' });
    }
  });

  // User Login Endpoint
  app.post('/api/user/login', async (req, res) => {
    const { username, password } = req.body;

    const user = await User.findOne({ username });

    if (user) {
      const passwordMatch = await bcrypt.compare(password, user.password);

      if (passwordMatch) {
        res.json({ success: true, message: 'Login successful' });
      } else {
        res.json({ success: false, message: 'Invalid credentials' });
      }
    } else {
      res.json({ success: false, message: 'Invalid credentials' });
    }
  });

  // Routes
app.get('/api/patient', async (req, res) => {
  try {
    const patient = await Patient.findOne();
    res.json(patient);
  } catch (error) {
    console.error('Error fetching patient data:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});
  //api endpoint
  app.post('/api/patient/personalDetails', async (req, res) => {
    const newData = req.body;
    try {
      const patient = await Patient.findOneAndUpdate({}, { personalDetails: newData }, { new: true, upsert: true });
      res.json({ success: true });
    } catch (error) {
      console.error('Error updating personal details:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });
  
  app.post('/api/patient/contactDetails', async (req, res) => {
    const newData = req.body;
    try {
      const patient = await Patient.findOneAndUpdate({}, { contactDetails: newData }, { new: true, upsert: true });
      res.json({ success: true });
    } catch (error) {
      console.error('Error updating contact details:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });
  
  app.post('/api/patient/medicalRecords', async (req, res) => {
    const newData = req.body;
    try {
      const patient = await Patient.findOneAndUpdate({}, { medicalRecords: newData }, { new: true, upsert: true });
      res.json({ success: true });
    } catch (error) {
      console.error('Error updating medical records:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

// Routes
app.get('/api/patient', async (req, res) => {
  try {
    const patient = await Patient.findOne();
    res.json(patient);
  } catch (error) {
    console.error('Error fetching patient data:', error);
    res.status(500).json({ error: 'An error occurred while fetching patient data.' });
  }
});

app.post('/api/patient/update', async (req, res) => {
  const updatedData = req.body;

  try {
    await Patient.updateOne({}, updatedData);
    res.json({ success: true });
  } catch (error) {
    console.error('Error updating patient data:', error);
    res.status(500).json({ error: 'An error occurred while updating patient data.' });
  }
});

  const calculateAge = (dob) => {
   const birthDate = new Date(dob);
   const today = new Date();
   return today.getFullYear() - birthDate.getFullYear();
  };

  // Route to handle image upload
app.post('/upload', upload.single('image'), async (req, res) => {
  try {
    // Create a new document for the image
    const newImage = new Image({
      name: req.file.filename,
      path: req.file.path
    });

    // Save the image to MongoDB
    const savedImage = await newImage.save();

    res.json(savedImage);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Failed to upload image' });
  }
});
  
  // Server Listening
  const port = 4000;
  app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
  });
});