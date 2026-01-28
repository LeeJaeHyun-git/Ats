import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
    PersonCircle,
    ShieldLockFill,
    PersonDashFill,
    BuildingFill,
    EnvelopeFill,
    ChevronRight,
    BriefcaseFill
} from 'react-bootstrap-icons';
import { Container, Row, Col, Card, Button, Badge, Spinner } from 'react-bootstrap';

const MyPage = () => {
    const { user, loading } = useAuth();
    const navigate = useNavigate();

    // 로딩 중 처리
    if (loading) {
        return (
            <div className="d-flex justify-content-center align-items-center min-vh-100">
                <Spinner animation="border" variant="primary" />
            </div>
        );
    }

    // 로그인하지 않은 경우 처리
    if (!user) {
        navigate('/login');
        return null;
    }

    return (
        <div className="d-flex min-vh-100 bg-light">
            {/* 사이드바 (기존 관리 페이지 테마 유지) */}
            <aside className="bg-dark text-white p-3 shadow-lg" style={{ width: '260px', flexShrink: 0 }}>
                <div className="d-flex align-items-center px-2 py-4 mb-4 border-bottom border-secondary cursor-pointer" onClick={() => navigate('/')}>
                    <BriefcaseFill className="text-primary me-2" size={30} />
                    <span className="fs-4 fw-bold">ATS Core</span>
                </div>
                <nav className="nav flex-column gap-2">
                    <div className="nav-link text-white active bg-primary rounded-3 d-flex align-items-center py-2 px-3">
                        <PersonCircle className="me-3" /> 마이페이지
                    </div>
                    <div
                        className="nav-link text-white rounded-3 d-flex align-items-center py-2 px-3 cursor-pointer hover-bg-secondary"
                        onClick={() => navigate('/jobs/manage')}
                    >
                        <BriefcaseFill className="me-3" /> 공고 관리
                    </div>
                    <div
                        className="nav-link text-white rounded-3 d-flex align-items-center py-2 px-3 cursor-pointer hover-bg-secondary"
                        onClick={() => navigate('/applicants')}
                    >
                        <BriefcaseFill className="me-3" /> 지원자 관리
                    </div>
                    <div
                        className="nav-link text-white rounded-3 d-flex align-items-center py-2 px-3 cursor-pointer hover-bg-secondary"
                        onClick={() => navigate('/pipeline')}
                    >
                        <BriefcaseFill className="me-3" /> 채용 파이프라인
                    </div>
                    <div
                        className="nav-link text-white rounded-3 d-flex align-items-center py-2 px-3 cursor-pointer hover-bg-secondary"
                        onClick={() => navigate('/feedback')}
                    >
                        <BriefcaseFill className="me-3" /> 평가 및 협업
                    </div>
                    <div
                        className="nav-link text-white rounded-3 d-flex align-items-center py-2 px-3 cursor-pointer hover-bg-secondary"
                        onClick={() => navigate('/dashboard')}
                    >
                        <BriefcaseFill className="me-3" /> 대시보드
                    </div>
                </nav>
            </aside>

            {/* 메인 콘텐츠 영역 */}
            <main className="flex-grow-1 p-5 overflow-auto">
                <header className="mb-5">
                    <h2 className="fw-bold text-dark mb-1">마이페이지</h2>
                    <p className="text-muted mb-0">계정 정보 확인 및 보안 설정을 관리합니다.</p>
                </header>

                <Row className="g-4">
                    {/* 내 정보 카드 */}
                    <Col lg={7}>
                        <Card className="border-0 shadow-sm rounded-4 p-4 mb-4">
                            <h5 className="fw-bold mb-4 text-primary border-bottom pb-2">기본 정보</h5>
                            <div className="d-flex align-items-center mb-4">
                                <div className="bg-primary bg-opacity-10 p-3 rounded-circle me-3">
                                    <PersonCircle size={40} className="text-primary" />
                                </div>
                                <div>
                                    <h4 className="fw-bold mb-0">{user.name}</h4>
                                    <div className="text-muted small">{user.email}</div>
                                </div>
                                <div className="ms-auto">
                                    {user.roles && Array.from(user.roles).map((role, idx) => (
                                        <Badge key={idx} bg="dark" className="ms-1 px-2 py-1">
                                            {role}
                                        </Badge>
                                    ))}
                                </div>
                            </div>

                            <Row className="g-3">
                                <Col sm={12}>
                                    <div className="p-3 bg-light rounded-3 d-flex align-items-center">
                                        <EnvelopeFill className="text-secondary me-3" />
                                        <div>
                                            <div className="small text-muted">이메일 계정</div>
                                            <div className="fw-bold">{user.email}</div>
                                        </div>
                                    </div>
                                </Col>
                                <Col sm={12}>
                                    <div className="p-3 bg-light rounded-3 d-flex align-items-center">
                                        <BuildingFill className="text-secondary me-3" />
                                        <div>
                                            <div className="small text-muted">소속 기업</div>
                                            <div className="fw-bold">{user.companyName || '정보 없음'}</div>
                                        </div>
                                    </div>
                                </Col>
                            </Row>
                        </Card>
                    </Col>

                    {/* 계정 관리 액션 카드 */}
                    <Col lg={5}>
                        <Card className="border-0 shadow-sm rounded-4 p-4">
                            <h5 className="fw-bold mb-4 text-dark border-bottom pb-2">보안 및 계정 설정</h5>

                            <div className="d-grid gap-3">
                                {/* 비밀번호 재설정 페이지 이동 */}
                                <Button
                                    variant="white"
                                    className="border p-3 rounded-3 d-flex align-items-center text-start hover-shadow-sm transition-all"
                                    onClick={() => navigate('/reset-password')}
                                >
                                    <div className="bg-info bg-opacity-10 p-2 rounded-3 me-3">
                                        <ShieldLockFill className="text-info" size={20} />
                                    </div>
                                    <div className="flex-grow-1">
                                        <div className="fw-bold text-dark">비밀번호 변경</div>
                                        <div className="small text-muted">보안을 위해 주기적인 변경을 권장합니다.</div>
                                    </div>
                                    <ChevronRight className="text-muted" />
                                </Button>

                                {/* 회원 탈퇴 페이지 이동 (미구현 상태) */}
                                <Button
                                    variant="white"
                                    className="border p-3 rounded-3 d-flex align-items-center text-start hover-shadow-sm transition-all"
                                    onClick={() => navigate("/withdraw")}
                                >
                                    <div className="bg-danger bg-opacity-10 p-2 rounded-3 me-3">
                                        <PersonDashFill className="text-danger" size={20} />
                                    </div>
                                    <div className="flex-grow-1">
                                        <div className="fw-bold text-dark">회원 탈퇴</div>
                                        <div className="small text-muted">계정 및 모든 데이터가 삭제됩니다.</div>
                                    </div>
                                    <ChevronRight className="text-muted" />
                                </Button>
                            </div>
                        </Card>
                    </Col>
                </Row>
            </main>

            <style>{`
                .cursor-pointer { cursor: pointer; }
                .hover-bg-secondary:hover { background-color: rgba(255, 255, 255, 0.1) !important; }
                .hover-shadow-sm:hover { box-shadow: 0 .125rem .25rem rgba(0,0,0,.075)!important; transform: translateY(-2px); }
                .transition-all { transition: all 0.2s ease-in-out; }
            `}</style>
        </div>
    );
};

export default MyPage;