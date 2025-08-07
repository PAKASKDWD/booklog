// 전역 변수
let currentBooks = [];
let currentEditingBook = null;

// 페이지 로드 시 초기화
document.addEventListener('DOMContentLoaded', function() {
    checkAuth();
    
    // 검색 입력 이벤트
    const searchInput = document.getElementById('searchInput');
    let searchTimeout;
    searchInput.addEventListener('input', function() {
        clearTimeout(searchTimeout);
        searchTimeout = setTimeout(() => {
            loadBooks();
        }, 500);
    });
    
    // 이미지 업로드 미리보기
    const bookCover = document.getElementById('bookCover');
    bookCover.addEventListener('change', handleImagePreview);
});

// 책 목록 로드
async function loadBooks() {
    try {
        const search = document.getElementById('searchInput').value;
        const sortBy = document.getElementById('sortSelect').value;
        
        const response = await bookAPI.getBooks(search, sortBy, 0, 100);
        currentBooks = response.content || [];
        
        renderBooks();
        
    } catch (error) {
        handleAPIError(error);
    }
}

// 책 목록 렌더링
function renderBooks() {
    const booksGrid = document.getElementById('booksGrid');
    const emptyState = document.getElementById('emptyState');
    
    if (currentBooks.length === 0) {
        booksGrid.style.display = 'none';
        emptyState.style.display = 'block';
        return;
    }
    
    booksGrid.style.display = 'grid';
    emptyState.style.display = 'none';
    
    booksGrid.innerHTML = currentBooks.map(book => `
        <div class="book-card" onclick="showBookDetail(${book.id})">
            <div class="book-cover">
                ${book.coverImageUrl ? 
                    `<img src="${book.coverImageUrl}" alt="${book.title}" />` :
                    `<div class="default-cover">📚</div>`
                }
            </div>
            <div class="book-info">
                <div class="book-title">${escapeHtml(book.title)}</div>
                <div class="book-author">${escapeHtml(book.author)}</div>
                <div class="book-meta">
                    <span>${book.readDate || '날짜 미설정'}</span>
                    <span>${book.isPublic ? '👁️' : '🔒'}</span>
                </div>
            </div>
        </div>
    `).join('');
}

// 책 등록 모달 표시
function showAddForm() {
    currentEditingBook = null;
    document.getElementById('modalTitle').textContent = '새 책 등록';
    document.getElementById('submitBtn').textContent = '등록하기';
    
    // 폼 초기화
    document.getElementById('bookForm').reset();
    document.getElementById('coverPreview').innerHTML = '';
    
    document.getElementById('bookModal').style.display = 'flex';
}

// 책 수정 모달 표시
function showEditForm(book) {
    currentEditingBook = book;
    document.getElementById('modalTitle').textContent = '책 정보 수정';
    document.getElementById('submitBtn').textContent = '수정 완료';
    
    // 폼에 기존 데이터 채우기
    document.getElementById('bookTitle').value = book.title || '';
    document.getElementById('bookAuthor').value = book.author || '';
    document.getElementById('bookPublisher').value = book.publisher || '';
    document.getElementById('bookReadDate').value = book.readDate || '';
    document.getElementById('bookDescription').value = book.description || '';
    document.getElementById('bookReview').value = book.review || '';
    document.getElementById('bookBeforeThoughts').value = book.beforeThoughts || '';
    document.getElementById('bookAfterThoughts').value = book.afterThoughts || '';
    document.getElementById('bookIsPublic').checked = book.isPublic !== false;
    
    // 기존 이미지 미리보기
    const coverPreview = document.getElementById('coverPreview');
    if (book.coverImageUrl) {
        coverPreview.innerHTML = `
            <div style="margin-top: 1rem;">
                <p style="font-size: 0.9rem; color: #6b7280;">현재 이미지:</p>
                <img src="${book.coverImageUrl}" alt="현재 표지" style="max-width: 100px; height: auto; border-radius: 4px;" />
            </div>
        `;
    } else {
        coverPreview.innerHTML = '';
    }
    
    document.getElementById('bookModal').style.display = 'flex';
}

// 모달 닫기
function closeModal() {
    document.getElementById('bookModal').style.display = 'none';
    currentEditingBook = null;
}

// 책 상세보기 모달 닫기
function closeDetailModal() {
    document.getElementById('detailModal').style.display = 'none';
    currentEditingBook = null;
}

// 책 등록/수정 처리
async function handleBookSubmit(event) {
    event.preventDefault();
    
    const bookData = {
        title: document.getElementById('bookTitle').value.trim(),
        author: document.getElementById('bookAuthor').value.trim(),
        publisher: document.getElementById('bookPublisher').value.trim(),
        readDate: document.getElementById('bookReadDate').value || null,
        description: document.getElementById('bookDescription').value.trim(),
        review: document.getElementById('bookReview').value.trim(),
        beforeThoughts: document.getElementById('bookBeforeThoughts').value.trim(),
        afterThoughts: document.getElementById('bookAfterThoughts').value.trim(),
        isPublic: document.getElementById('bookIsPublic').checked
    };
    
    if (!bookData.title || !bookData.author) {
        showError('책 제목과 저자는 필수 입력사항입니다.');
        return;
    }
    
    try {
        const submitBtn = document.getElementById('submitBtn');
        submitBtn.disabled = true;
        submitBtn.textContent = currentEditingBook ? '수정 중...' : '등록 중...';
        
        const coverFile = document.getElementById('bookCover').files[0];
        
        if (currentEditingBook) {
            // 수정
            await bookAPI.updateBook(currentEditingBook.id, bookData, coverFile);
            showSuccess('책 정보가 수정되었습니다.');
        } else {
            // 등록
            await bookAPI.createBook(bookData, coverFile);
            showSuccess('새 책이 등록되었습니다.');
        }
        
        closeModal();
        loadBooks();
        
    } catch (error) {
        handleAPIError(error);
    } finally {
        const submitBtn = document.getElementById('submitBtn');
        submitBtn.disabled = false;
        submitBtn.textContent = currentEditingBook ? '수정 완료' : '등록하기';
    }
}

