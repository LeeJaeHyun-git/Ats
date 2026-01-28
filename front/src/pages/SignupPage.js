import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Form, Button, InputGroup, Alert, Spinner } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import {PersonAdd, Building, ArrowRight, PlusLg, ListUl, Briefcase, ArrowLeft} from 'react-bootstrap-icons';
import api from '../api/axios';

const SignupPage = () => {
    const navigate = useNavigate();

    // [설정] 기본 상태: Role 선택 추가
    const [formData, setFormData] = useState({
        email: '',
        password: '',
        confirmPassword: '', // 프론트엔드 검증용
        name: '',
        companyId: '',
        newCompanyName: '',
        role: 'ROLE_RECRUITER' // 기본값
    });

    const [companies, setCompanies] = useState([]);
    const [isNewCompany, setIsNewCompany] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    // 초기 기업 목록 로딩
    useEffect(() => {
        api.get('/api/companies')
            .then(res => setCompanies(res.data))
            .catch(err => console.error("기업 목록 로딩 실패", err));
    }, []);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        // 1. 비밀번호 일치 확인
        if (formData.password !== formData.confirmPassword) {
            setError("비밀번호가 일치하지 않습니다.");
            return;
        }

        setLoading(true);

        try {
            let finalCompanyId = formData.companyId;

            // 2. 신규 기업 등록 프로세스 (CompanyController 연동)
            if (isNewCompany) {
                if (!formData.newCompanyName.trim()) {
                    throw new Error("등록할 기업명을 입력해주세요.");
                }
                const companyRes = await api.post('/api/companies', { name: formData.newCompanyName });
                finalCompanyId = companyRes.data; // 생성된 ID 확보
            } else {
                if (!finalCompanyId) {
                    throw new Error("소속 기업을 선택해주세요.");
                }
            }

            // 3. 회원가입 요청 (AuthController 연동)
            // SignupRequestDto: email, password, name, companyId, role
            await api.post('/api/auth/signup', {
                email: formData.email,
                password: formData.password,
                name: formData.name,
                companyId: finalCompanyId,
                role: formData.role
            });

            alert("회원가입이 완료되었습니다! 로그인 페이지로 이동합니다.");
            navigate('/login');

        } catch (err) {
            const msg = err.response?.data?.message || err.message || "가입 중 오류가 발생했습니다.";
            setError(msg);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Container className="py-5" style={{ minHeight: '100vh', display: 'flex', alignItems: 'center' }}>
            <Row className="justify-content-center w-100">
                <Col md={8} lg={6}>
                    <Card className="border-0 shadow-lg p-4" style={{ borderRadius: '25px' }}>
                        <div className="position-absolute d-none d-lg-block" style={{ top: '30px', right: '30px' }}>
                            <Button variant="outline-light" className="text-muted border-0 hover-primary" onClick={() => navigate('/jobs')} style={{ fontSize: '0.9rem' }}>
                                <ArrowLeft className="me-2" /> 메인으로 이동
                            </Button>
                        </div>
                        <div className="text-center mb-4">
                            <PersonAdd size={40} className="text-primary mb-2" />
                            <h3 className="fw-bold">계정 생성</h3>
                            <p className="text-muted">ATS 시스템 사용을 위한 정보를 입력하세요.</p>
                        </div>

                        {error && <Alert variant="danger" className="py-2 small text-center">{error}</Alert>}

                        <Form onSubmit={handleSubmit}>
                            {/* 성함 */}
                            <Form.Group className="mb-3">
                                <Form.Label className="small fw-bold">성함</Form.Label>
                                <Form.Control
                                    name="name"
                                    placeholder="실명을 입력하세요"
                                    required
                                    value={formData.name}
                                    onChange={handleChange}
                                />
                            </Form.Group>

                            {/* 이메일 */}
                            <Form.Group className="mb-3">
                                <Form.Label className="small fw-bold">이메일</Form.Label>
                                <Form.Control
                                    name="email"
                                    type="email"
                                    placeholder="example@company.com"
                                    required
                                    value={formData.email}
                                    onChange={handleChange}
                                />
                            </Form.Group>

                            {/* 직무(권한) 선택 - 백엔드 Enum/Role과 매핑 */}
                            <Form.Group className="mb-3">
                                <Form.Label className="small fw-bold">직무 역할</Form.Label>
                                <InputGroup>
                                    <InputGroup.Text className="bg-white"><Briefcase className="text-primary"/></InputGroup.Text>
                                    <Form.Select name="role" value={formData.role} onChange={handleChange}>
                                        <option value="ROLE_RECRUITER">채용 담당자</option>
                                        <option value="ROLE_INTERVIEWER">면접관</option>
                                        <option value="ROLE_MANAGER">현업 매니저</option>
                                    </Form.Select>
                                </InputGroup>
                            </Form.Group>

                            {/* 기업 선택/입력 섹션 */}
                            <Form.Group className="mb-4">
                                <div className="d-flex justify-content-between align-items-center mb-2">
                                    <Form.Label className="small fw-bold mb-0">소속 기업</Form.Label>
                                    <Button
                                        variant="link"
                                        className="p-0 text-decoration-none small fw-semibold"
                                        onClick={() => {
                                            setIsNewCompany(!isNewCompany);
                                            setFormData(prev => ({...prev, companyId: '', newCompanyName: ''}));
                                        }}
                                    >
                                        {isNewCompany ? <><ListUl /> 목록에서 선택하기</> : <><PlusLg /> 기업 신규 등록하기</>}
                                    </Button>
                                </div>

                                {isNewCompany ? (
                                    <InputGroup className="shadow-sm">
                                        <InputGroup.Text className="bg-white"><Building className="text-primary"/></InputGroup.Text>
                                        <Form.Control
                                            name="newCompanyName"
                                            placeholder="등록하실 기업명을 입력하세요"
                                            required
                                            value={formData.newCompanyName}
                                            onChange={handleChange}
                                        />
                                    </InputGroup>
                                ) : (
                                    <InputGroup className="shadow-sm">
                                        <InputGroup.Text className="bg-white"><Building className="text-primary"/></InputGroup.Text>
                                        <Form.Select
                                            name="companyId"
                                            required
                                            value={formData.companyId}
                                            onChange={handleChange}
                                        >
                                            <option value="">소속 기업을 선택하세요</option>
                                            {companies.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                                        </Form.Select>
                                    </InputGroup>
                                )}
                            </Form.Group>

                            {/* 비밀번호 */}
                            <Row className="mb-4">
                                <Col sm={6}>
                                    <Form.Group>
                                        <Form.Label className="small fw-bold">비밀번호</Form.Label>
                                        <Form.Control name="password" type="password" required onChange={handleChange} />
                                    </Form.Group>
                                </Col>
                                <Col sm={6}>
                                    <Form.Group>
                                        <Form.Label className="small fw-bold">비밀번호 확인</Form.Label>
                                        <Form.Control name="confirmPassword" type="password" required onChange={handleChange} isInvalid={formData.password && formData.confirmPassword && formData.password !== formData.confirmPassword}/>
                                    </Form.Group>
                                </Col>
                            </Row>

                            <Button variant="primary" type="submit" className="w-100 py-3 rounded-pill fw-bold shadow-sm" disabled={loading}>
                                {loading ? <Spinner size="sm" animation="border"/> : <>회원가입 완료 <ArrowRight/></>}
                            </Button>

                            <div className="text-center mt-3">
                                <Button variant="link" className="text-decoration-none text-muted small" onClick={() => navigate('/login')}>
                                    이미 계정이 있으신가요? 로그인
                                </Button>
                            </div>
                        </Form>
                    </Card>
                </Col>
            </Row>
        </Container>
    );
};

export default SignupPage;