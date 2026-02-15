package org.student.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.student.dto.GenerateAssignmentRequest;

import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.time.Duration;

@Service
public class AIAssignmentGeneratorService {
    
    private static final Logger logger = LoggerFactory.getLogger(AIAssignmentGeneratorService.class);
    
    private final HttpClient httpClient;
    private final ObjectMapper objectMapper;
    
    @Value("${groq.api.key}")
    private String groqApiKey;
    
    @Value("${groq.api.url:https://api.groq.com/openai/v1/chat/completions}")
    private String groqApiUrl;
    
    @Value("${groq.model:llama-3.3-70b-versatile}")
    private String groqModel;
    
    public AIAssignmentGeneratorService() {
        this.httpClient = HttpClient.newBuilder()
            .connectTimeout(Duration.ofSeconds(30))
            .build();
        this.objectMapper = new ObjectMapper();
    }
    
    /**
     * Generates math assignment questions using Groq AI
     */
    public String generateAssignment(GenerateAssignmentRequest request) {
        try {
            String prompt = buildPrompt(request);
            String requestBody = buildGroqRequest(prompt);
            
            HttpRequest httpRequest = HttpRequest.newBuilder()
                .uri(URI.create(groqApiUrl))
                .header("Content-Type", "application/json")
                .header("Authorization", "Bearer " + groqApiKey)
                .timeout(Duration.ofSeconds(60))
                .POST(HttpRequest.BodyPublishers.ofString(requestBody))
                .build();
            
            logger.info("Sending request to Groq API for assignment generation");
            
            HttpResponse<String> response = httpClient.send(httpRequest, HttpResponse.BodyHandlers.ofString());
            
            if (response.statusCode() == 200) {
                String generatedContent = parseGroqResponse(response.body());
                logger.info("Successfully generated assignment from Groq API");
                return generatedContent;
            } else {
                logger.error("Groq API returned error: {} - {}", response.statusCode(), response.body());
                throw new RuntimeException("Failed to generate assignment. API returned status: " + response.statusCode());
            }
            
        } catch (Exception e) {
            logger.error("Error generating assignment with Groq AI", e);
            throw new RuntimeException("Failed to generate assignment: " + e.getMessage(), e);
        }
    }
    
    private String buildPrompt(GenerateAssignmentRequest request) {
        StringBuilder prompt = new StringBuilder();
        prompt.append("You are an expert mathematics teacher creating an assignment for Class ")
              .append(request.getClassGrade())
              .append(" students.\n\n");
        
        prompt.append("Topic: ").append(request.getTopic()).append("\n");
        prompt.append("Complexity Level: ").append(request.getComplexity()).append("\n\n");
        
        prompt.append("Generate a mathematics assignment with the following structure:\n\n");
        
        int questionNumber = 1;
        
        if (request.getOneMarkQuestions() > 0) {
            prompt.append("SECTION A: 1-Mark Questions (").append(request.getOneMarkQuestions()).append(" questions)\n");
            prompt.append("These should be short answer questions, fill in the blanks, or multiple choice.\n\n");
        }
        
        if (request.getTwoMarkQuestions() > 0) {
            prompt.append("SECTION B: 2-Mark Questions (").append(request.getTwoMarkQuestions()).append(" questions)\n");
            prompt.append("These should require brief explanations or simple problem-solving.\n\n");
        }
        
        if (request.getThreeMarkQuestions() > 0) {
            prompt.append("SECTION C: 3-Mark Questions (").append(request.getThreeMarkQuestions()).append(" questions)\n");
            prompt.append("These should require detailed working and explanations.\n\n");
        }
        
        if (request.getFiveMarkQuestions() > 0) {
            prompt.append("SECTION D: 5-Mark Questions (").append(request.getFiveMarkQuestions()).append(" questions)\n");
            prompt.append("These should be comprehensive problems requiring multiple steps and detailed solutions.\n\n");
        }
        
        prompt.append("Important Guidelines:\n");
        prompt.append("1. All questions must be appropriate for Class ").append(request.getClassGrade()).append(" level\n");
        prompt.append("2. Questions should be clear, unambiguous, and properly formatted\n");
        prompt.append("3. Use proper mathematical notation and symbols\n");
        prompt.append("4. Ensure questions are aligned with the topic: ").append(request.getTopic()).append("\n");
        prompt.append("5. Difficulty should be: ").append(request.getComplexity()).append("\n");
        prompt.append("6. Number each question sequentially\n");
        prompt.append("7. Format the output as a clean, ready-to-use assignment\n\n");
        
        prompt.append("Please generate the complete assignment now:");
        
        return prompt.toString();
    }
    
    private String buildGroqRequest(String prompt) throws Exception {
        String requestJson = String.format("""
            {
                "model": "%s",
                "messages": [
                    {
                        "role": "system",
                        "content": "You are an expert mathematics teacher who creates well-structured, pedagogically sound assignments for students. Your assignments are clear, appropriately challenging, and follow standard mathematical notation."
                    },
                    {
                        "role": "user",
                        "content": %s
                    }
                ],
                "temperature": 0.7,
                "max_tokens": 2000,
                "top_p": 1,
                "stream": false
            }
            """, groqModel, objectMapper.writeValueAsString(prompt));
        
        return requestJson;
    }
    
    private String parseGroqResponse(String responseBody) throws Exception {
        JsonNode root = objectMapper.readTree(responseBody);
        JsonNode choices = root.get("choices");
        
        if (choices != null && choices.isArray() && choices.size() > 0) {
            JsonNode message = choices.get(0).get("message");
            if (message != null) {
                String content = message.get("content").asText();
                return content;
            }
        }
        
        throw new RuntimeException("Invalid response format from Groq API");
    }
}
