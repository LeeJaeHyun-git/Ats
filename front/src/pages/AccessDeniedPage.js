import React from 'react';
import { Container, Button, Card } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { ShieldLockFill, ArrowLeft } from 'react-bootstrap-icons';

const AccessDeniedPage = () => {
    const navigate = useNavigate();

    return (
        <Container className="d-flex justify-content-center align-items-center vh-100">
            <Card className="text-center shadow-lg border-0 p-5" style={{ maxWidth: '500px', borderRadius: '20px' }}>
                <Card.Body>
                    <div className="mb-4">
                        <ShieldLockFill className="text-danger" size={80} />
                    </div>
                    <h2 className="fw-bold mb-3 text-dark">접근 권한이 없습니다</h2>
                    <p className="text-muted mb-4">
                        해당 페이지를 볼 수 있는 권한이 부족합니다.<br />
                        관리자에게 문의하거나 계정을 확인해 주세요.
                    </p>
                    <div className="d-grid gap-2 col-8 mx-auto">
                        <Button
                            variant="primary"
                            className="py-2 rounded-pill fw-bold"
                            onClick={() => navigate('/', { replace: true })}
                        >
                            <ArrowLeft className="me-2" />
                            메인으로 돌아가기
                        </Button>
                        <Button
                            variant="outline-secondary"
                            className="py-2 rounded-pill"
                            onClick={() => navigate(-1)}
                        >
                            이전 페이지
                        </Button>
                    </div>
                </Card.Body>
            </Card>
        </Container>
    );
};

export default AccessDeniedPage;