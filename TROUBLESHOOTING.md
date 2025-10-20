# RunCatcher Troubleshooting Guide

## "Face detection models not loaded yet" Error

This is the most common issue with RunCatcher. Here are the solutions:

### 🔧 Quick Fixes

1. **Refresh the Page**
   - Simple refresh (F5 or Cmd+R)
   - Hard refresh (Ctrl+F5 or Cmd+Shift+R)

2. **Check Internet Connection**
   - Ensure you have a stable internet connection
   - The models need to be downloaded from CDN

3. **Disable Ad Blockers**
   - Temporarily disable uBlock Origin, AdBlock Plus, etc.
   - These can block the model files

4. **Try Different Browser**
   - Chrome/Chromium (recommended)
   - Firefox
   - Safari
   - Edge

### 🌐 Network Issues

If you're behind a corporate firewall or have network restrictions:

1. **Use Offline Mode**
   ```bash
   open /Users/boon/coad1/runcatcher/offline.html
   ```

2. **Download Models Locally**
   - Download the weights folder from: https://github.com/justadudewhohacks/face-api.js/tree/master/weights
   - Place in `/Users/boon/coad1/runcatcher/weights/`
   - Update script.js to use local paths

### 🔍 Debug Steps

1. **Open Browser Console** (F12)
   - Look for error messages
   - Check network tab for failed requests

2. **Check Console Output**
   ```javascript
   // Should see:
   "Trying to load models from: https://cdn.jsdelivr.net/..."
   "Models loaded successfully from: ..."
   ```

3. **Test CDN Access**
   - Visit: https://cdn.jsdelivr.net/npm/face-api.js@0.22.2/weights/
   - Should show directory listing

### 🚀 Alternative Solutions

#### Option 1: Use Test Version
```bash
open /Users/boon/coad1/runcatcher/test.html
```

#### Option 2: Use Offline Version
```bash
open /Users/boon/coad1/runcatcher/offline.html
```

#### Option 3: Local Model Setup
1. Create weights directory:
   ```bash
   mkdir -p /Users/boon/coad1/runcatcher/weights
   ```

2. Download models manually or use a local server

### 🐛 Common Error Messages

| Error | Cause | Solution |
|-------|-------|----------|
| "Models not loaded yet" | CDN failure | Try different CDN or offline mode |
| "Camera access denied" | Permission issue | Allow camera access in browser |
| "Network error" | Connection issue | Check internet, disable firewall |
| "CORS error" | Security restriction | Use HTTPS or local server |

### 📱 Mobile Issues

- **iOS Safari**: May have restrictions on camera access
- **Android Chrome**: Usually works well
- **Mobile browsers**: May have limited WebGL support

### 🔧 Advanced Solutions

#### 1. Use Local Server
```bash
# Install Python (if available)
python3 -m http.server 8000
# Then visit: http://localhost:8000
```

#### 2. Use Node.js Server
```bash
# After installing Node.js
cd /Users/boon/coad1/runcatcher
npm install
npm start
```

#### 3. Host Models Locally
- Download face-api.js weights
- Host them on your own server
- Update the model URLs in script.js

### 📞 Still Having Issues?

1. **Check Browser Console** for specific error messages
2. **Try the offline version** first to test camera access
3. **Use the test version** to verify face detection works
4. **Check your network** - some corporate networks block CDN access

### 🎯 Success Indicators

When working correctly, you should see:
- ✅ "Models loaded. Ready to start detection."
- ✅ Camera feed appears
- ✅ "Start Detection" button becomes enabled
- ✅ Face bounding boxes appear when faces are detected

### 📋 System Requirements

- **Browser**: Chrome 60+, Firefox 55+, Safari 11+
- **Camera**: Webcam or DroidCam
- **Internet**: Required for initial model download
- **RAM**: 2GB+ recommended for smooth operation
