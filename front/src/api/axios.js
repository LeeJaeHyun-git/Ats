import axios from 'axios';

const instance = axios.create({
    baseURL: 'http://localhost:8080',
    withCredentials: true, // 세션 쿠키(JSESSIONID) 공유를 위해 필수
    headers: {
        'Content-Type': 'application/json',
    },
});

// [수정] 백엔드에서 CSRF를 disable 했으므로 복잡한 인터셉터 로직 제거
// 단순 에러 처리만 남겨둡니다.
instance.interceptors.response.use(
    (response) => response,
    (error) => {
        // 필요 시 여기서 401 에러 공통 처리 가능 (예: 로그인 페이지로 강제 이동)
        return Promise.reject(error);
    }
);

export default instance;