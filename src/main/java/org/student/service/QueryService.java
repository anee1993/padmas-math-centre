package org.student.service;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.student.dto.CreateQueryRequest;
import org.student.dto.CreateReplyRequest;
import org.student.dto.QueryDTO;
import org.student.dto.QueryReplyDTO;
import org.student.entity.BlockedStudent;
import org.student.entity.Query;
import org.student.entity.QueryReply;
import org.student.entity.User;
import org.student.exception.ResourceNotFoundException;
import org.student.repository.BlockedStudentRepository;
import org.student.repository.QueryReplyRepository;
import org.student.repository.QueryRepository;
import org.student.repository.UserRepository;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class QueryService {
    
    private final QueryRepository queryRepository;
    private final QueryReplyRepository replyRepository;
    private final BlockedStudentRepository blockedStudentRepository;
    private final UserRepository userRepository;
    
    public QueryService(QueryRepository queryRepository,
                       QueryReplyRepository replyRepository,
                       BlockedStudentRepository blockedStudentRepository,
                       UserRepository userRepository) {
        this.queryRepository = queryRepository;
        this.replyRepository = replyRepository;
        this.blockedStudentRepository = blockedStudentRepository;
        this.userRepository = userRepository;
    }
    
    @Transactional
    public QueryDTO createQuery(Long studentId, CreateQueryRequest request) {
        // Check if student is blocked
        if (blockedStudentRepository.existsByStudentId(studentId)) {
            throw new IllegalStateException("You are blocked from posting queries");
        }
        
        User student = userRepository.findById(studentId)
            .orElseThrow(() -> new ResourceNotFoundException("Student not found"));
        
        if (student.getRole() != User.Role.STUDENT) {
            throw new IllegalArgumentException("Only students can create queries");
        }
        
        Query query = new Query();
        query.setStudentId(studentId);
        query.setStudentName(student.getStudentProfile().getFullName());
        query.setClassGrade(student.getStudentProfile().getClassGrade());
        query.setTitle(request.getTitle());
        query.setContent(request.getContent());
        query.setIsDeleted(false);
        
        Query savedQuery = queryRepository.save(query);
        
        return mapToDTO(savedQuery);
    }
    
    public List<QueryDTO> getQueriesByClass(Integer classGrade) {
        List<Query> queries = queryRepository.findByClassGradeAndIsDeletedFalseOrderByCreatedAtDesc(classGrade);
        return queries.stream()
            .map(this::mapToDTO)
            .collect(Collectors.toList());
    }
    
    public List<QueryDTO> getAllQueries() {
        List<Query> queries = queryRepository.findByIsDeletedFalseOrderByCreatedAtDesc();
        return queries.stream()
            .map(this::mapToDTO)
            .collect(Collectors.toList());
    }
    
    public List<QueryDTO> getMyQueries(Long studentId) {
        List<Query> queries = queryRepository.findByStudentIdAndIsDeletedFalseOrderByCreatedAtDesc(studentId);
        return queries.stream()
            .map(this::mapToDTO)
            .collect(Collectors.toList());
    }
    
    public List<QueryDTO> getMyClassQueries(Long userId) {
        User user = userRepository.findById(userId)
            .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        
        if (user.getRole() != User.Role.STUDENT) {
            throw new IllegalArgumentException("Only students can view class queries");
        }
        
        Integer classGrade = user.getStudentProfile().getClassGrade();
        return getQueriesByClass(classGrade);
    }
    
    public QueryDTO getQueryById(Long queryId) {
        Query query = queryRepository.findById(queryId)
            .orElseThrow(() -> new ResourceNotFoundException("Query not found"));
        
        if (query.getIsDeleted()) {
            throw new ResourceNotFoundException("Query has been deleted");
        }
        
        return mapToDTO(query);
    }
    
    @Transactional
    public QueryReplyDTO addReply(Long queryId, Long userId, CreateReplyRequest request) {
        Query query = queryRepository.findById(queryId)
            .orElseThrow(() -> new ResourceNotFoundException("Query not found"));
        
        if (query.getIsDeleted()) {
            throw new IllegalStateException("Cannot reply to deleted query");
        }
        
        User user = userRepository.findById(userId)
            .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        
        QueryReply reply = new QueryReply();
        reply.setQueryId(queryId);
        reply.setUserId(userId);
        reply.setUserRole(user.getRole().name());
        
        if (user.getRole() == User.Role.STUDENT) {
            reply.setUserName(user.getStudentProfile().getFullName());
        } else {
            reply.setUserName(user.getFullName());
        }
        
        reply.setContent(request.getContent());
        
        QueryReply savedReply = replyRepository.save(reply);
        
        return mapReplyToDTO(savedReply);
    }
    
    public List<QueryReplyDTO> getReplies(Long queryId) {
        List<QueryReply> replies = replyRepository.findByQueryIdOrderByCreatedAtAsc(queryId);
        return replies.stream()
            .map(this::mapReplyToDTO)
            .collect(Collectors.toList());
    }
    
    @Transactional
    public void deleteQuery(Long queryId) {
        Query query = queryRepository.findById(queryId)
            .orElseThrow(() -> new ResourceNotFoundException("Query not found"));
        
        query.setIsDeleted(true);
        queryRepository.save(query);
    }
    
    @Transactional
    public void blockStudent(Long studentId, String reason) {
        User student = userRepository.findById(studentId)
            .orElseThrow(() -> new ResourceNotFoundException("Student not found"));
        
        if (student.getRole() != User.Role.STUDENT) {
            throw new IllegalArgumentException("Can only block students");
        }
        
        if (blockedStudentRepository.existsByStudentId(studentId)) {
            throw new IllegalStateException("Student is already blocked");
        }
        
        BlockedStudent blocked = new BlockedStudent();
        blocked.setStudentId(studentId);
        blocked.setReason(reason);
        blockedStudentRepository.save(blocked);
    }
    
    @Transactional
    public void unblockStudent(Long studentId) {
        blockedStudentRepository.deleteByStudentId(studentId);
    }
    
    public boolean isStudentBlocked(Long studentId) {
        return blockedStudentRepository.existsByStudentId(studentId);
    }
    
    private QueryDTO mapToDTO(Query query) {
        Long replyCount = replyRepository.countByQueryId(query.getId());
        return new QueryDTO(
            query.getId(),
            query.getStudentId(),
            query.getStudentName(),
            query.getClassGrade(),
            query.getTitle(),
            query.getContent(),
            query.getCreatedAt(),
            replyCount
        );
    }
    
    private QueryReplyDTO mapReplyToDTO(QueryReply reply) {
        return new QueryReplyDTO(
            reply.getId(),
            reply.getQueryId(),
            reply.getUserId(),
            reply.getUserName(),
            reply.getUserRole(),
            reply.getContent(),
            reply.getCreatedAt()
        );
    }
}
