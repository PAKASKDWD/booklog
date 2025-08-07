package com.booklog.booklog_backend.controller;

import com.booklog.booklog_backend.dto.BookDto;
import com.booklog.booklog_backend.dto.BookResponseDto;
import com.booklog.booklog_backend.security.UserDetailsImpl;
import com.booklog.booklog_backend.service.BookService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/api/books")
@RequiredArgsConstructor
@CrossOrigin(origins = "*", maxAge = 3600)
public class BookController {
    private final BookService bookService;
    
    @PostMapping
    public ResponseEntity<BookResponseDto> createBook(
            @Valid @RequestPart("book") BookDto bookDto,
            @RequestPart(value = "coverImage", required = false) MultipartFile coverImage,
            Authentication authentication) {
        
        Long userId = getCurrentUserId(authentication);
        BookResponseDto response = bookService.createBook(bookDto, userId, coverImage);
        return ResponseEntity.ok(response);
    }
    
    @PutMapping("/{id}")
    public ResponseEntity<BookResponseDto> updateBook(
            @PathVariable Long id,
            @Valid @RequestPart("book") BookDto bookDto,
            @RequestPart(value = "coverImage", required = false) MultipartFile coverImage,
            Authentication authentication) {
        
        Long userId = getCurrentUserId(authentication);
        BookResponseDto response = bookService.updateBook(id, bookDto, userId, coverImage);
        return ResponseEntity.ok(response);
    }
    
    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteBook(@PathVariable Long id, Authentication authentication) {
        Long userId = getCurrentUserId(authentication);
        bookService.deleteBook(id, userId);
        return ResponseEntity.ok().body("책이 삭제되었습니다.");
    }
    
    @GetMapping("/{id}")
    public ResponseEntity<BookResponseDto> getBook(@PathVariable Long id, Authentication authentication) {
        Long userId = getCurrentUserId(authentication);
        BookResponseDto response = bookService.getBook(id, userId);
        return ResponseEntity.ok(response);
    }
    
    @GetMapping
    public ResponseEntity<Page<BookResponseDto>> getUserBooks(
            @RequestParam(defaultValue = "") String search,
            @RequestParam(defaultValue = "date") String sortBy,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            Authentication authentication) {
        
        Long userId = getCurrentUserId(authentication);
        Page<BookResponseDto> response = bookService.getUserBooks(userId, search, sortBy, page, size);
        return ResponseEntity.ok(response);
    }
    
    private Long getCurrentUserId(Authentication authentication) {
        UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();
        return userDetails.getId();
    }
}