package org.student.controller;

import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.student.dto.*;
import org.student.service.QueryService;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/queries")
public class QueryController {
    
    private final QueryService queryService;
    
    public QueryController(QueryService queryService) {
        this.queryService = queryService;
    }
    
    @PostMapping
    public ResponseEntity<QueryDTO> createQuery(
            @Valid @RequestBody CreateQueryRequest request,
            Authentication authentication) {
        Long studentId = Long.parseLong(authentication.getName());
        QueryDTO query = queryService.createQuery(studentId, request);
        return ResponseEntity.ok(query);
    }
    
    @GetMapping("/my-class")
    public ResponseEntity<List<QueryDTO>> getMyClassQueries(Authentication authentication) {
        Long userId = Long.parseLong(authentication.getName());
        List<QueryDTO> queries = queryService.getMyClassQueries(userId);
        return ResponseEntity.ok(queries);
    }
    
    @GetMapping("/class/{classGrade}")
    public ResponseEntity<List<QueryDTO>> getQueriesByClass(@PathVariable Integer classGrade) {
        List<QueryDTO> queries = queryService.getQueriesByClass(classGrade);
        return ResponseEntity.ok(queries);
    }
    
    @GetMapping("/all")
    public ResponseEntity<List<QueryDTO>> getAllQueries() {
        List<QueryDTO> queries = queryService.getAllQueries();
        return ResponseEntity.ok(queries);
    }
    
    @GetMapping("/{queryId}")
    public ResponseEntity<QueryDTO> getQuery(@PathVariable Long queryId) {
        QueryDTO query = queryService.getQueryById(queryId);
        return ResponseEntity.ok(query);
    }
    
    @PostMapping("/{queryId}/replies")
    public ResponseEntity<QueryReplyDTO> addReply(
            @PathVariable Long queryId,
            @Valid @RequestBody CreateReplyRequest request,
            Authentication authentication) {
        Long userId = Long.parseLong(authentication.getName());
        QueryReplyDTO reply = queryService.addReply(queryId, userId, request);
        return ResponseEntity.ok(reply);
    }
    
    @GetMapping("/{queryId}/replies")
    public ResponseEntity<List<QueryReplyDTO>> getReplies(@PathVariable Long queryId) {
        List<QueryReplyDTO> replies = queryService.getReplies(queryId);
        return ResponseEntity.ok(replies);
    }
    
    @DeleteMapping("/{queryId}")
    public ResponseEntity<ApiResponse> deleteQuery(@PathVariable Long queryId) {
        queryService.deleteQuery(queryId);
        return ResponseEntity.ok(new ApiResponse(true, "Query deleted successfully"));
    }
    
    @PostMapping("/block-student")
    public ResponseEntity<ApiResponse> blockStudent(@Valid @RequestBody BlockStudentRequest request) {
        queryService.blockStudent(request.getStudentId(), request.getReason());
        return ResponseEntity.ok(new ApiResponse(true, "Student blocked from posting queries"));
    }
    
    @DeleteMapping("/unblock-student/{studentId}")
    public ResponseEntity<ApiResponse> unblockStudent(@PathVariable Long studentId) {
        queryService.unblockStudent(studentId);
        return ResponseEntity.ok(new ApiResponse(true, "Student unblocked"));
    }
    
    @GetMapping("/is-blocked")
    public ResponseEntity<Map<String, Boolean>> isBlocked(Authentication authentication) {
        Long studentId = Long.parseLong(authentication.getName());
        boolean blocked = queryService.isStudentBlocked(studentId);
        return ResponseEntity.ok(Map.of("blocked", blocked));
    }
}
