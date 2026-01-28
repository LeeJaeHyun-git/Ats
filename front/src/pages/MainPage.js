import React, { useState, useEffect, useCallback } from 'react';
import { Container, Row, Col, Card, Button, Form, InputGroup, Pagination, Navbar, Nav, Badge, Spinner, Tab, Tabs, NavDropdown } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import {
    Search, GeoAlt, Clock, Building, PlusCircle,
    ChevronRight, Kanban, People, FileText, BarChart, PersonCircle, BoxArrowRight, XCircle
} from 'react-bootstrap-icons';
import api from '../api/axios'; // axios 설정 파일
import { useAuth } from '../context/AuthContext'; // AuthContext

const MainPage = () => {
    const navigate = useNavigate();
    const { user, loading: isAuthLoading, logout } = useAuth();

    // 1. 상태 관리
    const [jobs, setJobs] = useState([]);
    const [categories, setCategories] = useState([]); // CategoryResponseDto[]
    const [isLoading, setIsLoading] = useState(true);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);

    // 필터 상태
    const [searchTerm, setSearchTerm] = useState('');     // 입력 중인 검색어
    const [activeSearch, setActiveSearch] = useState(''); // 실제 검색에 적용된 검색어
    const [selectedParentCat, setSelectedParentCat] = useState(null);
    const [selectedSubCat, setSelectedSubCat] = useState(null);
    const [employmentType, setEmploymentType] = useState('전체');

    const itemsPerPage = 9; // 카드 UI 균형을 위해 3의 배수 추천

    // 2. 초기 데이터(카테고리) 로딩 - CategoryController 연동
    useEffect(() => {
        const fetchCategories = async () => {
            try {
                // CategoryResponseDto 리스트 반환 (children 포함)
                const res = await api.get('/api/categories');
                setCategories(res.data || []);
            } catch (err) {
                console.error("카테고리 로딩 실패", err);
            }
        };
        fetchCategories();
    }, []);

    // 3. 공고 데이터 불러오기 (QueryDSL 필터 통합) - JobController 연동
    const fetchJobs = useCallback(async () => {
        setIsLoading(true);
        try {
            // 하위 카테고리가 선택되었다면 하위 ID, 아니면 상위 ID 사용
            const categoryId = selectedSubCat || selectedParentCat;

            // GET /api/jobs/open
            const response = await api.get('/api/jobs/open', {
                params: {
                    page: currentPage - 1, // 백엔드 Pageable은 0부터 시작
                    size: itemsPerPage,
                    title: activeSearch || null, // 빈 문자열이면 null로 보내 동적 쿼리에서 무시되게 함
                    categoryId: categoryId || null,
                    employmentType: employmentType !== '전체' ? employmentType : null
                }
            });

            if (response.data) {
                setJobs(response.data.content || []); // JobResponseDto List
                setTotalPages(response.data.totalPages || 1);
            }
        } catch (err) {
            console.error("공고 로딩 실패:", err);
            setJobs([]);
        } finally {
            setIsLoading(false);
        }
    }, [currentPage, activeSearch, selectedParentCat, selectedSubCat, employmentType]);

    useEffect(() => {
        fetchJobs();
    }, [fetchJobs]);

    // [이벤트] 검색 핸들러
    const handleSearch = (e) => {
        e.preventDefault();
        setCurrentPage(1);
        setActiveSearch(searchTerm);
    };

    // [이벤트] 검색 초기화
    const clearSearch = () => {
        setSearchTerm('');
        setActiveSearch('');
        setCurrentPage(1);
    };

    // [이벤트] 메뉴 접근 제어 (로그인 필요 시 리다이렉트)
    const handleMenuClick = (path) => {
        if (!user) {
            if(window.confirm("로그인이 필요한 서비스입니다.\n로그인 페이지로 이동하시겠습니까?")) {
                navigate('/login');
            }
        } else {
            navigate(path);
        }
    };

    // [유틸] D-Day 계산기
    const getDDay = (deadline) => {
        if (!deadline) return { text: "상시채용", variant: "secondary" };

        const today = new Date();
        const end = new Date(deadline); // ISO String 자동 파싱

        // 시간차 무시하고 날짜만 비교
        today.setHours(0, 0, 0, 0);
        end.setHours(0, 0, 0, 0);

        const diffTime = end - today;
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        if (diffDays < 0) return { text: "마감됨", variant: "dark" };
        if (diffDays === 0) return { text: "오늘 마감", variant: "danger" };
        if (diffDays <= 3) return { text: `D-${diffDays}`, variant: "warning" }; // 임박
        return { text: `D-${diffDays}`, variant: "primary" }; // 여유
    };

    return (
        <div className="bg-light" style={{ minHeight: '100vh', paddingBottom: '50px' }}>
            {/* 1. 네비게이션 바 */}
            <Navbar bg="white" expand="lg" className="shadow-sm sticky-top py-2">
                <Container>
                    <Navbar.Brand onClick={() => navigate('/')} style={{ cursor: 'pointer', fontWeight: '900', color: '#0d6efd', fontSize: '1.5rem' }}>
                        <FileText className="me-2 mb-1" />ATS RECRUIT
                    </Navbar.Brand>
                    <Navbar.Toggle aria-controls="basic-navbar-nav" />
                    <Navbar.Collapse id="basic-navbar-nav">
                        <Nav className="me-auto ms-lg-4 gap-2">
                            {/* 주요 메뉴 (로그인 체크 적용) */}
                            <Nav.Link onClick={() => handleMenuClick('/jobs/manage')} className="fw-semibold text-dark"><PlusCircle className="me-1"/> 공고 관리</Nav.Link>
                            <Nav.Link onClick={() => handleMenuClick('/applicants')} className="fw-semibold text-dark"><People className="me-1"/> 지원자 관리</Nav.Link>
                            <Nav.Link onClick={() => handleMenuClick('/pipeline')} className="fw-semibold text-dark"><Kanban className="me-1"/> 채용 파이프라인</Nav.Link>
                            <Nav.Link onClick={() => handleMenuClick('/feedback')} className="fw-semibold text-dark"><BarChart className="me-1"/> 평가 및 협업</Nav.Link>
                            <Nav.Link onClick={() => handleMenuClick('/dashboard')} className="fw-semibold text-dark"><BarChart className="me-1"/> 대시보드</Nav.Link>
                        </Nav>

                        {/* 우측 사용자 메뉴 */}
                        <Nav className="align-items-center gap-2 mt-3 mt-lg-0">
                            {isAuthLoading ? (
                                <Spinner animation="border" size="sm" variant="primary" />
                            ) : user ? (
                                <NavDropdown
                                    title={
                                        <span className="d-inline-flex align-items-center bg-light border px-3 py-1 rounded-pill">
                                            <PersonCircle className="me-2 text-primary" size={20}/>
                                            <span className="fw-bold small text-dark">{user.name} 님</span>
                                        </span>
                                    }
                                    id="user-nav-dropdown"
                                    align="end"
                                >
                                    <NavDropdown.Header>
                                        <small className="text-muted">{user.companyName || '소속 없음'}</small>
                                    </NavDropdown.Header>
                                    <NavDropdown.Item onClick={() => navigate('/profile')}>마이페이지</NavDropdown.Item>
                                    <NavDropdown.Divider />
                                    <NavDropdown.Item onClick={logout} className="text-danger">
                                        <BoxArrowRight className="me-2"/> 로그아웃
                                    </NavDropdown.Item>
                                </NavDropdown>
                            ) : (
                                <>
                                    <Button variant="outline-primary" className="rounded-pill px-4 fw-bold btn-sm" onClick={() => navigate('/login')}>로그인</Button>
                                    <Button variant="primary" className="rounded-pill px-4 fw-bold btn-sm shadow-sm" onClick={() => navigate('/signup')}>회원가입</Button>
                                </>
                            )}
                        </Nav>
                    </Navbar.Collapse>
                </Container>
            </Navbar>

            {/* 2. 히어로 섹션 (검색 및 카테고리) */}
            <div className="bg-white border-bottom pb-5 pt-5 mb-5">
                <Container>
                    <Row className="justify-content-center text-center">
                        <Col lg={8}>
                            <h2 className="fw-extra-bold mb-3 display-6">어떤 동료를 찾고 계신가요?</h2>
                            <p className="text-muted mb-4">직무, 기업명, 기술 스택으로 인재를 찾아보세요.</p>

                            {/* 검색창 */}
                            <Form onSubmit={handleSearch} className="mb-4 position-relative">
                                <InputGroup size="lg" className="shadow-sm rounded-pill overflow-hidden border">
                                    <InputGroup.Text className="bg-white border-0 ps-4"><Search className="text-muted" /></InputGroup.Text>
                                    <Form.Control
                                        className="border-0 shadow-none"
                                        placeholder="검색어를 입력해주세요"
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                    />
                                    {searchTerm && (
                                        <Button variant="link" className="text-muted text-decoration-none bg-white border-0" onClick={clearSearch}>
                                            <XCircle />
                                        </Button>
                                    )}
                                    <Button variant="primary" type="submit" className="px-5 fw-bold">검색</Button>
                                </InputGroup>
                            </Form>

                            {/* 카테고리 필터 (계층형 구조 지원) */}
                            <div className="d-flex flex-wrap justify-content-center gap-2 mb-3">
                                <Button
                                    variant={selectedParentCat === null ? "dark" : "outline-secondary"}
                                    size="sm" className="rounded-pill px-3 fw-semibold"
                                    onClick={() => { setSelectedParentCat(null); setSelectedSubCat(null); }}
                                >
                                    전체
                                </Button>
                                {categories.map(cat => (
                                    <Button
                                        key={cat.id}
                                        variant={selectedParentCat === cat.id ? "dark" : "outline-secondary"}
                                        size="sm" className="rounded-pill px-3 fw-semibold"
                                        onClick={() => { setSelectedParentCat(cat.id); setSelectedSubCat(null); }}
                                    >
                                        {cat.name}
                                    </Button>
                                ))}
                            </div>

                            {/* 하위 카테고리 (선택된 상위 카테고리의 children) */}
                            {selectedParentCat && categories.find(c => c.id === selectedParentCat)?.children?.length > 0 && (
                                <div className="bg-light p-3 rounded-4 d-inline-block animate__animated animate__fadeIn">
                                    <div className="d-flex flex-wrap justify-content-center gap-2">
                                        {categories.find(c => c.id === selectedParentCat).children.map(child => (
                                            <Badge
                                                key={child.id}
                                                bg={selectedSubCat === child.id ? "primary" : "white"}
                                                text={selectedSubCat === child.id ? "white" : "dark"}
                                                className={`border px-3 py-2 rounded-pill cursor-pointer ${selectedSubCat !== child.id ? 'shadow-sm' : ''}`}
                                                style={{ cursor: 'pointer', fontWeight: '500' }}
                                                onClick={() => setSelectedSubCat(child.id === selectedSubCat ? null : child.id)}
                                            >
                                                {child.name}
                                            </Badge>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </Col>
                    </Row>
                </Container>
            </div>

            {/* 3. 공고 리스트 영역 */}
            <Container>
                {/* 탭 필터 (고용 형태) */}
                <div className="d-flex justify-content-between align-items-center mb-4 border-bottom">
                    <Tabs
                        activeKey={employmentType}
                        onSelect={(k) => { setEmploymentType(k); setCurrentPage(1); }}
                        className="border-0 custom-tabs"
                    >
                        {['전체', '정규직', '계약직', '인턴', '프리랜서'].map(type => (
                            <Tab eventKey={type} title={type} key={type} />
                        ))}
                    </Tabs>
                    <span className="text-muted small">총 <strong className="text-primary">{jobs.length > 0 ? jobs.length : 0}</strong> 건의 공고</span>
                </div>

                {isLoading ? (
                    <div className="text-center py-5 my-5">
                        <Spinner animation="grow" variant="primary" />
                        <p className="mt-3 text-muted">공고를 불러오는 중입니다...</p>
                    </div>
                ) : (
                    <Row className="g-4">
                        {jobs.length > 0 ? (
                            jobs.map((job) => {
                                const dday = getDDay(job.deadline);
                                return (
                                    <Col key={job.id} md={6} lg={4}>
                                        <Card
                                            className="h-100 border-0 shadow-sm card-hover-effect rounded-4 overflow-hidden"
                                            onClick={() => navigate(`/jobs/${job.id}`)}
                                            style={{ cursor: 'pointer' }}
                                        >
                                            <Card.Body className="p-4 d-flex flex-column">
                                                <div className="d-flex justify-content-between align-items-start mb-3">
                                                    <Badge bg="light" text="primary" className="border border-primary-subtle px-3 py-1">
                                                        {job.categoryName || '카테고리'}
                                                    </Badge>
                                                    <Badge bg={dday.variant} className="px-2">
                                                        <Clock className="me-1 mb-1" size={10} />{dday.text}
                                                    </Badge>
                                                </div>

                                                <Card.Title className="fw-bold mb-2 fs-5 text-dark text-truncate-2" style={{ minHeight: '3.2rem', lineHeight:'1.4' }}>
                                                    {job.title}
                                                </Card.Title>

                                                <div className="mb-4 text-muted small">
                                                    <Building className="me-1" /> {job.companyName || '비공개 기업'}
                                                </div>

                                                <div className="mt-auto pt-3 border-top d-flex justify-content-between align-items-center text-secondary small">
                                                    <span>
                                                        <GeoAlt className="me-1" />
                                                        {job.location ? job.location.split(' ')[0] : '지역무관'}
                                                        <span className="mx-2">|</span>
                                                        {job.employmentType}
                                                    </span>
                                                    <ChevronRight />
                                                </div>
                                            </Card.Body>
                                        </Card>
                                    </Col>
                                );
                            })
                        ) : (
                            <Col xs={12} className="text-center py-5">
                                <div className="py-5 bg-white rounded-4 shadow-sm">
                                    <Search className="text-muted mb-3" size={40} />
                                    <h5 className="text-muted">조건에 맞는 공고가 없습니다.</h5>
                                    <p className="small text-secondary mb-0">검색어나 카테고리를 변경해보세요.</p>
                                </div>
                            </Col>
                        )}
                    </Row>
                )}

                {/* 페이징 */}
                {!isLoading && totalPages > 1 && (
                    <div className="d-flex justify-content-center mt-5">
                        <Pagination>
                            <Pagination.Prev
                                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                                disabled={currentPage === 1}
                            />
                            {[...Array(totalPages)].map((_, i) => (
                                <Pagination.Item
                                    key={i + 1}
                                    active={i + 1 === currentPage}
                                    onClick={() => setCurrentPage(i + 1)}
                                >
                                    {i + 1}
                                </Pagination.Item>
                            ))}
                            <Pagination.Next
                                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                                disabled={currentPage === totalPages}
                            />
                        </Pagination>
                    </div>
                )}
            </Container>

            {/* 스타일 (인라인 대신 CSS 파일로 분리 권장) */}
            <style>{`
                .fw-extra-bold { font-weight: 800; }
                .text-truncate-2 {
                    display: -webkit-box;
                    -webkit-line-clamp: 2;
                    -webkit-box-orient: vertical;
                    overflow: hidden;
                }
                .card-hover-effect { transition: transform 0.2s ease, box-shadow 0.2s ease; }
                .card-hover-effect:hover { 
                    transform: translateY(-5px); 
                    box-shadow: 0 10px 20px rgba(0,0,0,0.08) !important; 
                }
                .custom-tabs .nav-link { 
                    color: #888; border: none; font-weight: 600; padding: 0.8rem 1.5rem;
                }
                .custom-tabs .nav-link.active { 
                    color: #0d6efd; background: transparent; border-bottom: 2px solid #0d6efd; 
                }
                .cursor-pointer { cursor: pointer; }
                .animate__fadeIn { animation: fadeIn 0.4s ease-out; }
                @keyframes fadeIn { from { opacity: 0; transform: translateY(-5px); } to { opacity: 1; transform: translateY(0); } }
            `}</style>
        </div>
    );
};

export default MainPage;