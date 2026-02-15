# AI Assignment Generator - Setup & Usage Guide

## Overview

The AI Assignment Generator uses Groq's free LLM API to automatically generate mathematics assignments based on teacher specifications. Teachers can customize the topic, difficulty level, and question distribution to create tailored assignments for their students.

## Features

- **AI-Powered Generation**: Uses Groq's Llama 3.3 70B model for high-quality math questions
- **Customizable Parameters**:
  - Class grade (6-10)
  - Topic (Algebra, Geometry, Trigonometry, etc.)
  - Complexity level (Easy, Medium, Hard)
  - Question distribution (1-mark, 2-mark, 3-mark, 5-mark questions)
- **Instant Preview**: View generated assignment immediately
- **Download & Copy**: Download as text file or copy to clipboard
- **Edit Friendly**: Generated content can be edited before use

## Setup Instructions

### 1. Get Groq API Key (Free)

1. Visit [Groq Console](https://console.groq.com/)
2. Sign up for a free account
3. Navigate to API Keys section
4. Create a new API key
5. Copy the API key (starts with `gsk_...`)

**Free Tier Limits**: 30 requests per minute (more than enough for assignment generation)

### 2. Configure Backend

Add your Groq API key to the `.env` file:

```env
# Groq AI Configuration (for Assignment Generator)
GROQ_API_KEY=gsk_your_actual_api_key_here
GROQ_MODEL=llama-3.3-70b-versatile
```

The configuration is already set up in `application.yml` to read from environment variables.

### 3. Restart Backend

After adding the API key, restart your Spring Boot application:

```bash
# Windows
load-env-and-run.bat

# Or manually
mvn spring-boot:run
```

### 4. Deploy to Railway (Production)

Add the Groq API key as an environment variable in Railway:

1. Go to your Railway project
2. Click on your service
3. Go to "Variables" tab
4. Add new variable:
   - Name: `GROQ_API_KEY`
   - Value: `gsk_your_actual_api_key_here`
5. Railway will automatically redeploy

## Usage Guide

### For Teachers

1. **Access the Generator**:
   - Login to teacher dashboard
   - Click on "Assignments" tab
   - Click on "🤖 Generate Assignment" card

2. **Configure Assignment**:
   - Select class grade (6-10)
   - Enter topic (e.g., "Linear Equations", "Pythagorean Theorem")
   - Choose complexity level (Easy/Medium/Hard)
   - Set number of questions for each mark category:
     - 1-mark: Short answer, MCQ, fill in the blanks
     - 2-mark: Brief explanations, simple problems
     - 3-mark: Detailed working required
     - 5-mark: Comprehensive multi-step problems

3. **Generate**:
   - Click "Generate Assignment" button
   - Wait 5-10 seconds for AI to generate questions
   - Review the generated assignment in the preview panel

4. **Use the Assignment**:
   - **Copy**: Click "Copy" to copy to clipboard
   - **Download**: Click "Download" to save as text file
   - Edit the content as needed before using
   - Create a regular assignment using the generated questions

## Technical Details

### Backend Components

1. **AIAssignmentGeneratorService.java**
   - Handles communication with Groq API
   - Builds prompts based on teacher specifications
   - Parses AI responses

2. **AssignmentController.java**
   - New endpoint: `POST /api/assignments/generate`
   - Accepts `GenerateAssignmentRequest` DTO
   - Returns generated assignment content

3. **GenerateAssignmentRequest.java**
   - DTO with validation for all parameters
   - Ensures valid class grades (6-10)
   - Validates question counts (non-negative)

### Frontend Components

1. **GenerateAssignment.jsx**
   - Full-page UI for assignment generation
   - Form for configuration
   - Live preview of generated content
   - Download and copy functionality

2. **TeacherDashboard.jsx**
   - Added "Generate Assignment" card in Assignments tab
   - Links to the generator page

### API Endpoint

```
POST /api/assignments/generate
Authorization: Bearer <teacher-jwt-token>
Content-Type: application/json

Request Body:
{
  "classGrade": 8,
  "topic": "Quadratic Equations",
  "oneMarkQuestions": 5,
  "twoMarkQuestions": 4,
  "threeMarkQuestions": 3,
  "fiveMarkQuestions": 2,
  "complexity": "MEDIUM"
}

Response:
{
  "content": "SECTION A: 1-Mark Questions\n1. What is the standard form of a quadratic equation?\n...",
  "topic": "Quadratic Equations",
  "classGrade": "8"
}
```

## Groq API Details

- **Model**: llama-3.3-70b-versatile
- **Endpoint**: https://api.groq.com/openai/v1/chat/completions
- **Temperature**: 0.7 (balanced creativity and consistency)
- **Max Tokens**: 2000 (sufficient for most assignments)
- **Free Tier**: 30 requests/minute

## Troubleshooting

### "Failed to generate assignment" Error

1. **Check API Key**: Ensure `GROQ_API_KEY` is set correctly in `.env`
2. **Check Internet**: Backend needs internet access to reach Groq API
3. **Check Logs**: Look for error messages in backend console
4. **Rate Limit**: If you hit 30 requests/minute, wait a minute and try again

### Generated Content is Empty

1. Ensure all required fields are filled in the form
2. Check that at least one question type has a count > 0
3. Verify backend logs for API errors

### API Key Not Working

1. Verify the key starts with `gsk_`
2. Check if the key is still active in Groq Console
3. Ensure no extra spaces in the `.env` file
4. Restart the backend after adding the key

## Best Practices

1. **Topic Specificity**: Be specific with topics (e.g., "Solving Linear Equations" instead of just "Algebra")
2. **Question Balance**: Mix different mark questions for comprehensive assessment
3. **Review Before Use**: Always review and edit generated questions as needed
4. **Complexity Matching**: Choose complexity appropriate for the class level
5. **Save Favorites**: Download and save well-generated assignments for future reference

## Security Notes

- API key is stored in environment variables (not in code)
- Never commit `.env` file to Git
- Only teachers can access the generator (role-based access control)
- API calls are made from backend (not exposed to frontend)

## Future Enhancements

Possible improvements for future versions:

1. Save generated assignments directly to database
2. Generate answer keys along with questions
3. Support for different question formats (MCQ, True/False, etc.)
4. Batch generation for multiple classes
5. Custom prompt templates
6. Integration with existing assignment creation flow

## Support

For issues or questions:
1. Check backend logs for detailed error messages
2. Verify Groq API status at [status.groq.com](https://status.groq.com)
3. Review this documentation
4. Contact system administrator

---

**Note**: This feature requires an active internet connection and a valid Groq API key. The free tier is sufficient for typical usage in a tuition center setting.
