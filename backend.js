// Minimal Express backend for file uploads and static serving
const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const cors = require('cors');

const UPLOAD_DIR = path.join(__dirname, 'tracks');
if (!fs.existsSync(UPLOAD_DIR)) fs.mkdirSync(UPLOAD_DIR);

const app = express();
const upload = multer({ dest: UPLOAD_DIR });

app.use(cors());
app.use('/tracks', express.static(UPLOAD_DIR));

// Upload endpoint
app.post('/upload', upload.single('file'), (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'No file uploaded' });
  // Optionally rename file to original name (handle collisions in real apps)
  const ext = path.extname(req.file.originalname);
  const targetPath = path.join(UPLOAD_DIR, req.file.originalname);
  fs.renameSync(req.file.path, targetPath);
  res.json({
    name: req.file.originalname,
    url: `/tracks/${encodeURIComponent(req.file.originalname)}`
  });
});

// Delete a single track (with password)
app.delete('/tracks/:filename', (req, res) => {
  if (req.query.pw !== 'superadmin') return res.status(403).json({ error: 'Forbidden' });
  const filename = req.params.filename;
  const filePath = path.join(UPLOAD_DIR, filename);
  if (!fs.existsSync(filePath)) return res.status(404).json({ error: 'File not found' });
  fs.unlink(filePath, (err) => {
    if (err) return res.status(500).json({ error: 'Failed to delete' });
    res.json({ success: true });
  });
});

// Delete all tracks (with password)
app.delete('/tracks-all', (req, res) => {
  if (req.query.pw !== 'superadmin') return res.status(403).json({ error: 'Forbidden' });
  fs.readdir(UPLOAD_DIR, (err, files) => {
    if (err) return res.status(500).json({ error: 'Failed to list files' });
    const mp3s = files.filter(f => f.endsWith('.mp3'));
    let deleted = 0;
    let failed = 0;
    if (mp3s.length === 0) return res.json({ deleted: 0 });
    mp3s.forEach((f) => {
      fs.unlink(path.join(UPLOAD_DIR, f), (err) => {
        if (err) failed++;
        else deleted++;
        if (deleted + failed === mp3s.length) {
          res.json({ deleted, failed });
        }
      });
    });
  });
});

// List all tracks
app.get('/tracks-list', (req, res) => {
  fs.readdir(UPLOAD_DIR, (err, files) => {
    if (err) return res.status(500).json({ error: 'Failed to list files' });
    res.json(files.filter(f => f.endsWith('.mp3')));
  });
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`Backend running on port ${PORT}`);
});
