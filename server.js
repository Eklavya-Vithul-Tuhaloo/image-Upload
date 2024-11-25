const express = require('express');
const path = require('path');
const multer = require('multer');
const fs = require('fs');
const MongoClient = require('mongodb').MongoClient;
const cors = require('cors');

const app = express();
const port = 3000;

// MongoDB connection
const mongoUrl = 'mongodb+srv://et523:zzclDLjLXs7Cvsan@cluster0.dpz3g.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0';
const dbName = 'file-share';
let db;

app.use(cors());   

// Connect to MongoDB and start the server once the connection is established
MongoClient.connect(mongoUrl, { useUnifiedTopology: true })
    .then(client => {
        db = client.db(dbName);
        console.log('Connected to MongoDB');

        // Check if the 'posts' collection exists, and if not, create it by inserting a dummy document
        const collection = db.collection('posts');
        collection.countDocuments({}, (err, count) => {
            if (err) {
                console.error('Error checking collection:', err);
            } else if (count === 0) {
                // Insert a dummy post to create the collection
                collection.insertOne({ description: 'Initial dummy post', image: 'dummy.jpg' })
                    .then(() => console.log('Created posts collection with dummy post.'));
            }
        });

        // Start the server only after the DB connection is successful
        app.listen(port, () => {
            console.log(`Server running at http://localhost:${port}`);
        });
    })
    .catch(err => {
        console.error('Failed to connect to MongoDB:', err);
    });

// Ensure the 'uploads' folder exists
const uploadDir = path.join(__dirname, '/', 'uploads');
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });  // Create the folder if it doesn't exist
}

// Setup static file serving
app.use(express.static(path.join(__dirname, '/'))); // Serve files from the public folder

// Serve index.html
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// Setup body parsing for JSON and FormData
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Setup Multer storage for image uploads
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadDir);  // Use the 'uploads' directory
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname));  // Ensure unique filenames
    }
});
const upload = multer({ storage });

// Handle POST request to upload image
app.post('/upload', upload.single('image'), (req, res) => {
    if (!req.file) {
        return res.status(400).json({ success: false, message: 'No file uploaded.' });
    }

    const description = req.body.description;
    const image = req.file.filename;

    if (!db) {
        return res.status(500).json({ success: false, message: 'Database connection not established.' });
    }

    const post = { description, image };

    const collection = db.collection('posts');

    // Insert the post and handle collection creation if needed
    collection.insertOne(post, (err, result) => {
        if (err) {
            console.error('Failed to insert post:', err);
            return res.status(500).json({ success: false, message: 'Failed to upload file.' });
        }
        res.json({ success: true });
    });
});

// New route to fetch all uploaded images
app.get('/images', (req, res) => {
    const images = fs.readdirSync(uploadDir).filter(file => {
        return /\.(jpg|jpeg|png|gif)$/.test(file);  // Only fetch image files
    });

    res.json({ success: true, images });
});

// Server-side route to fetch descriptions
app.get('/descriptions', async (req, res) => {
    console.log("Received request for /descriptions");

    if (!db) {
        return res.status(500).json({ success: false, message: 'Database connection not established.' });
    }

    const collection = db.collection('posts');

    try {
        // Using await to handle the asynchronous operation
        const documents = await collection.find().toArray();

        const descriptions = documents.map(doc => doc.description);
        console.log('Descriptions:', descriptions);
        // You can then send the documents in the response
        res.json({ success: true, posts: descriptions });
    } catch (err) {
        console.error('Error fetching posts:', err);
        return res.status(500).json({ success: false, message: 'Failed to fetch posts.' });
    }
});

