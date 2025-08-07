package com.booklog.booklog_backend.repository;

import com.booklog.booklog_backend.entity.Book;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

@Repository
public interface BookRepository extends JpaRepository<Book, Long> {
    
    // 사용자별 책 목록 조회 (날짜순)
    Page<Book> findByUserIdOrderByCreatedAtDesc(Long userId, Pageable pageable);
    
    // 검색 기능 - @Query 어노테이션으로 명시적 정의
    @Query("SELECT b FROM Book b WHERE b.user.id = :userId AND " +
           "(LOWER(b.title) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
           "LOWER(b.author) LIKE LOWER(CONCAT('%', :search, '%')))")
    Page<Book> findByUserIdAndSearch(@Param("userId") Long userId, 
                                   @Param("search") String search, 
                                   Pageable pageable);
    
    // 공개된 책 목록 (향후 기능)
    Page<Book> findByIsPublicTrueOrderByCreatedAtDesc(Pageable pageable);
    
    // 사용자의 책 개수
    long countByUserId(Long userId);
}