// 책 상세보기
async function showBookDetail(bookId) {
    try {
        const book = await bookAPI.getBook(bookId);
        currentEditingBook = book;
        
        const detailContent = document.getElementById('bookDetailContent');
        detailContent.innerHTML = `
            <div class="book-detail-header">
                <div class="book-detail-cover">
                    ${book.coverImageUrl ? 
                        `<img src="${book.coverImageUrl}" alt="${book.title}" />` :
                        `<div class="default-cover" style="font-size: 4rem;">📚</div>`
                    }
                </div>
                <div class="book-detail-info">
                    <h1>${escapeHtml(book.title)}</h1>
                    <div class="book-detail-meta">
                        <div><span>✍️</span><strong>저자:</strong> ${escapeHtml(book.author)}</div>
                        ${book.publisher ? `<div><span>🏢</span><strong>출판사:</strong> ${escapeHtml(book.publisher)}</div>` : ''}
                        ${book.readDate ? `<div><span>📅</span><strong>읽은 날짜:</strong> ${book.readDate}</div>` : ''}
                        <div><span>${book.isPublic ? '👁️' : '🔒'}</span><strong>공개 설정:</strong> ${book.isPublic ? '공개' : '비공개'}</div>
                    </div>
                    ${book.description ? `
                        <div class="book-detail-description">
                            <h3>책 소개</h3>
                            <p>${escapeHtml(book.description).replace(/\n/g, '<br>')}</p>
                        </div>
                    ` : ''}
                </div>
            </div>
            
            <div class="book-detail-sections">
                ${book.beforeThoughts ? `
                    <div class="book-detail-section">
                        <div class="section-before">
                            <h3>독서 전 생각</h3>
                            <p>${escapeHtml(book.beforeThoughts)}</p>
                        </div>
                    </div>
                ` : ''}
                
                ${book.review ? `
                    <div class="book-detail-section">
                        <div class="section-review">
                            <h3>독후감</h3>
                            <p>${escapeHtml(book.review)}</p>
                        </div>
                    </div>
                ` : ''}
                
                ${book.afterThoughts ? `
                    <div class="book-detail-section">
                        <div class="section-after">
                            <h3>독서 후 느낀 점</h3>
                            <p>${escapeHtml(book.afterThoughts)}</p>
                        </div>
                    </div>
                ` : ''}
                
                ${!book.beforeThoughts && !book.review && !book.afterThoughts ? `
                    <div class="book-detail-section" style="text-align: center; color: #6b7280;">
                        <p>아직 독후감이 작성되지 않았습니다.</p>
                    </div>
                ` : ''}
            </div>
        `;
        
        document.getElementById('detailModal').style.display = 'flex';
        
    } catch (error) {
        handleAPIError(error);
    }
}

// 책 수정 (상세보기에서)
function editBook() {
    if (currentEditingBook) {
        closeDetailModal();
        showEditForm(currentEditingBook);
    }
}

// 책 삭제
async function deleteBook() {
    if (!currentEditingBook) return;
    
    if (!confirm(`"${currentEditingBook.title}"을(를) 정말 삭제하시겠습니까?\n이 작업은 되돌릴 수 없습니다.`)) {
        return;
    }
    
    try {
        await bookAPI.deleteBook(currentEditingBook.id);
        showSuccess('책이 삭제되었습니다.');
        closeDetailModal();
        loadBooks();
        
    } catch (error) {
        handleAPIError(error);
    }
}

// 이미지 미리보기 처리
function handleImagePreview(event) {
    const file = event.target.files[0];
    const preview = document.getElementById('coverPreview');
    
    if (!file) {
        preview.innerHTML = '';
        return;
    }
    
    // 파일 크기 체크 (10MB)
    if (file.size > 10 * 1024 * 1024) {
        showError('이미지 파일 크기는 10MB를 초과할 수 없습니다.');
        event.target.value = '';
        preview.innerHTML = '';
        return;
    }
    
    // 파일 타입 체크
    if (!file.type.startsWith('image/')) {
        showError('이미지 파일만 업로드 가능합니다.');
        event.target.value = '';
        preview.innerHTML = '';
        return;
    }
    
    const reader = new FileReader();
    reader.onload = function(e) {
        preview.innerHTML = `
            <div style="margin-top: 1rem;">
                <p style="font-size: 0.9rem; color: #6b7280;">미리보기:</p>
                <img src="${e.target.result}" alt="미리보기" style="max-width: 150px; height: auto; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.1);" />
            </div>
        `;
    };
    reader.readAsDataURL(file);
}

// HTML 이스케이프 함수
function escapeHtml(text) {
    if (!text) return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// 모달 외부 클릭 시 닫기
document.addEventListener('click', function(event) {
    const bookModal = document.getElementById('bookModal');
    const detailModal = document.getElementById('detailModal');
    
    if (event.target === bookModal) {
        closeModal();
    }
    
    if (event.target === detailModal) {
        closeDetailModal();
    }
});

// 키보드 이벤트 처리
document.addEventListener('keydown', function(event) {
    // ESC 키로 모달 닫기
    if (event.key === 'Escape') {
        const bookModal = document.getElementById('bookModal');
        const detailModal = document.getElementById('detailModal');
        
        if (bookModal.style.display === 'flex') {
            closeModal();
        } else if (detailModal.style.display === 'flex') {
            closeDetailModal();
        }
    }
});