import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';
import { Container, Card, Form, Button, Alert } from 'react-bootstrap';
import { ExclamationTriangleFill, ArrowLeft } from 'react-bootstrap-icons';

const WithdrawPage = () => {
    const { logout } = useAuth();
    const navigate = useNavigate();
    const [confirmText, setConfirmText] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleWithdraw = async (e) => {
        e.preventDefault();

        if (confirmText !== '탈퇴합니다') {
            alert("확인 문구를 정확히 입력해주세요.");
            return;
        }

        if (!window.confirm("정말로 탈퇴하시겠습니까? 작성된 모든 정보가 영구 삭제됩니다.")) return;

        setIsSubmitting(true);
        try {
            // 수정된 엔드포인트 호출
            await api.delete('/api/users/me');
            alert("회원 탈퇴가 완료되었습니다. 이용해주셔서 감사합니다.");
            logout(); // 프론트엔드 로그인 상태 초기화 및 메인 이동
        } catch (err) {
            alert(err.response?.data?.message || "탈퇴 처리 중 오류가 발생했습니다.");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Container className="d-flex justify-content-center align-items-center min-vh-100">
            <Card style={{ width: '500px' }} className="border-0 shadow-lg rounded-4 overflow-hidden">
                <Card.Header className="bg-danger text-white text-center py-4">
                    <ExclamationTriangleFill size={40} className="mb-2" />
                    <h3 className="fw-bold mb-0">회원 탈퇴</h3>
                </Card.Header>
                <Card.Body className="p-4 p-md-5">
                    <Alert variant="warning" className="small border-0 mb-4">
                        <ul className="mb-0">
                            <li>탈퇴 시 모든 정보와 데이터, 권한이 즉시 삭제됩니다.</li>
                            <li>탈퇴 시 회원 전용 서비스를 이용할 수 없습니다.</li>
                            <li>삭제된 데이터는 복구할 수 없습니다.</li>
                        </ul>
                    </Alert>

                    <Form onSubmit={handleWithdraw}>
                        <Form.Group className="mb-4">
                            <Form.Label className="small fw-bold text-muted">탈퇴 확인 문구</Form.Label>
                            <Form.Control
                                placeholder="'탈퇴합니다'를 입력하세요"
                                value={confirmText}
                                onChange={(e) => setConfirmText(e.target.value)}
                                className="py-2"
                                required
                            />
                        </Form.Group>

                        <div className="d-grid gap-2">
                            <Button variant="danger" type="submit" className="py-2 fw-bold" disabled={isSubmitting}>
                                {isSubmitting ? "처리 중..." : "회원 탈퇴 확정"}
                            </Button>
                            <Button variant="link" className="text-decoration-none text-secondary" onClick={() => navigate(-1)}>
                                <ArrowLeft className="me-1" /> 취소하기
                            </Button>
                        </div>
                    </Form>
                </Card.Body>
            </Card>
        </Container>
    );
};

export default WithdrawPage;