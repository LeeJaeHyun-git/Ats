import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import api from '../api/axios';
import { useNavigate } from "react-router-dom";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate(); // [주의] AuthProvider는 반드시 <BrowserRouter> 안에 위치해야 함

    // 1. [사용자 정보 조회] 새로고침 시 세션 유지를 위해 실행
    const checkAuth = useCallback(async () => {
        try {
            // 백엔드: AuthController.getCurrentUser() -> /api/auth/me
            const res = await api.get('/api/auth/me');
            setUser(res.data); // UserResponseDto (id, name, email, role 등)
        } catch (err) {
            // 401 Unauthorized or Network Error
            setUser(null);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        checkAuth();
    }, [checkAuth]);

    // 2. [로그인]
    const login = async (email, password) => {
        try {
            // 백엔드: AuthController.login() -> /api/auth/login
            const loginRes = await api.post('/api/auth/login', { email, password });

            // 백엔드는 성공 시 UserResponseDto를 반환
            if (loginRes.data) {
                setUser(loginRes.data);
                return loginRes.data;
            }
        } catch (error) {
            setUser(null);
            throw error; // 컴포넌트(LoginPage)에서 에러 메시지를 띄울 수 있게 전파
        }
    };

    // 3. [로그아웃]
    const logout = async () => {
        try {
            // 백엔드: SecurityConfig 로그아웃 설정 -> /api/auth/logout
            await api.post('/api/auth/logout');
        } catch (error) {
            console.error("로그아웃 요청 실패(세션 만료 등):", error);
        } finally {
            setUser(null);
            navigate('/login'); // 로그아웃 후 로그인 페이지로 이동
        }
    };

    // 로딩 중일 때는 아무것도 렌더링하지 않거나 스피너를 보여줌
    // (인증 상태가 확인되지 않은 채로 보호된 페이지가 노출되는 것을 방지)
    if (loading) {
        return <div className="text-center mt-5">Loading...</div>;
    }

    return (
        <AuthContext.Provider value={{ user, setUser, login, logout, loading }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);