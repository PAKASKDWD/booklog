package com.booklog.booklog_backend.service;

import com.booklog.booklog_backend.dto.BookDto;
import com.booklog.booklog_backend.dto.BookResponseDto;
import com.booklog.booklog_backend.entity.Book;
import com.booklog.booklog_backend.entity.User;
import com.booklog.booklog_backend.repository.BookRepository;
import com.booklog.booklog_backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.BeanUtils;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class BookService {
    private final BookRepository bookRepository;
    private final UserRepository userRepository;
    
    @Transactional
    public BookResponseDto createBook(BookDto bookDto, Long userId, MultipartFile coverImage) {
        User user = userRepository.findById(userId)
            .orElseThrow(() -> new RuntimeException("User not found"));
        
        Book book = new Book();
        BeanUtils.copyProperties(bookDto, book);
        book.setUser(user);
        
        if (coverImage != null && !coverImage.isEmpty()) {
            String imagePath = saveImage(coverImage);
            book.setCoverImagePath(imagePath);
        }
        
        Book savedBook = bookRepository.save(book);
        return convertToResponseDto(savedBook);
    }
    
    @Transactional
    public BookResponseDto updateBook(Long bookId, BookDto bookDto, Long userId, MultipartFile coverImage) {
        Book book = bookRepository.findById(bookId)
            .orElseThrow(() -> new RuntimeException("Book not found"));
        
        if (!book.getUser().getId().equals(userId)) {
            throw new RuntimeException("Access denied");
        }
        
        BeanUtils.copyProperties(bookDto, book, "id", "user", "createdAt");
        
        if (coverImage != null && !coverImage.isEmpty()) {
            String imagePath = saveImage(coverImage);
            book.setCoverImagePath(imagePath);
        }
        
        Book savedBook = bookRepository.save(book);
        return convertToResponseDto(savedBook);
    }
    
    @Transactional
    public void deleteBook(Long bookId, Long userId) {
        Book book = bookRepository.findById(bookId)
            .orElseThrow(() -> new RuntimeException("Book not found"));
        
        if (!book.getUser().getId().equals(userId)) {
            throw new RuntimeException("Access denied");
        }
        
        bookRepository.delete(book);
    }
    
    public BookResponseDto getBook(Long bookId, Long userId) {
        Book book = bookRepository.findById(bookId)
            .orElseThrow(() -> new RuntimeException("Book not found"));
        
        if (!book.getUser().getId().equals(userId) && !book.getIsPublic()) {
            throw new RuntimeException("Access denied");
        }
        
        return convertToResponseDto(book);
    }
    
    public Page<BookResponseDto> getUserBooks(Long userId, String search, String sortBy, int page, int size) {
        Sort sort = Sort.by(Sort.Direction.DESC, "createdAt");
        if ("title".equals(sortBy)) {
            sort = Sort.by(Sort.Direction.ASC, "title");
        } else if ("author".equals(sortBy)) {
            sort = Sort.by(Sort.Direction.ASC, "author");
        }
        
        Pageable pageable = PageRequest.of(page, size, sort);
        Page<Book> books;
        
        if (search != null && !search.trim().isEmpty()) {
            // 수정된 부분: 메소드 이름 변경
            books = bookRepository.findByUserIdAndSearch(userId, search.trim(), pageable);
        } else {
            books = bookRepository.findByUserIdOrderByCreatedAtDesc(userId, pageable);
        }
            
        return books.map(this::convertToResponseDto);
    }
    
    private String saveImage(MultipartFile file) {
        try {
            String uploadDir = "uploads/covers";
            Path uploadPath = Paths.get(uploadDir);
            
            if (!Files.exists(uploadPath)) {
                Files.createDirectories(uploadPath);
            }
            
            String fileName = UUID.randomUUID().toString() + "_" + file.getOriginalFilename();
            Path filePath = uploadPath.resolve(fileName);
            Files.copy(file.getInputStream(), filePath);
            
            return fileName;
        } catch (IOException e) {
            throw new RuntimeException("File upload failed", e);
        }
    }
    
    private BookResponseDto convertToResponseDto(Book book) {
        BookResponseDto dto = new BookResponseDto();
        BeanUtils.copyProperties(book, dto);
        dto.setUserNickname(book.getUser().getNickname());
        
        if (book.getCoverImagePath() != null) {
            dto.setCoverImageUrl("/api/images/" + book.getCoverImagePath());
        }
        
        return dto;
    }
}