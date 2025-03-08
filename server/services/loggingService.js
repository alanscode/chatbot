const fs = require('fs');
const path = require('path');
const { createObjectCsvWriter } = require('csv-writer');

// Create logs directory if it doesn't exist
const logsDir = path.join(__dirname, '../logs');
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir);
}

// Set up CSV writer
const csvFilePath = path.join(logsDir, 'chat_logs.csv');
const csvWriter = createObjectCsvWriter({
  path: csvFilePath,
  header: [
    { id: 'timestamp', title: 'TIMESTAMP' },
    { id: 'userQuestion', title: 'USER_QUESTION' },
    { id: 'assistantAnswer', title: 'ASSISTANT_ANSWER' }
  ],
  append: true
});

// Create the CSV file with headers if it doesn't exist
if (!fs.existsSync(csvFilePath)) {
  csvWriter.writeRecords([]);
}

/**
 * Log a chat interaction to CSV
 * @param {string} userQuestion - The user's question
 * @param {string} assistantAnswer - The assistant's response
 * @returns {Promise<void>}
 */
exports.logChatInteraction = async (userQuestion, assistantAnswer) => {
  try {
    const record = {
      timestamp: new Date().toISOString(),
      userQuestion,
      assistantAnswer
    };
    
    await csvWriter.writeRecords([record]);
    console.log('Chat interaction logged successfully');
  } catch (error) {
    console.error('Error logging chat interaction:', error);
  }
}; 