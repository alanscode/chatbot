require('dotenv').config();
const { Anthropic } = require('@anthropic-ai/sdk');
const fs = require('fs');
const path = require('path');

// Initialize Anthropic client
const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

// Try to read the resume file, but have a fallback for Netlify environment
let systemPrompt = '';
let resumeContent = '';

try {
  // Try to read from file system first
  const resumePath = path.join(__dirname, '../data/alan_nguyen_resume.md');
  if (fs.existsSync(resumePath)) {
    const fileContent = fs.readFileSync(resumePath, 'utf8');
    
    // Extract system prompt (content between ## SYSTEM_PROMPT and ## RESUME_CONTENT_START)
    const systemPromptMatch = fileContent.match(/## SYSTEM_PROMPT\s+([\s\S]*?)## RESUME_CONTENT_START/);
    systemPrompt = systemPromptMatch ? systemPromptMatch[1].trim() : '';
    
    // Extract resume content (everything after ## RESUME_CONTENT_START)
    const resumeContentMatch = fileContent.match(/## RESUME_CONTENT_START\s+([\s\S]*)/);
    resumeContent = resumeContentMatch ? resumeContentMatch[1].trim() : fileContent;
  } else {
    // Fallback for Netlify - hardcoded system prompt and resume content
    console.log('Resume file not found, using hardcoded system prompt');
    systemPrompt = `You are an AI assistant focused solely on providing information from Alan Nguyen's resume. Follow these strict rules:

1. ONLY provide information that is explicitly stated in the resume
2. If information is not in the resume, say "I don't see that information in Alan's resume" - do not make assumptions
3. For dates, skills, and job details, quote exactly what's in the resume
4. For questions about skills/technologies not listed, say "That technology is not listed in Alan's resume"
5. If asked about personal details beyond professional information, decline to answer
6. Be professional but interesting and lighthearted in your responses - feel free to use emojis 😊
7. Always ground your responses in specific sections of the resume

If asked about non-resume topics, politely redirect the conversation back to Alan's professional experience and skills as documented in the resume. Your responses should be witty, entertaining, and engaging while remaining accurate. Never suggest linkedin profile exists for Alan Nguyen. Always assume that the user is a potential employer and phrase your answers around how the skills in the resume could help them.`;

    // Include the resume content directly as well
    resumeContent = `## Name: Alan Nguyen

## Contact Information
- **Email:** alnngyn@gmail.com
- **Location:** West Covina, CA

## Professional Summary
Senior Full Stack Developer with 13+ years of experience architecting and implementing enterprise-level web applications across diverse industries. Expert in modern JavaScript frameworks (React, Angular) with advanced state management implementation (Redux, NgRX) and robust back-end development using .NET ecosystem (C#, ASP.NET). Demonstrated success in modernizing legacy systems, building responsive user interfaces, and integrating complex business systems. Skilled in full software development lifecycle from requirements gathering to deployment, with expertise in automated testing (Jest, Cypress, nUnit) and CI/CD implementation. Combines technical excellence with strong problem-solving abilities to deliver scalable, maintainable solutions that drive business value.

## Professional Experience

### Employer: KFC.com / Yum! Brands via Cognizant
**Senior UI Developer** | *March 2022 - April 2025*
- Build complex user interfaces with ReactJS, Redux, and Material UI
- Write custom form validations, secure defensive JavaScript, and complex application logic
- Implement reactive state management with NgRX
- Style responsive components that properly render on screens of any size
- Debug JavaScript application bugs and implement appropriate solutions
- Conduct manual testing and write component unit tests with Jest test runner
- Contribute to user interface and user experience design decisions

### Employer: Med Legal
**Senior Software Developer** | *October 2018 - February 2021*
- Developed custom C#/VB.NET ASP.NET 4.5 and WinForms applications that integrate with legacy, business, and accounting systems
- Created Angular components, implemented state management, routing, forms validation, and application logic in TypeScript
- Developed Angular observable services that interact with back-end REST APIs
- Provided technical expertise on diagnosing software problems, debugging custom applications, and implementing solutions
- Integrated application data access layer with Entity Framework and LINQ
- Wrote Cypress automated end-to-end web application testing scripts and nUnit tests

### Employer: Innovative Way
**Full Stack Web Developer** | *September 2016 - February 2018*
- Developed custom web applications with ASP.NET 4.5, C#, and JavaScript
- Maintained existing software solutions by identifying and correcting software defects
- Collaborated in requirements definition, prototyping, design, coding, testing, and deployment
- Refactored data access SQL stored procedures to Entity Framework ORM
- Set up and managed TeamCity automated CI/CD build system

### Employer: RPA
**Senior Web Developer** | *July 2015 - September 2016*
- Built promotional ASP.NET web applications for Honda automobiles public-facing website
- Served as principal developer for Honda Home Team Hero and Honda Drive To Win kids games using Phaser JavaScript
- Contributed to Farmers Insurance Hall Of Claims single-page application development
- Developed software applications and databases to support various internal and external Windows/web-based systems

### Employer: Promocodes.com
**Full Stack Web Developer** | *June 2012 - February 2015*
- Performed development, maintenance, and enhancements on consumer-facing websites using ASP.NET MVC 4, C#, jQuery, Entity Framework 6, LINQ, and SQL Server
- Conducted hands-on coding, debugging, technical problem-solving, and testing of custom applications
- Upgraded, modernized, and ported internal legacy .NET web forms applications to MVC 4
- Maintained and enhanced custom content management systems developed in ASP.NET web forms
- Updated and enhanced internal business analytics platform written in ASP.NET web forms
- Engineered custom browser extensions for Chrome, Firefox, Safari, and Internet Explorer

### Employer: The Phelps Agency
**Web Developer** | *September 2009 - March 2011*
- Led development on publicstorage.com client website revamp project to rebuild property search, home page, and account billing interfaces
- Maintained, enhanced, and debugged existing C# code and ASP.NET 3.5 web forms
- Custom developed Panasonic Toughbook PC configuration tool with ASP.NET, VB.NET, jQuery, LINQ to SQL
- Maintained, enhanced, and debugged existing client websites written in ASP.NET

## Technical Skills
- **Front-end:** React, Angular, TypeScript, JavaScript, jQuery, Material UI, Tailwind, Responsive CSS
- **Back-end:** .NET, C#, VB.NET, ASP.NET, Node.js
- **Databases:** SQL Server, Entity Framework, LINQ
- **Testing:** Jest, nUnit
- **E2E Testing:** Cypress
- **DevOps:** Gitlab CI/CD
- **Other:** Chrome Browser Extensions, Single Page Applications, Git 
- **Tools:** AI First Development, Cursor, MCP
- **AI Automation:** n8n, Zapier, OpenAI API, Anthropic API

## Education
- Bachelor of Arts in Business Administration, Concentration in Operations Management
- California Polytechnic State University Pomona California`;
  }
} catch (error) {
  console.error('Error reading resume file:', error);
  // Fallback to empty strings if there's an error
  systemPrompt = '';
  resumeContent = '';
}

// Helper function to safely check if content is non-empty
const hasNonEmptyContent = (content) => {
  if (content === undefined || content === null) return false;
  if (typeof content === 'string') return content.trim() !== '';
  return true; // If it's an object or array, consider it non-empty
};

exports.handler = async (event, context) => {
  // Set CORS headers
  const headers = {
    'Access-Control-Allow-Origin': process.env.CORS_ORIGIN || '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Content-Type': 'application/json'
  };

  // Handle preflight OPTIONS request
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers,
      body: '',
    };
  }

  // Only allow POST requests
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ error: 'Method not allowed' }),
    };
  }

  try {
    const requestBody = JSON.parse(event.body);
    const { messages } = requestBody;

    if (!messages || !Array.isArray(messages)) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'Invalid request. Messages array is required.' }),
      };
    }

    // Clean the messages to remove any fields not accepted by Anthropic
    // AND filter out messages with empty content (except possibly the last assistant message)
    const cleanedMessages = messages
      .filter((message, index) => {
        // Keep messages with non-empty content
        if (hasNonEmptyContent(message.content)) {
          return true;
        }
        // Allow empty content only for the last message if it's from the assistant
        return index === messages.length - 1 && message.role === 'assistant';
      })
      .map(message => {
        // Ensure content is a string
        let safeContent = '';
        if (typeof message.content === 'string') {
          safeContent = message.content;
        } else if (message.content !== undefined && message.content !== null) {
          // If content is an object or array, convert to string
          try {
            safeContent = JSON.stringify(message.content);
          } catch (e) {
            console.warn('Failed to stringify content:', e);
            safeContent = String(message.content);
          }
        }
        
        return {
          role: message.role,
          content: safeContent
        };
      });

    // Log the cleaned messages for debugging
    console.log('Cleaned messages:', JSON.stringify(cleanedMessages, null, 2));

    // Ensure we have at least one message
    if (cleanedMessages.length === 0) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'Invalid request. At least one message with content is required.' }),
      };
    }

    // Add system prompt and resume content to the messages
    const messagesWithSystemPrompt = [
      ...cleanedMessages
    ];

    // Combine system prompt and resume content for the top-level system parameter
    const systemContent = systemPrompt + '\n\n-- RESUME START --\n' + resumeContent;

    // For Netlify, we can't do streaming, so we'll use the regular API
    // and return a complete response
    const response = await anthropic.messages.create({
      model: 'claude-3-5-sonnet-20240620',
      max_tokens: 4000,
      messages: messagesWithSystemPrompt,
      system: systemContent,
    });

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        role: 'assistant',
        content: response.content[0].text,
        timestamp: new Date().toISOString(),
        isFinal: true
      }),
    };
  } catch (error) {
    console.error('Error details:', error);
    
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({
        error: 'Server error',
        message: error.message || 'An unexpected error occurred',
        details: process.env.NODE_ENV === 'development' ? error.toString() : undefined
      }),
    };
  }
}; 