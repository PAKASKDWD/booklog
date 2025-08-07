package com.booklog.booklog_backend.dto;

import lombok.Data;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
public class BookResponseDto {
    private Long id;
    private String title;
    private String author;
    private String publisher;
    private LocalDate readDate;
    private String coverImageUrl;
    private String description;
    private String review;
    private String beforeThoughts;
    private String afterThoughts;
    private Boolean isPublic;
    private LocalDateTime createdAt;
    private String userNickname;
}