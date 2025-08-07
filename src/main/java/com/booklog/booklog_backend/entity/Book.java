package com.booklog.booklog_backend.entity;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "books")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Book {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(nullable = false, length = 500)
    private String title;
    
    @Column(nullable = false)
    private String author;
    
    private String publisher;
    
    @Column(name = "read_date")
    private LocalDate readDate;
    
    @Column(name = "cover_image_path", length = 500)
    private String coverImagePath;
    
    @Column(columnDefinition = "TEXT")
    private String description;
    
    @Column(columnDefinition = "TEXT")
    private String review;
    
    @Column(name = "before_thoughts", columnDefinition = "TEXT")
    private String beforeThoughts;
    
    @Column(name = "after_thoughts", columnDefinition = "TEXT")
    private String afterThoughts;
    
    @Column(name = "is_public", nullable = false)
    private Boolean isPublic = true;
    
    @CreationTimestamp
    @Column(name = "created_at")
    private LocalDateTime createdAt;
    
    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;
}