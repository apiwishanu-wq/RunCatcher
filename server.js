const express = require('express');
const fs = require('fs');
const path = require('path');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.static(__dirname));

// Ensure captures directory exists
const capturesDir = path.join(__dirname, 'captures');
if (!fs.existsSync(capturesDir)) {
    fs.mkdirSync(capturesDir, { recursive: true });
}

// Serve static files
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// POST /capture endpoint
app.post('/capture', async (req, res) => {
    try {
        const { image, motionSpeed, timestamp } = req.body;
        
        if (!image) {
            return res.status(400).json({ error: 'No image data provided' });
        }
        
        // Generate unique filename
        const timestampStr = new Date().toISOString().replace(/[:.]/g, '-');
        const filename = `runner_${timestampStr}.jpg`;
        const filepath = path.join(capturesDir, filename);
        
        // Remove data URL prefix and save image
        const base64Data = image.replace(/^data:image\/jpeg;base64,/, '');
        const imageBuffer = Buffer.from(base64Data, 'base64');
        
        // Save image to file
        fs.writeFileSync(filepath, imageBuffer);
        
        // Log capture info
        console.log(`Runner captured: ${filename}`);
        console.log(`Motion speed: ${motionSpeed} px/s`);
        console.log(`Timestamp: ${timestamp}`);
        
        res.json({
            success: true,
            filename: filename,
            message: 'Runner captured successfully'
        });
        
    } catch (error) {
        console.error('Error capturing runner:', error);
        res.status(500).json({ 
            error: 'Failed to capture runner',
            details: error.message 
        });
    }
});

// GET /captures endpoint - list all captured images
app.get('/captures', (req, res) => {
    try {
        const files = fs.readdirSync(capturesDir)
            .filter(file => file.endsWith('.jpg'))
            .map(file => ({
                filename: file,
                path: `/captures/${file}`,
                created: fs.statSync(path.join(capturesDir, file)).birthtime
            }))
            .sort((a, b) => b.created - a.created); // Sort by newest first
        
        res.json(files);
    } catch (error) {
        console.error('Error listing captures:', error);
        res.status(500).json({ error: 'Failed to list captures' });
    }
});

// Serve captured images
app.use('/captures', express.static(capturesDir));

// Health check endpoint
app.get('/health', (req, res) => {
    res.json({ 
        status: 'OK', 
        timestamp: new Date().toISOString(),
        capturesCount: fs.readdirSync(capturesDir).length
    });
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error('Server error:', err);
    res.status(500).json({ 
        error: 'Internal server error',
        message: err.message 
    });
});

// Start server
app.listen(PORT, () => {
    console.log(`RunCatcher server running on http://localhost:${PORT}`);
    console.log(`Captures directory: ${capturesDir}`);
    console.log(`Health check: http://localhost:${PORT}/health`);
});

// Graceful shutdown
process.on('SIGINT', () => {
    console.log('\nShutting down RunCatcher server...');
    process.exit(0);
});

process.on('SIGTERM', () => {
    console.log('\nShutting down RunCatcher server...');
    process.exit(0);
});
