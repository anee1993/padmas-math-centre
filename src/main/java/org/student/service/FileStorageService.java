package org.student.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.UUID;

@Service
public class FileStorageService {
    
    @Value("${supabase.url}")
    private String supabaseUrl;
    
    @Value("${supabase.key}")
    private String supabaseKey;
    
    private static final String BUCKET_NAME = "assignments";
    private static final long MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
    
    private final HttpClient httpClient = HttpClient.newHttpClient();
    
    public String uploadFile(MultipartFile file, String folder) throws IOException {
        // Validate file
        if (file.isEmpty()) {
            throw new IllegalArgumentException("File is empty");
        }
        
        if (file.getSize() > MAX_FILE_SIZE) {
            throw new IllegalArgumentException("File size exceeds 10MB limit");
        }
        
        String contentType = file.getContentType();
        if (!isValidFileType(contentType)) {
            throw new IllegalArgumentException("Invalid file type. Only PDF and Word documents are allowed");
        }
        
        // Generate unique filename
        String originalFilename = file.getOriginalFilename();
        String extension = originalFilename != null && originalFilename.contains(".") 
            ? originalFilename.substring(originalFilename.lastIndexOf("."))
            : "";
        
        String timestamp = LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyyMMdd_HHmmss"));
        String uniqueFilename = folder + "/" + timestamp + "_" + UUID.randomUUID().toString() + extension;
        
        try {
            // Upload to Supabase Storage
            String uploadUrl = supabaseUrl + "/storage/v1/object/" + BUCKET_NAME + "/" + uniqueFilename;
            
            HttpRequest request = HttpRequest.newBuilder()
                .uri(URI.create(uploadUrl))
                .header("Authorization", "Bearer " + supabaseKey)
                .header("Content-Type", contentType)
                .POST(HttpRequest.BodyPublishers.ofByteArray(file.getBytes()))
                .build();
            
            HttpResponse<String> response = httpClient.send(request, HttpResponse.BodyHandlers.ofString());
            
            if (response.statusCode() != 200 && response.statusCode() != 201) {
                throw new IOException("Failed to upload file to Supabase: " + response.body());
            }
            
            // Return public URL
            return supabaseUrl + "/storage/v1/object/public/" + BUCKET_NAME + "/" + uniqueFilename;
            
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
            throw new IOException("File upload interrupted", e);
        }
    }
    
    public void deleteFile(String fileUrl) throws IOException {
        if (fileUrl == null || fileUrl.isEmpty()) {
            return;
        }
        
        try {
            // Extract filename from URL
            String prefix = "/storage/v1/object/public/" + BUCKET_NAME + "/";
            int index = fileUrl.indexOf(prefix);
            if (index == -1) {
                return; // Not a Supabase storage URL
            }
            
            String filename = fileUrl.substring(index + prefix.length());
            String deleteUrl = supabaseUrl + "/storage/v1/object/" + BUCKET_NAME + "/" + filename;
            
            HttpRequest request = HttpRequest.newBuilder()
                .uri(URI.create(deleteUrl))
                .header("Authorization", "Bearer " + supabaseKey)
                .DELETE()
                .build();
            
            httpClient.send(request, HttpResponse.BodyHandlers.ofString());
            
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
            throw new IOException("File deletion interrupted", e);
        }
    }
    
    private boolean isValidFileType(String contentType) {
        if (contentType == null) {
            return false;
        }
        
        return contentType.equals("application/pdf") ||
               contentType.equals("application/msword") ||
               contentType.equals("application/vnd.openxmlformats-officedocument.wordprocessingml.document");
    }
}
