// API 기본 설정
const API_BASE_URL = '';
let authToken = localStorage.getItem('booklog_token');

// API 호출 헬퍼 함수
async function apiCall(endpoint, options = {}) {
    const config = {
        headers: {
            'Content-Type': 'application/json',
            ...options.headers
        },
        ...options
    };

    // 인증 토큰 추가
    if (authToken) {
        config.headers.Authorization = `Bearer ${authToken}`;
    }

    try {
        const response = await fetch(`${API_BASE_URL}${endpoint}`, config);
        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message || data.error || '요청 실패');
        }

        return data;
    } catch (error) {
        console.error('API 호출 오류:', error);
        throw error;
    }
}

// 파일 업로드를 위한 FormData API 호출
async function apiCallWithFile(endpoint, formData, options = {}) {
    const config = {
        method: 'POST',
        body: formData,
        headers: {},
        ...options
    };

    // 인증 토큰 추가
    if (authToken) {
        config.headers.Authorization = `Bearer ${authToken}`;
    }

    try {
        const response = await fetch(`${API_BASE_URL}${endpoint}`, config);
        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message || data.error || '요청 실패');
        }

        return data;
    } catch (error) {
        console.error('API 호출 오류:', error);
        throw error;
    }
}

// 인증 관련 API
const authAPI = {
    // 회원가입
    async register(userData) {
        return await apiCall('/api/auth/register', {
            method: 'POST',
            body: JSON.stringify(userData)
        });
    },

    // 로그인
    async login(credentials) {
        const response = await apiCall('/api/auth/login', {
            method: 'POST',
            body: JSON.stringify(credentials)
        });
        
        if (response.token) {
            authToken = response.token;
            localStorage.setItem('booklog_token', authToken);
            localStorage.setItem('booklog_user', JSON.stringify({
                id: response.id,
                email: response.email,
                nickname: response.nickname
            }));
        }
        
        return response;
    },

    // 로그아웃
    logout() {
        authToken = null;
        localStorage.removeItem('booklog_token');
        localStorage.removeItem('booklog_user');
    }
};

// 책 관련 API
const bookAPI = {
    // 책 목록 조회
    async getBooks(search = '', sortBy = 'date', page = 0, size = 20) {
        const params = new URLSearchParams({
            search,
            sortBy,
            page: page.toString(),
            size: size.toString()
        });
        
        return await apiCall(`/api/books?${params}`);
    },

    // 책 상세 조회
    async getBook(bookId) {
        return await apiCall(`/api/books/${bookId}`);
    },

    // 책 등록
    async createBook(bookData, coverImage = null) {
        const formData = new FormData();
        formData.append('book', new Blob([JSON.stringify(bookData)], {
            type: 'application/json'
        }));
        
        if (coverImage) {
            formData.append('coverImage', coverImage);
        }

        return await apiCallWithFile('/api/books', formData);
    },

    // 책 수정
    async updateBook(bookId, bookData, coverImage = null) {
        const formData = new FormData();
        formData.append('book', new Blob([JSON.stringify(bookData)], {
            type: 'application/json'
        }));
        
        if (coverImage) {
            formData.append('coverImage', coverImage);
        }

        return await apiCallWithFile(`/api/books/${bookId}`, formData, {
            method: 'PUT'
        });
    },

    // 책 삭제
    async deleteBook(bookId) {
        return await apiCall(`/api/books/${bookId}`, {
            method: 'DELETE'
        });
    }
};

// 에러 처리 헬퍼
function handleAPIError(error) {
    console.error('API 에러:', error);
    
    if (error.message.includes('401') || error.message.includes('Unauthorized')) {
        // 인증 만료
        authAPI.logout();
        showLogin();
        showError('로그인이 만료되었습니다. 다시 로그인해주세요.');
        return;
    }
    
    showError(error.message || '서버 오류가 발생했습니다.');
}

// 에러 메시지 표시
function showError(message) {
    // 기존 에러 메시지 제거
    const existingError = document.querySelector('.error-message');
    if (existingError) {
        existingError.remove();
    }
    
    // 새 에러 메시지 생성
    const errorDiv = document.createElement('div');
    errorDiv.className = 'error-message error';
    errorDiv.textContent = message;
    
    // 페이지 상단에 추가
    const container = document.querySelector('.container') || document.body;
    container.insertBefore(errorDiv, container.firstChild);
    
    // 5초 후 자동 제거
    setTimeout(() => {
        errorDiv.remove();
    }, 5000);
}

// 성공 메시지 표시
function showSuccess(message) {
    // 기존 성공 메시지 제거
    const existingSuccess = document.querySelector('.success-message');
    if (existingSuccess) {
        existingSuccess.remove();
    }
    
    // 새 성공 메시지 생성
    const successDiv = document.createElement('div');
    successDiv.className = 'success-message';
    successDiv.style.cssText = `
        background: #f0fdf4;
        color: #166534;
        padding: 1rem;
        border-radius: 8px;
        margin: 1rem 0;
        text-align: center;
        border-left: 4px solid #10b981;
    `;
    successDiv.textContent = message;
    
    // 페이지 상단에 추가
    const container = document.querySelector('.container') || document.body;
    container.insertBefore(successDiv, container.firstChild);
    
    // 3초 후 자동 제거
    setTimeout(() => {
        successDiv.remove();
    }, 3000);
}