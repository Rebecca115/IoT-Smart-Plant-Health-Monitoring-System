const express = require('express');
const axios = require('axios');
const bodyParser = require('body-parser');
const dotenv = require('dotenv');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const cors = require('cors');

dotenv.config();

const app = express();
app.use(bodyParser.json());
app.use(cors()); // Enable CORS for all routes

const baseUrl = 'https://api.deepbricks.ai/v1/chat/completions';
const apiKey = process.env.OPENAI_API_KEY;

const uploadDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir);
    console.log('Created uploads directory');
} else {
    console.log('Uploads directory already exists');
}

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, uploadDir);
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + path.extname(file.originalname));
    }
});
const upload = multer({ storage: storage });

app.use('/uploads', express.static(uploadDir));

// Chat completion endpoint
app.post('/ask', async (req, res) => {
    const userInput = req.body.question;
    const body = {
        model: "gpt-4o-2024-08-06",
        messages: [{ role: "user", content: userInput }]
    };

    try {
        const response = await axios.post(baseUrl, body, {
            headers: {
                Authorization: `Bearer ${apiKey}`,
                'Content-Type': 'application/json'
            }
        });
        res.json({ response: response.data });
    } catch (error) {
        console.error('Error communicating with third-party API:', error.message);
        res.status(500).send("Internal Server Error");
    }
});

// Upload image endpoint
app.post('/upload', upload.single('image'), (req, res) => {
    if (!req.file) {
        return res.status(400).send('No image uploaded');
    }

    const uploadedImage = req.file;
    console.log('Image uploaded successfully:', uploadedImage);

    res.json({ 
        message: 'Image uploaded successfully', 
        imageUrl: `http://localhost:3001/uploads/${uploadedImage.filename}` 
    });
});

// Another upload image endpoint
app.post('/upload01', upload.single('image'), (req, res) => {
    if (!req.file) {
        return res.status(400).send('No image uploaded');
    }

    const uploadedImage = req.file;
    console.log('Image uploaded successfully:', uploadedImage);

    res.json({ 
        message: 'Image uploaded successfully', 
        imageUrl: `http://localhost:3001/upload01/${uploadedImage.filename}` 
    });
});

// List all uploaded images
app.get('/api/images', (req, res) => {
    fs.readdir(uploadDir, (err, files) => {
        if (err) {
            return res.status(500).json({ error: 'Error reading uploads folder' });
        }
        const imageFiles = files.filter(file => /\.(jpg|jpeg|png|gif)$/i.test(file)).sort();
        res.json(imageFiles);
    });
});

// Serve individual images by filename
app.get('/image/:filename', (req, res) => {
    const filePath = path.join(uploadDir, req.params.filename);
    if (fs.existsSync(filePath)) {
        res.sendFile(filePath);
    } else {
        res.status(404).send('Image not found');
    }
});

// Start the main server
app.listen(3001, () => {
    console.log("Server is running on http://localhost:3001");
});

// Configure a separate image server with CORS enabled
const imageServer = express();
imageServer.use(cors());
imageServer.use('/uploads', express.static(uploadDir));

imageServer.get('/api/images', (req, res) => {
    fs.readdir(uploadDir, (err, files) => {
        if (err) {
            return res.status(500).json({ error: 'Error reading uploads folder' });
        }
        const imageFiles = files.filter(file => /\.(jpg|jpeg|png|gif)$/i.test(file)).sort();
        res.json(imageFiles);
    });
});

imageServer.listen(5002, () => {
    console.log('Image server running on http://localhost:5002');
});
