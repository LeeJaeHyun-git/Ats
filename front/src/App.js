import React from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import 'bootstrap/dist/css/bootstrap.min.css';
import { Spinner } from 'react-bootstrap';

import MainPage from './pages/MainPage';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import JobPostPage from './pages/JobPostPage';
import JobDetail from './pages/JobDetail';
import JobManagement from './pages/JobManagement';
import ResetPasswordPage from './pages/ResetPasswordPage';
import MyPage from "./pages/MyPage";
import WithdrawPage from "./pages/WithdrawPage";
import Chatbot from "./components/Chatbot";
import AccessDeniedPage from "./pages/AccessDeniedPage";

/**
 * [권한 보호 컴포넌트]
 * 로그인 여부와 허용된 권한(Roles)을 체크하여 접근을 제어합니다.
 * @param {Object} props
 * @param {Array} props.allowedRoles - 접근 허용할 권한 목록 (예: ['ROLE_RECRUITER'])
 */
const ProtectedRoute = ({ children, allowedRoles }) => {
    const { user, loading } = useAuth();

    // 1. 인증 정보 로딩 중이면 스피너 표시 (리다이렉트 방지)
    if (loading) {
        return (
            <div className="d-flex justify-content-center align-items-center vh-100">
                <Spinner animation="border" variant="primary" />
            </div>
        );
    }

    // 2. 로그인하지 않은 경우 -> 로그인 페이지로 이동
    if (!user) {
        return <Navigate to="/login" replace />;
    }

    // 3. 권한 체크 (allowedRoles가 설정된 경우만)
    if (allowedRoles && allowedRoles.length > 0) {
        // user.roles는 배열 형태임 (UserResponseDto 참조)
        const hasAccess = user.roles && user.roles.some(role => allowedRoles.includes(role));

        if (!hasAccess) {
            // "/access-denied"로 이동
            return <Navigate to="/access-denied" replace />;
        }
    }

    // 4. 통과 시 해당 컴포넌트 렌더링
    return children;
};

const AppContent = () => {
    const location = useLocation();

    // 챗봇 표시 조건: 공고 작성/수정 페이지에서만 표시
    // const showChatbot =
    //     location.pathname.startsWith('/jobs/edit/') ||
    //     location.pathname === '/jobs/new' &&
    //     location.pathname !== '/access-denied';

    return (
        <>
            <Routes>
                {/* ========================== */}
                {/* 1. 공개 라우트 (누구나 접근) */}
                {/* ========================== */}
                <Route path="/" element={<MainPage />} />
                <Route path="/login" element={<LoginPage />} />
                <Route path="/signup" element={<SignupPage />} />
                <Route path="/jobs" element={<MainPage />} />
                <Route path="/jobs/:jobId" element={<JobDetail />} />
                <Route path="/reset-password" element={<ResetPasswordPage />} />

                {/* [2] 접근 권한 없음 페이지 라우트  */}
                <Route path="/access-denied" element={<AccessDeniedPage />} />

                {/* ========================== */}
                {/* 관리자 권한 라우트 (ROLE_ADMIN, ROLE_RECRUITER, ROLE_MANAGER, ROLE_INTERVIEWER) */}
                {/* ========================== */}
                <Route
                    path="/jobs/new"
                    element={
                        <ProtectedRoute allowedRoles={['ROLE_ADMIN', 'ROLE_RECRUITER']}>
                            <JobPostPage />
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/jobs/edit/:jobId"
                    element={
                        <ProtectedRoute allowedRoles={['ROLE_ADMIN', 'ROLE_RECRUITER']}>
                            <JobPostPage />
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/jobs/manage"
                    element={
                        <ProtectedRoute allowedRoles={['ROLE_ADMIN', 'ROLE_RECRUITER']}>
                            <JobManagement />
                        </ProtectedRoute>
                    }
                />

                {/* ========================== */}
                {/* 3. 인증된 사용자 라우트 (모든 로그인 유저) */}
                {/* ========================== */}
                <Route
                    path="/profile"
                    element={
                        <ProtectedRoute>
                            <MyPage />
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/withdraw"
                    element={
                        <ProtectedRoute>
                            <WithdrawPage />
                        </ProtectedRoute>
                    }
                />

                {/* 잘못된 경로 처리 */}
                <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>

            {/* 챗봇 컴포넌트 */}
            {/*{showChatbot && <Chatbot />}*/}
        </>
    );
};

const App = () => {
    return (
        <BrowserRouter>
            <AuthProvider>
                <AppContent />
            </AuthProvider>
        </BrowserRouter>
    );
};

export default App;