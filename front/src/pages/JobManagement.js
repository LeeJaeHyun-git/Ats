import React, { useState, useEffect, useCallback } from 'react';
import { Container, Table, Button, Badge, Card, Spinner, Dropdown, Form, InputGroup, Row, Col, Toast, ToastContainer } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import {
    PlusCircle, PencilSquare, Trash, Eye, ThreeDotsVertical,
    Search, Building, ExclamationCircle, ChevronLeft, FunnelFill
} from 'react-bootstrap-icons';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';

const JobManagement = () => {
    const navigate = useNavigate();
    const { user, loading: authLoading } = useAuth();

    const [jobs, setJobs] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('ALL'); // [추가] 상태 필터
    const [error, setError] = useState(null);

    // [추가] UX 개선: Toast 알림 상태
    const [showToast, setShowToast] = useState(false);
    const [toastMsg, setToastMsg] = useState('');

    // 1. 공고 목록 불러오기
    const fetchCompanyJobs = useCallback(async () => {
        if (authLoading) return;
        if (!user || !user.companyId) {
            setError("기업 회원 정보가 확인되지 않습니다.");
            setIsLoading(false);
            return;
        }

        setIsLoading(true);
        try {
            // [UX 보완] 공고가 많지 않다면 size를 넉넉히 잡아 클라이언트 검색이 동작하게 함
            // 이상적인 방법은 백엔드에 ?title=검색어 파라미터를 추가하는 것입니다.
            const response = await api.get(`/api/jobs/company/${user.companyId}`, {
                params: { page: 0, size: 100 }
            });
            setJobs(response.data.content || []);
        } catch (err) {
            setError("데이터를 불러오지 못했습니다.");
        } finally {
            setIsLoading(false);
        }
    }, [user, authLoading]);

    useEffect(() => {
        fetchCompanyJobs();
    }, [fetchCompanyJobs]);

    // 알림 표시 헬퍼
    const showNotification = (msg) => {
        setToastMsg(msg);
        setShowToast(true);
    };

    // 2. 상태 변경
    const handleStatusChange = async (jobId, newStatus) => {
        try {
            await api.put(`/api/jobs/${jobId}/status`, null, { params: { status: newStatus } });
            setJobs(prev => prev.map(job =>
                job.id === jobId ? { ...job, status: newStatus } : job
            ));
            showNotification(`상태가 '${newStatus}'(으)로 변경되었습니다.`); // [UX] Toast 사용
        } catch (err) {
            alert("상태 변경 실패"); // 치명적 오류만 alert
        }
    };

    // 3. 삭제
    const handleDelete = async (jobId) => {
        if (!window.confirm("정말 삭제하시겠습니까? 복구할 수 없습니다.")) return;
        try {
            await api.delete(`/api/jobs/${jobId}`);
            setJobs(prev => prev.filter(j => j.id !== jobId));
            showNotification("공고가 삭제되었습니다.");
        } catch (err) {
            alert("삭제 실패: 지원자가 있는 공고는 삭제할 수 없습니다.");
        }
    };

    // [로직] 검색 + 상태 필터링 동시 적용
    const filteredJobs = jobs.filter(job => {
        const matchesSearch = job.title.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesStatus = statusFilter === 'ALL' || job.status === statusFilter;
        return matchesSearch && matchesStatus;
    });

    // 뱃지 스타일
    const getStatusBadge = (status) => {
        const config = {
            'OPEN': { variant: 'success', text: '채용중' },
            'CLOSED': { variant: 'secondary', text: '마감' },
            'DRAFT': { variant: 'warning', text: '임시저장' }
        };
        const curr = config[status] || { variant: 'light', text: status };
        return <Badge bg={curr.variant} className="rounded-pill px-3 fw-normal">{curr.text}</Badge>;
    };

    if (authLoading) return <div className="text-center py-5"><Spinner animation="border" variant="primary"/></div>;
    if (error) return <Container className="py-5 text-center"><ExclamationCircle size={40} className="text-warning mb-3"/><p>{error}</p></Container>;

    return (
        <Container className="py-5 position-relative">
            {/* [UX] Toast 메시지 컨테이너 (우측 상단) */}
            <ToastContainer position="top-end" className="p-3" style={{ zIndex: 1050 }}>
                <Toast onClose={() => setShowToast(false)} show={showToast} delay={3000} autohide bg="dark">
                    <Toast.Body className="text-white">{toastMsg}</Toast.Body>
                </Toast>
            </ToastContainer>

            <div className="mb-4">
                <Button variant="link" className="text-secondary text-decoration-none p-0 fw-bold d-flex align-items-center" onClick={() => navigate("/")}>
                    <ChevronLeft className="me-1" /> 메인으로
                </Button>
            </div>

            <div className="d-flex flex-column flex-md-row justify-content-between align-items-end mb-4 gap-3">
                <div>
                    <h2 className="fw-bold mb-1">채용 공고 관리</h2>
                    <p className="text-muted mb-0"><Building className="me-1"/> {user?.companyName}</p>
                </div>
                <Button variant="primary" onClick={() => navigate('/jobs/new')} className="rounded-pill px-4 shadow-sm fw-bold">
                    <PlusCircle className="me-2" /> 신규 등록
                </Button>
            </div>

            <Card className="border-0 shadow-sm rounded-4 overflow-hidden">
                <Card.Header className="bg-white py-3">
                    <Row className="g-2">
                        {/* 검색창 */}
                        <Col md={6} lg={5}>
                            <InputGroup>
                                <InputGroup.Text className="bg-light border-end-0 text-muted ps-3"><Search /></InputGroup.Text>
                                <Form.Control
                                    className="bg-light border-start-0 shadow-none"
                                    placeholder="공고 제목 검색..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                            </InputGroup>
                        </Col>
                        {/* [추가] 상태 필터 드롭다운 */}
                        <Col md={3} lg={2}>
                            <Form.Select
                                className="bg-light shadow-none cursor-pointer"
                                value={statusFilter}
                                onChange={(e) => setStatusFilter(e.target.value)}
                            >
                                <option value="ALL">전체 상태</option>
                                <option value="OPEN">채용중</option>
                                <option value="DRAFT">임시저장</option>
                                <option value="CLOSED">마감</option>
                            </Form.Select>
                        </Col>
                    </Row>
                </Card.Header>

                <div className="table-responsive">
                    <Table hover className="align-middle mb-0" style={{ minWidth: '800px' }}>
                        <thead className="bg-light text-secondary small text-uppercase">
                        <tr>
                            <th className="ps-4 py-3" style={{ width: '40%' }}>공고명</th>
                            <th style={{ width: '12%' }}>상태</th>
                            <th style={{ width: '15%' }}>형태</th>
                            <th style={{ width: '15%' }}>등록일</th>
                            <th className="text-center">관리</th>
                        </tr>
                        </thead>
                        <tbody>
                        {isLoading ? (
                            <tr><td colSpan="5" className="text-center py-5"><Spinner size="sm"/></td></tr>
                        ) : filteredJobs.length > 0 ? (
                            filteredJobs.map((job) => (
                                <tr key={job.id}>
                                    <td className="ps-4 py-3 cursor-pointer" onClick={() => navigate(`/jobs/${job.id}`)}>
                                        <div className="fw-bold text-dark mb-1 text-decoration-none">{job.title}</div>
                                        <small className="text-muted">{job.categoryName}</small>
                                    </td>
                                    <td>{getStatusBadge(job.status)}</td>
                                    <td><span className="text-dark small">{job.employmentType}</span></td>
                                    <td className="text-muted small">
                                        {job.createdAt ? new Date(job.createdAt).toLocaleDateString() : '-'}
                                    </td>
                                    <td className="text-center">
                                        <Dropdown align="end">
                                            <Dropdown.Toggle variant="link" className="text-secondary p-0 no-caret">
                                                <ThreeDotsVertical size={20} />
                                            </Dropdown.Toggle>
                                            <Dropdown.Menu className="shadow border-0 rounded-3">
                                                <Dropdown.Item onClick={() => navigate(`/jobs/${job.id}`)}><Eye className="me-2"/>보기</Dropdown.Item>
                                                <Dropdown.Item onClick={() => navigate(`/jobs/edit/${job.id}`)}><PencilSquare className="me-2"/>수정</Dropdown.Item>
                                                <Dropdown.Divider />
                                                {job.status !== 'OPEN' && <Dropdown.Item onClick={() => handleStatusChange(job.id, 'OPEN')}>채용 시작</Dropdown.Item>}
                                                {job.status !== 'CLOSED' && <Dropdown.Item onClick={() => handleStatusChange(job.id, 'CLOSED')}>마감 처리</Dropdown.Item>}
                                                <Dropdown.Divider />
                                                <Dropdown.Item onClick={() => handleDelete(job.id)} className="text-danger"><Trash className="me-2"/>삭제</Dropdown.Item>
                                            </Dropdown.Menu>
                                        </Dropdown>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan="5" className="text-center py-5 text-muted">
                                    검색 결과가 없습니다.
                                </td>
                            </tr>
                        )}
                        </tbody>
                    </Table>
                    <style>{`
                .cursor-pointer { cursor: pointer; }
            `}</style>
                </div>
            </Card>
        </Container>
    );
};

export default JobManagement;