// RunCatcher - Face Detection and Motion Tracking
class RunCatcher {
    constructor() {
        this.video = document.getElementById('video');
        this.canvas = document.getElementById('canvas');
        this.ctx = this.canvas.getContext('2d');
        this.startBtn = document.getElementById('startBtn');
        this.stopBtn = document.getElementById('stopBtn');
        this.status = document.getElementById('status');
        this.runnersList = document.getElementById('runnersList');
        
        this.isRunning = false;
        this.faceApiLoaded = false;
        this.previousFaces = [];
        this.runnerCount = 0;
        this.motionThreshold = 0.1; // Threshold for detecting running motion
        this.captureCooldown = 2000; // 2 seconds between captures
        this.lastCaptureTime = 0;
        
        this.init();
    }
    
    async init() {
        this.setupEventListeners();
        await this.loadFaceApi();
        await this.initVideoStream();
    }
    
    setupEventListeners() {
        this.startBtn.addEventListener('click', () => this.startDetection());
        this.stopBtn.addEventListener('click', () => this.stopDetection());
    }
    
    async loadFaceApi() {
        try {
            this.status.textContent = 'Loading face detection models...';
            
            // Try multiple CDN sources for better reliability
            const modelUrls = [
                'https://cdn.jsdelivr.net/npm/face-api.js@0.22.2/weights',
                'https://unpkg.com/face-api.js@0.22.2/weights',
                'https://cdnjs.cloudflare.com/ajax/libs/face-api.js/0.22.2/weights'
            ];
            
            let modelsLoaded = false;
            
            for (const baseUrl of modelUrls) {
                try {
                    console.log(`Trying to load models from: ${baseUrl}`);
                    
                    await Promise.all([
                        faceapi.nets.tinyFaceDetector.loadFromUri(baseUrl),
                        faceapi.nets.faceLandmark68Net.loadFromUri(baseUrl),
                        faceapi.nets.faceRecognitionNet.loadFromUri(baseUrl)
                    ]);
                    
                    modelsLoaded = true;
                    console.log('Models loaded successfully from:', baseUrl);
                    break;
                } catch (error) {
                    console.warn(`Failed to load from ${baseUrl}:`, error.message);
                    continue;
                }
            }
            
            if (modelsLoaded) {
                this.faceApiLoaded = true;
                this.status.textContent = 'Models loaded. Ready to start detection.';
                this.startBtn.disabled = false;
            } else {
                throw new Error('All CDN sources failed');
            }
            
        } catch (error) {
            console.error('Error loading face-api models:', error);
            this.status.textContent = 'Error loading face detection models. Trying fallback method...';
            this.loadFaceApiFallback();
        }
    }
    
    async loadFaceApiFallback() {
        try {
            // Try loading just the essential model for basic face detection
            this.status.textContent = 'Loading basic face detection model...';
            
            await faceapi.nets.tinyFaceDetector.loadFromUri('https://cdn.jsdelivr.net/npm/face-api.js@0.22.2/weights');
            
            this.faceApiLoaded = true;
            this.status.textContent = 'Basic model loaded. Ready to start detection.';
            this.startBtn.disabled = false;
            
        } catch (error) {
            console.error('Fallback loading also failed:', error);
            this.status.textContent = 'Unable to load face detection models. Please check your internet connection and refresh the page.';
            this.showOfflineInstructions();
        }
    }
    
    showOfflineInstructions() {
        const instructions = document.createElement('div');
        instructions.innerHTML = `
            <div style="background: #f8d7da; border: 1px solid #f5c6cb; color: #721c24; padding: 15px; margin: 10px 0; border-radius: 5px;">
                <h4>Face Detection Models Failed to Load</h4>
                <p>This usually happens due to:</p>
                <ul>
                    <li>Internet connection issues</li>
                    <li>CDN blocking or rate limiting</li>
                    <li>Browser security restrictions</li>
                </ul>
                <p><strong>Solutions:</strong></p>
                <ol>
                    <li>Check your internet connection</li>
                    <li>Try refreshing the page</li>
                    <li>Disable ad blockers temporarily</li>
                    <li>Try a different browser</li>
                </ol>
            </div>
        `;
        document.querySelector('.video-section').appendChild(instructions);
    }
    
