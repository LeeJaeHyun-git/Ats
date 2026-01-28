import React, { useState } from 'react';
import { Container, Row, Col, Card, Form, Button, InputGroup, Alert, Spinner } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import {
    ShieldLock,
    ArrowLeft,
    EnvelopeAt,
    PersonCheck,
    Building,
    CheckCircleFill,
    KeyFill,
    ShieldCheck
} from 'react-bootstrap-icons';
import api from '../api/axios';

const ResetPasswordPage = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState({ type: '', text: '' });

    // UserUpdateRequestDto 구조에 맞춘 상태 관리
    const [formData, setFormData] = useState({
        companyName: '',
        name: '',
        email: '',
        password: '',
        confirmPassword: '' // [추가] 프론트엔드 검증용 필드
    });

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setMessage({ type: '', text: '' });

        // [추가] 비밀번호 일치 확인 로직
        if (formData.password !== formData.confirmPassword) {
            setMessage({ type: 'danger', text: '입력한 비밀번호가 서로 일치하지 않습니다.' });
            return;
        }

        setLoading(true);

        try {
            // 백엔드 전송 시에는 confirmPassword를 제외하고 DTO에 맞는 데이터만 전송
            const requestData = {
                companyName: formData.companyName,
                name: formData.name,
                email: formData.email,
                password: formData.password
            };

            // 백엔드의 reset-password 엔드포인트 호출
            const response = await api.post('/api/auth/reset-password', requestData);

            setMessage({
                type: 'success',
                text: response.data.message || '비밀번호가 성공적으로 변경되었습니다. 잠시 후 로그인 페이지로 이동합니다.'
            });

            // 3초 후 로그인 페이지로 자동 이동
            setTimeout(() => navigate('/login'), 3000);

        } catch (err) {
            const errorMsg = err.response?.data?.message || '입력하신 정보와 일치하는 계정을 찾을 수 없습니다.';
            setMessage({ type: 'danger', text: errorMsg });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="reset-wrapper" style={{ minHeight: '100vh', backgroundColor: '#f8f9fa', display: 'flex', alignItems: 'center' }}>
            <Container>
                <Row className="justify-content-center">
                    <Col md={8} lg={6} xl={5}>
                        <Card className="border-0 shadow-lg p-3 overflow-hidden" style={{ borderRadius: '30px' }}>
                            <Card.Body className="p-4">
                                <div className="mb-4">
                                    <button
                                        type="button"
                                        className="btn btn-link p-0 text-decoration-none text-secondary d-flex align-items-center fw-bold small"
                                        onClick={() => navigate(-1)} // navigate(-1)을 쓰면 로그인에서 왔든 마이페이지에서 왔든 이전 페이지로 이동합니다.
                                    >
                                        <ArrowLeft className="me-2" /> 뒤로 가기
                                    </button>
                                </div>
                                <div className="mb-4 text-start">
                                    <div className="d-flex align-items-center mb-2">
                                        <div className="bg-primary bg-opacity-10 p-2 rounded-3 me-3">
                                            <ShieldLock className="text-primary" size={24} />
                                        </div>
                                        <h3 className="fw-bold text-dark mb-0">비밀번호 재설정</h3>
                                    </div>
                                    <p className="text-muted small">본인 확인을 위해 가입 당시의 정보를 입력해주세요.</p>
                                </div>

                                {message.text && (
                                    <Alert variant={message.type} className="py-3 border-0 rounded-4 mb-4 small animate__animated animate__fadeIn">
                                        {message.type === 'success' ? <CheckCircleFill className="me-2"/> : <ShieldCheck className="me-2"/>}
                                        {message.text}
                                    </Alert>
                                )}

                                <Form onSubmit={handleSubmit}>
                                    {/* 기업명 확인 */}
                                    <Form.Group className="mb-3">
                                        <Form.Label className="small fw-bold ms-1 text-dark">소속 기업명</Form.Label>
                                        <InputGroup className="custom-input-group shadow-sm">
                                            <InputGroup.Text className="bg-white border-end-0 ps-3">
                                                <Building className="text-primary" />
                                            </InputGroup.Text>
                                            <Form.Control
                                                name="companyName"
                                                placeholder="가입 시 등록한 기업명"
                                                required
                                                onChange={handleChange}
                                                className="border-start-0 py-2 shadow-none"
                                            />
                                        </InputGroup>
                                    </Form.Group>

                                    {/* 이름 확인 */}
                                    <Form.Group className="mb-3">
                                        <Form.Label className="small fw-bold ms-1 text-dark">성함</Form.Label>
                                        <InputGroup className="custom-input-group shadow-sm">
                                            <InputGroup.Text className="bg-white border-end-0 ps-3">
                                                <PersonCheck className="text-primary" size={20} />
                                            </InputGroup.Text>
                                            <Form.Control
                                                name="name"
                                                placeholder="가입자 실명"
                                                required
                                                onChange={handleChange}
                                                className="border-start-0 py-2 shadow-none"
                                            />
                                        </InputGroup>
                                    </Form.Group>

                                    {/* 이메일 확인 */}
                                    <Form.Group className="mb-3">
                                        <Form.Label className="small fw-bold ms-1 text-dark">가입 이메일</Form.Label>
                                        <InputGroup className="custom-input-group shadow-sm">
                                            <InputGroup.Text className="bg-white border-end-0 ps-3">
                                                <EnvelopeAt className="text-primary" />
                                            </InputGroup.Text>
                                            <Form.Control
                                                name="email"
                                                type="email"
                                                placeholder="example@email.com"
                                                required
                                                onChange={handleChange}
                                                className="border-start-0 py-2 shadow-none"
                                            />
                                        </InputGroup>
                                    </Form.Group>

                                    <hr className="my-4 opacity-50" />

                                    {/* 새 비밀번호 입력 */}
                                    <Form.Group className="mb-3">
                                        <Form.Label className="small fw-bold ms-1 text-dark">새로운 비밀번호</Form.Label>
                                        <InputGroup className="custom-input-group shadow-sm">
                                            <InputGroup.Text className="bg-white border-end-0 ps-3">
                                                <KeyFill className="text-primary" />
                                            </InputGroup.Text>
                                            <Form.Control
                                                name="password"
                                                type="password"
                                                placeholder="새 비밀번호 입력"
                                                required
                                                onChange={handleChange}
                                                className="border-start-0 py-2 shadow-none"
                                            />
                                        </InputGroup>
                                    </Form.Group>

                                    {/* [추가] 비밀번호 확인 입력 */}
                                    <Form.Group className="mb-4">
                                        <Form.Label className="small fw-bold ms-1 text-dark">비밀번호 확인</Form.Label>
                                        <InputGroup className="custom-input-group shadow-sm">
                                            <InputGroup.Text className="bg-white border-end-0 ps-3">
                                                <ShieldCheck className="text-primary" />
                                            </InputGroup.Text>
                                            <Form.Control
                                                name="confirmPassword"
                                                type="password"
                                                placeholder="비밀번호 재입력"
                                                required
                                                onChange={handleChange}
                                                className="border-start-0 py-2 shadow-none"
                                                isInvalid={formData.password && formData.confirmPassword && formData.password !== formData.confirmPassword}
                                            />
                                        </InputGroup>
                                        {formData.password && formData.confirmPassword && formData.password !== formData.confirmPassword && (
                                            <Form.Text className="text-danger small ms-1">
                                                비밀번호가 일치하지 않습니다.
                                            </Form.Text>
                                        )}
                                        <Form.Text className="text-muted small ms-1 d-block mt-1">
                                            변경 즉시 새 비밀번호가 적용됩니다.
                                        </Form.Text>
                                    </Form.Group>

                                    <Button
                                        variant="primary"
                                        type="submit"
                                        className="w-100 py-3 fw-bold rounded-pill shadow-sm border-0"
                                        disabled={loading}
                                        style={{ transition: 'all 0.3s' }}
                                    >
                                        {loading ? <Spinner animation="border" size="sm" /> : '비밀번호 변경 및 저장'}
                                    </Button>
                                </Form>
                            </Card.Body>
                        </Card>
                    </Col>
                </Row>
            </Container>

            <style>{`
                .custom-input-group {
                    border-radius: 12px;
                    overflow: hidden;
                    border: 1px solid #e9ecef;
                }
                .custom-input-group .input-group-text {
                    border: none;
                }
                .custom-input-group .form-control {
                    border: none;
                }
                .custom-input-group:focus-within {
                    border-color: #0d6efd;
                    box-shadow: 0 0 0 3px rgba(13, 110, 253, 0.1) !important;
                }
                .btn-primary:hover {
                    transform: translateY(-2px);
                    box-shadow: 0 8px 15px rgba(13, 110, 253, 0.2) !important;
                }
            `}</style>
        </div>
    );
};

export default ResetPasswordPage;