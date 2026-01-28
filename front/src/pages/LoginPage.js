import React, { useState } from 'react';
import { Container, Form, Button, Row, Col, Alert, Spinner, InputGroup } from 'react-bootstrap';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LockFill, EnvelopeFill, ShieldCheck, FileText, CheckCircleFill, ArrowRight, ArrowLeft } from 'react-bootstrap-icons';

const LoginPage = () => {
    // [수정] 백엔드 LoginRequestDto의 필드명에 맞춰 username -> email로 변경
    const [credentials, setCredentials] = useState({ email: '', password: '' });
    const [error, setError] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const { login } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    const from = location.state?.from || '/';

    const handleChange = (e) => {
        const { name, value } = e.target;
        setCredentials(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setIsSubmitting(true);

        try {
            // [수정] AuthContext의 login 함수에 email을 전달
            await login(credentials.email, credentials.password);
            navigate(from, { replace: true });
        } catch (err) {
            console.error("로그인 실패:", err);
            setError('아이디 또는 비밀번호가 일치하지 않습니다.');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="login-wrapper" style={{ minHeight: '100vh', backgroundColor: '#f8f9fa', display: 'flex', alignItems: 'center' }}>
            <Container>
                {/*<div className="d-lg-none mb-3">*/}
                {/*    <Button variant="link" className="text-dark p-0 text-decoration-none d-flex align-items-center" onClick={() => navigate(-1)}>*/}
                {/*        <ArrowLeft className="me-2" /> 뒤로 돌아가기*/}
                {/*    </Button>*/}
                {/*</div>*/}

                <Row className="justify-content-center shadow-lg overflow-hidden border-0" style={{ borderRadius: '30px', backgroundColor: '#fff' }}>
                    {/* 왼쪽 브랜드 섹션 */}
                    <Col lg={6} className="d-none d-lg-flex flex-column justify-content-center p-5 text-white"
                         style={{ background: 'linear-gradient(135deg, #0d6efd 0%, #0043a8 100%)' }}>
                        <div className="mb-5" onClick={() => navigate('/jobs')} style={{ cursor: 'pointer', display: 'inline-block' }}>
                            <h2 className="fw-bold d-flex align-items-center mb-0">
                                <FileText className="me-2" /> ATS RECRUIT
                            </h2>
                        </div>
                        <h1 className="display-6 fw-bold mb-4" style={{ lineHeight: '1.3' }}>
                            최적의 인재를 찾는<br />가장 스마트한 여정
                        </h1>
                        <ul className="list-unstyled mb-5">
                            <li className="mb-3 d-flex align-items-center">
                                <CheckCircleFill className="me-3 text-info" /> <span>정밀한 공고 필터링 및 관리</span>
                            </li>
                            <li className="mb-3 d-flex align-items-center">
                                <CheckCircleFill className="me-3 text-info" /> <span>실시간 지원자 파이프라인 대시보드</span>
                            </li>
                            <li className="mb-3 d-flex align-items-center">
                                <CheckCircleFill className="me-3 text-info" /> <span>Oracle 23ai 기반 데이터 보안</span>
                            </li>
                        </ul>
                    </Col>

                    {/* 오른쪽 로그인 폼 섹션 */}
                    <Col lg={6} className="p-5 position-relative">
                        <div className="position-absolute d-none d-lg-block" style={{ top: '30px', right: '30px' }}>
                            <Button variant="outline-light" className="text-muted border-0 hover-primary" onClick={() => navigate('/jobs')} style={{ fontSize: '0.9rem' }}>
                                <ArrowLeft className="me-2" /> 메인으로 이동
                            </Button>
                        </div>

                        <div className="login-form-container mx-auto" style={{ maxWidth: '400px', marginTop: '20px' }}>
                            <div className="mb-5 text-start">
                                <h3 className="fw-bold text-dark mb-2">반갑습니다!</h3>
                                <p className="text-muted">계정 정보를 입력하여 시스템을 시작하세요.</p>
                            </div>

                            {error && (
                                <Alert variant="danger" className="py-2 small border-0 mb-4" style={{ borderRadius: '12px' }}>
                                    <ShieldCheck className="me-2" /> {error}
                                </Alert>
                            )}

                            <Form onSubmit={handleSubmit}>
                                <Form.Group className="mb-4">
                                    <Form.Label className="small fw-bold text-dark ms-1 mb-1">Email</Form.Label>
                                    <InputGroup className="custom-input-group shadow-sm">
                                        <InputGroup.Text className="bg-white border-end-0 ps-3 py-3">
                                            {/* 아이콘 변경: Person -> Envelope */}
                                            <EnvelopeFill className="text-primary" />
                                        </InputGroup.Text>
                                        <Form.Control
                                            name="email" // [수정] username -> email
                                            type="email"
                                            className="border-start-0 py-3 shadow-none"
                                            placeholder="이메일을 입력하세요"
                                            value={credentials.email}
                                            onChange={handleChange}
                                            required
                                            style={{ borderRadius: '0 12px 12px 0' }}
                                        />
                                    </InputGroup>
                                </Form.Group>

                                <Form.Group className="mb-4">
                                    <div className="d-flex justify-content-between align-items-center mb-1">
                                        <Form.Label className="small fw-bold text-dark ms-1 mb-0">Password</Form.Label>
                                        <span className="text-primary small cursor-pointer fw-medium" onClick={() => navigate('/reset-password')}>
                                            비밀번호를 잊으셨나요?
                                        </span>
                                    </div>
                                    <InputGroup className="custom-input-group shadow-sm">
                                        <InputGroup.Text className="bg-white border-end-0 ps-3 py-3">
                                            <LockFill className="text-primary" />
                                        </InputGroup.Text>
                                        <Form.Control
                                            name="password"
                                            type="password"
                                            className="border-start-0 py-3 shadow-none"
                                            placeholder="비밀번호를 입력하세요"
                                            value={credentials.password}
                                            onChange={handleChange}
                                            required
                                            style={{ borderRadius: '0 12px 12px 0' }}
                                        />
                                    </InputGroup>
                                </Form.Group>

                                <Button variant="primary" type="submit" className="w-100 py-3 fw-bold rounded-pill shadow mb-4 d-flex align-items-center justify-content-center" disabled={isSubmitting}>
                                    {isSubmitting ? <Spinner animation="border" size="sm" /> : <>로그인 </>}
                                </Button>
                            </Form>

                            <div className="text-center mt-5">
                                <p className="text-muted small">
                                    처음이신가요?
                                    <Button variant="link" className="fw-bold text-primary text-decoration-none ms-2" onClick={() => navigate('/signup')}>
                                        회원가입
                                    </Button>
                                </p>
                            </div>
                        </div>
                    </Col>
                </Row>
            </Container>

            <style>{`
                .custom-input-group { border-radius: 12px; overflow: hidden; }
                .custom-input-group .input-group-text, .custom-input-group .form-control { border-color: #e9ecef; }
                .custom-input-group:focus-within { box-shadow: 0 0 0 3px rgba(13, 110, 253, 0.15) !important; }
                .btn-primary:hover { transform: translateY(-2px); box-shadow: 0 8px 15px rgba(13, 110, 253, 0.3) !important; }
                .hover-primary:hover { color: #0d6efd !important; background-color: transparent !important; }
                .cursor-pointer { cursor: pointer; }
            `}</style>
        </div>
    );
};

export default LoginPage;