    async initVideoStream() {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({
                video: {
                    width: { ideal: 640 },
                    height: { ideal: 480 },
                    facingMode: 'user'
                }
            });
            
            this.video.srcObject = stream;
            this.video.onloadedmetadata = () => {
                this.canvas.width = this.video.videoWidth;
                this.canvas.height = this.video.videoHeight;
            };
            
        } catch (error) {
            console.error('Error accessing camera:', error);
            this.status.textContent = 'Error accessing camera. Please check permissions.';
        }
    }
    
    async startDetection() {
        if (!this.faceApiLoaded) {
            this.status.textContent = 'Face detection models not loaded yet.';
            return;
        }
        
        this.isRunning = true;
        this.startBtn.disabled = true;
        this.stopBtn.disabled = false;
        this.status.textContent = 'Detection active - looking for running faces...';
        
        this.detectFaces();
    }
    
    stopDetection() {
        this.isRunning = false;
        this.startBtn.disabled = false;
        this.stopBtn.disabled = true;
        this.status.textContent = 'Detection stopped.';
        
        // Clear canvas
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    }
    
    async detectFaces() {
        if (!this.isRunning) return;
        
        try {
            const detections = await faceapi
                .detectAllFaces(this.video, new faceapi.TinyFaceDetectorOptions())
                .withFaceLandmarks();
            
            this.drawBoundingBoxes(detections);
            this.calculateMotion(detections);
            
        } catch (error) {
            console.error('Error detecting faces:', error);
        }
        
        // Continue detection loop
        requestAnimationFrame(() => this.detectFaces());
    }
    
    drawBoundingBoxes(detections) {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        detections.forEach((detection, index) => {
            const box = detection.detection.box;
            const isRunning = this.isFaceRunning(detection);
            
            // Draw bounding box
            this.ctx.strokeStyle = isRunning ? '#e74c3c' : '#c0392b';
            this.ctx.lineWidth = 3;
            this.ctx.strokeRect(box.x, box.y, box.width, box.height);
            
            // Draw label
            this.ctx.fillStyle = isRunning ? '#e74c3c' : '#c0392b';
            this.ctx.font = '16px Arial';
            this.ctx.fillText(
                isRunning ? 'RUNNING!' : 'Face Detected',
                box.x,
                box.y - 10
            );
        });
    }
    
    calculateMotion(currentDetections) {
        if (this.previousFaces.length === 0) {
            this.previousFaces = currentDetections.map(det => ({
                box: det.detection.box,
                timestamp: Date.now()
            }));
            return;
        }
        
        currentDetections.forEach((currentDet, index) => {
            const currentBox = currentDet.detection.box;
            const currentTime = Date.now();
            
            // Find closest previous face
            let closestPrev = null;
            let minDistance = Infinity;
            
            this.previousFaces.forEach(prevFace => {
                const distance = this.calculateDistance(currentBox, prevFace.box);
                if (distance < minDistance) {
                    minDistance = distance;
                    closestPrev = prevFace;
                }
            });
            
            if (closestPrev) {
                const timeDiff = (currentTime - closestPrev.timestamp) / 1000; // seconds
                const motionSpeed = this.calculateMotionSpeed(currentBox, closestPrev.box, timeDiff);
                
                // Check if motion indicates running
                if (motionSpeed > this.motionThreshold) {
                    this.captureRunner(currentDet, motionSpeed);
                }
            }
        });
        
        // Update previous faces
        this.previousFaces = currentDetections.map(det => ({
            box: det.detection.box,
            timestamp: Date.now()
        }));
    }
    
    calculateDistance(box1, box2) {
        const center1 = {
            x: box1.x + box1.width / 2,
            y: box1.y + box1.height / 2
        };
        const center2 = {
            x: box2.x + box2.width / 2,
            y: box2.y + box2.height / 2
        };
        
        return Math.sqrt(
            Math.pow(center1.x - center2.x, 2) + Math.pow(center1.y - center2.y, 2)
        );
    }
    
    calculateMotionSpeed(currentBox, previousBox, timeDiff) {
        if (timeDiff === 0) return 0;
        
        const currentCenter = {
            x: currentBox.x + currentBox.width / 2,
            y: currentBox.y + currentBox.height / 2
        };
        const previousCenter = {
            x: previousBox.x + previousBox.width / 2,
            y: previousBox.y + previousBox.height / 2
        };
        
        const distance = Math.sqrt(
            Math.pow(currentCenter.x - previousCenter.x, 2) + 
            Math.pow(currentCenter.y - previousCenter.y, 2)
        );
        
        return distance / timeDiff; // pixels per second
    }
    
    isFaceRunning(detection) {
        // Simple heuristic: if we have motion data, check if it's above threshold
        // This is a simplified version - in a real implementation, you'd track motion over time
        return false; // Will be determined by motion calculation
    }
    
    async captureRunner(detection, motionSpeed) {
        const now = Date.now();
        if (now - this.lastCaptureTime < this.captureCooldown) {
            return; // Too soon since last capture
        }
        
        this.lastCaptureTime = now;
        this.runnerCount++;
        
        try {
            // Capture the current frame
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            canvas.width = this.video.videoWidth;
            canvas.height = this.video.videoHeight;
            
            // Draw the video frame
            ctx.drawImage(this.video, 0, 0, canvas.width, canvas.height);
            
            // Crop to face area with some padding
            const box = detection.detection.box;
            const padding = 50;
            const cropX = Math.max(0, box.x - padding);
            const cropY = Math.max(0, box.y - padding);
            const cropWidth = Math.min(canvas.width - cropX, box.width + padding * 2);
            const cropHeight = Math.min(canvas.height - cropY, box.height + padding * 2);
            
            const faceCanvas = document.createElement('canvas');
            const faceCtx = faceCanvas.getContext('2d');
            faceCanvas.width = cropWidth;
            faceCanvas.height = cropHeight;
            
            faceCtx.drawImage(
                canvas,
                cropX, cropY, cropWidth, cropHeight,
                0, 0, cropWidth, cropHeight
            );
            
            // Convert to base64
            const imageData = faceCanvas.toDataURL('image/jpeg', 0.8);
            
            // Send to backend
            await this.sendToBackend(imageData, motionSpeed);
            
            // Update UI
            this.updateRunnerList(imageData, motionSpeed);
            
        } catch (error) {
            console.error('Error capturing runner:', error);
        }
    }
    
    async sendToBackend(imageData, motionSpeed) {
        try {
            const response = await fetch('/capture', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    image: imageData,
                    motionSpeed: motionSpeed,
                    timestamp: new Date().toISOString()
                })
            });
            
            if (!response.ok) {
                throw new Error('Failed to save image');
            }
            
            console.log('Runner captured and saved successfully');
            
        } catch (error) {
            console.error('Error sending to backend:', error);
            this.status.textContent = 'Error saving runner image.';
        }
    }
    
    updateRunnerList(imageData, motionSpeed) {
        const runnerItem = document.createElement('div');
        runnerItem.className = 'runner-item';
        runnerItem.innerHTML = `
            <div class="runner-number">Runner #${this.runnerCount}</div>
            <img src="${imageData}" alt="Runner ${this.runnerCount}" class="runner-image">
            <div class="runner-info">
                <div>Motion Speed: ${motionSpeed.toFixed(2)} px/s</div>
                <div>Captured: ${new Date().toLocaleTimeString()}</div>
            </div>
        `;
        
        // Remove "no runners" message if it exists
        const noRunners = this.runnersList.querySelector('.no-runners');
        if (noRunners) {
            noRunners.remove();
        }
        
        // Add to top of list
        this.runnersList.insertBefore(runnerItem, this.runnersList.firstChild);
        
        // Update status
        this.status.textContent = `Runner #${this.runnerCount} captured! Motion speed: ${motionSpeed.toFixed(2)} px/s`;
    }
}

// Initialize the application when the page loads
document.addEventListener('DOMContentLoaded', () => {
    new RunCatcher();
});
