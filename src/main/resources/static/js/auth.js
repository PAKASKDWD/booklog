// 인증 관련 함수들

// 로그인 상태 확인
function checkAuth() {
    const token = localStorage.getItem('booklog_token');
    const user = localStorage.getItem('booklog_user');
    
    if (token && user) {
        authToken = token;
        showMain(JSON.parse(user));
        return true;
    }
    
    showLogin();
    return false;
}

// 로그인 폼 표시
function showLogin() {
    document.getElementById('loginForm').style.display = 'flex';
    document.getElementById('registerForm').style.display = 'none';
    document.getElementById('header').style.display = 'none';
    document.getElementById('mainContent').style.display = 'none';
    
    // 폼 초기화
    document.getElementById('loginEmail').value = '';
    document.getElementById('loginPassword').value = '';
}

// 회원가입 폼 표시
function showRegister() {
    document.getElementById('loginForm').style.display = 'none';
    document.getElementById('registerForm').style.display = 'flex';
    document.getElementById('header').style.display = 'none';
    document.getElementById('mainContent').style.display = 'none';
    
    // 폼 초기화
    document.getElementById('registerEmail').value = '';
    document.getElementById('registerPassword').value = '';
    document.getElementById('registerNickname').value = '';
}

// 메인 화면 표시
function showMain(user) {
    document.getElementById('loginForm').style.display = 'none';
    document.getElementById('registerForm').style.display = 'none';
    document.getElementById('header').style.display = 'block';
    document.getElementById('mainContent').style.display = 'block';
    
    // 사용자 정보 표시
    document.getElementById('userNickname').textContent = user.nickname;
    
    // 책 목록 로드
    loadBooks();
}

// 로그인 처리
async function handleLogin(event) {
    event.preventDefault();
    
    const email = document.getElementById('loginEmail').value;
    const password = document.getElementById('loginPassword').value;
    
    if (!email || !password) {
        showError('이메일과 비밀번호를 입력해주세요.');
        return;
    }
    
    try {
        // 버튼 비활성화
        const submitBtn = event.target.querySelector('button[type="submit"]');
        submitBtn.disabled = true;
        submitBtn.textContent = '로그인 중...';
        
        const response = await authAPI.login({ email, password });
        
        showSuccess('로그인 성공!');
        showMain({
            id: response.id,
            email: response.email,
            nickname: response.nickname
        });
        
    } catch (error) {
        handleAPIError(error);
    } finally {
        // 버튼 복구
        const submitBtn = event.target.querySelector('button[type="submit"]');
        submitBtn.disabled = false;
        submitBtn.textContent = '로그인';
    }
}

// 회원가입 처리
async function handleRegister(event) {
    event.preventDefault();
    
    const email = document.getElementById('registerEmail').value;
    const password = document.getElementById('registerPassword').value;
    const nickname = document.getElementById('registerNickname').value;
    
    if (!email || !password || !nickname) {
        showError('모든 필드를 입력해주세요.');
        return;
    }
    
    if (password.length < 6) {
        showError('비밀번호는 최소 6자 이상이어야 합니다.');
        return;
    }
    
    try {
        await authAPI.register({ email, password, nickname });
            
        // 🎉 성공 메시지와 함께 즉시 전환
        showSuccess('🎉 회원가입 완료! 로그인해주세요.');
            
        // 즉시 로그인 화면으로 전환
        showLogin();
            
        // 가입한 이메일로 폼 미리 채우기
        const loginEmailInput = document.getElementById('loginEmail');
        loginEmailInput.value = email;
            
        // 📝 입력란 하이라이트 효과 (시각적 피드백)
        loginEmailInput.style.backgroundColor = '#f0fdf4'; // 연한 초록색
        setTimeout(() => {
            loginEmailInput.style.backgroundColor = '';
        }, 3000);
            
        // 비밀번호 입력란에 포커스
        document.getElementById('loginPassword').focus();
            
    } catch (error) {
        handleAPIError(error);
    }
}


// 로그아웃 처리
function logout() {
    if (confirm('로그아웃 하시겠습니까?')) {
        authAPI.logout();
        showLogin();
        showSuccess('로그아웃되었습니다.');
    }
}

// 이메일 유효성 검사
function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

// 비밀번호 강도 검사 (선택사항)
function checkPasswordStrength(password) {
    const minLength = 6;
    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasNumbers = /\d/.test(password);
    const hasSpecial = /[!@#$%^&*(),.?":{}|<>]/.test(password);
    
    let strength = 0;
    if (password.length >= minLength) strength++;
    if (hasUpperCase) strength++;
    if (hasLowerCase) strength++;
    if (hasNumbers) strength++;
    if (hasSpecial) strength++;
    
    return {
        score: strength,
        isValid: strength >= 2,
        message: strength < 2 ? '비밀번호가 너무 약합니다.' : '사용 가능한 비밀번호입니다.'
    };
}