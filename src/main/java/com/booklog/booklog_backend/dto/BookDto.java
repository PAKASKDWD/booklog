package com.booklog.booklog_backend.dto;

import lombok.Data;
import jakarta.validation.constraints.NotBlank;
import java.time.LocalDate;

@Data
public class BookDto {
    private Long id;
    
    @NotBlank(message = "책 제목은 필수입니다.")
    private String title;
    
    @NotBlank(message = "저자는 필수입니다.")
    private String author;
    
    private String publisher;
    private LocalDate readDate;
    private String description;
    private String review;
    private String beforeThoughts;
    private String afterThoughts;
    private Boolean isPublic = true;
}