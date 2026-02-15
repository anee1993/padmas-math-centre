package org.student.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import org.student.entity.QueryReply;

import java.util.List;

@Repository
public interface QueryReplyRepository extends JpaRepository<QueryReply, Long> {
    List<QueryReply> findByQueryIdOrderByCreatedAtAsc(Long queryId);
    Long countByQueryId(Long queryId);
}
