const express = require('express');
const router = express.Router();
const fs = require('fs').promises;
const path = require('path');

const resumePath = path.join(__dirname, '../data/alan_nguyen_resume.md');

router.get('/', async (req, res) => {
  try {
    const content = await fs.readFile(resumePath, 'utf8');
    res.send(content.trim());
  } catch (error) {
    console.error('Error reading resume file:', error);
    res.status(500).json({ 
      error: 'Failed to load resume content',
      message: 'Unable to read the resume file'
    });
  }
});

router.post('/save', async (req, res) => {
  try {
    const { content } = req.body;
    if (!content) {
      return res.status(400).json({
        error: 'Invalid request',
        message: 'Content is required'
      });
    }

    await fs.writeFile(resumePath, content, 'utf8');
    res.json({ success: true, message: 'Resume saved successfully' });
  } catch (error) {
    console.error('Error saving resume file:', error);
    res.status(500).json({
      error: 'Failed to save resume content',
      message: 'Unable to write to the resume file'
    });
  }
});

module.exports = router; 