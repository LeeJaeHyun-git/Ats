import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import {
    BriefcaseFill, GeoAltFill, CashStack,
    PeopleFill, ClockFill, PencilSquare, TrashFill,
    ChevronLeft, ListCheck, QuestionCircleFill, BuildingFill,
    ShareFill, ExclamationTriangleFill
} from 'react-bootstrap-icons';
import { Badge, Button, Spinner } from 'react-bootstrap';

const JobDetail = () => {
    const { jobId } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth(); // 현재 로그인 세션 정보

    const [job, setJob] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // 1. 공고 데이터 로드
    useEffect(() => {
        if (!jobId) {
            navigate('/jobs');
            return;
        }

        api.get(`/api/jobs/${jobId}`)
            .then(res => {
                setJob(res.data);
            })
            .catch(err => {
                console.error("데이터 로드 에러:", err);
                setError("공고를 찾을 수 없거나 삭제되었습니다.");
            })
            .finally(() => setLoading(false));
    }, [jobId, navigate]);

    // 2. 공고 삭제 핸들러
    const handleDelete = async () => {
        if (!window.confirm("정말 이 공고를 삭제하시겠습니까?\n이 작업은 되돌릴 수 없습니다.")) return;

        try {
            await api.delete(`/api/jobs/${jobId}`);
            alert("공고가 삭제되었습니다.");
            navigate('/jobs/manage');
        } catch (err) {
            alert("삭제 중 오류가 발생했습니다.");
        }
    };

    // 로딩 및 에러 UI
    if (loading) return <div className="d-flex justify-content-center align-items-center min-vh-100"><Spinner animation="border" variant="primary" /></div>;
    if (error) return (
        <div className="d-flex flex-column justify-content-center align-items-center min-vh-100 text-muted">
            <ExclamationTriangleFill size={50} className="mb-3 text-warning" />
            <h3>{error}</h3>
            <Button variant="link" onClick={() => navigate('/jobs')}>메인으로 돌아가기</Button>
        </div>
    );

    // 3. [권한 체크] 수정/삭제 버튼 노출 여부
    // DTO에 companyId가 없을 경우를 대비해 companyName으로 fallback 체크
    const isOwner = user && job && (
        (job.companyId && user.companyId === job.companyId) || // ID 비교 (가장 정확)
        (!job.companyId && user.companyName === job.companyName) // ID가 없으면 이름 비교
    );

    // 4. [지원 가능 여부] 구직자(user가 없거나 role이 없는 경우)만 지원 가능
    const canApply = job.status === 'OPEN' && (!user || user.role === undefined);

    // 5. 전형 단계 정렬 (DTO: steps -> StepResponseDto[order, name])
    const sortedSteps = job.steps ? [...job.steps].sort((a, b) => a.order - b.order) : [];

    // 6. 질문 문항 정렬 (DTO: questions -> QuestionResponseDto[order, text, type, isRequired])
    const sortedQuestions = job.questions ? [...job.questions].sort((a, b) => a.order - b.order) : [];

    return (
        <div className="bg-light min-vh-100 pb-5">
            {/* 상단 네비게이션 */}
            <div className="bg-white border-bottom shadow-sm sticky-top py-3" style={{ zIndex: 1020 }}>
                <div className="container d-flex justify-content-between align-items-center">
                    <button className="btn btn-link text-decoration-none text-secondary fw-bold p-0" onClick={() => navigate(-1)}>
                        <ChevronLeft className="me-1" /> 뒤로 가기
                    </button>

                    <div className="d-flex gap-2">
                        {isOwner && (
                            <>
                                <button className="btn btn-outline-primary btn-sm rounded-pill px-3" onClick={() => navigate(`/jobs/edit/${jobId}`)}>
                                    <PencilSquare className="me-1" /> 수정
                                </button>
                                <button className="btn btn-outline-danger btn-sm rounded-pill px-3" onClick={handleDelete}>
                                    <TrashFill className="me-1" /> 삭제
                                </button>
                            </>
                        )}
                        <button className="btn btn-light btn-sm rounded-circle border" title="링크 복사" onClick={() => {
                            navigator.clipboard.writeText(window.location.href);
                            alert("링크가 복사되었습니다.");
                        }}>
                            <ShareFill />
                        </button>
                    </div>
                </div>
            </div>

            {/* 메인 콘텐츠 */}
            <div className="container py-5">
                <div className="row g-4">
                    {/* 왼쪽: 상세 정보 */}
                    <div className="col-lg-8">
                        <div className="card border-0 shadow-sm p-4 p-md-5 mb-4 rounded-4 animate__animated animate__fadeIn">
                            {/* 헤더 */}
                            <div className="mb-4">
                                <div className="d-flex align-items-center gap-2 mb-3">
                                    <Badge bg={job.status === 'OPEN' ? 'success' : 'secondary'} className="px-3 py-2 rounded-pill fw-normal">
                                        {job.status === 'OPEN' ? '채용 중' : '모집 마감'}
                                    </Badge>
                                    <span className="text-primary fw-bold small">{job.categoryName}</span>
                                </div>
                                <h1 className="fw-extra-bold text-dark display-6 mb-3" style={{ wordBreak: 'keep-all' }}>{job.title}</h1>
                                <div className="d-flex align-items-center text-secondary fs-5">
                                    <BuildingFill className="me-2 text-muted" />
                                    <span className="fw-semibold">{job.companyName}</span>
                                </div>
                            </div>

                            <hr className="my-5 opacity-25" />

                            {/* 본문 */}
                            <div className="job-content mb-5">
                                <h4 className="fw-bold mb-4 ps-3 border-start border-4 border-primary">모집 상세</h4>
                                <div className="text-dark" style={{
                                    whiteSpace: 'pre-line',
                                    lineHeight: '1.8',
                                    fontSize: '1.05rem',
                                    color: '#444'
                                }}>
                                    {job.content}
                                </div>
                            </div>

                            {/* 문항 (DTO 필드: text, type, order 사용) */}
                            {sortedQuestions.length > 0 && (
                                <div className="mt-5 p-4 rounded-4 bg-light border">
                                    <h5 className="fw-bold mb-4 d-flex align-items-center text-dark">
                                        <QuestionCircleFill className="text-primary me-2" />
                                        지원 요구 사항
                                    </h5>
                                    <div className="d-flex flex-column gap-3">
                                        {sortedQuestions.map((q, idx) => (
                                            <div key={idx} className="bg-white p-3 rounded-3 border shadow-sm">
                                                <div className="d-flex justify-content-between mb-2">
                                                    <span className="badge bg-light text-primary border border-primary-subtle">
                                                        Q{q.order}
                                                    </span>
                                                    {q.isRequired === 'Y' ? (
                                                        <span className="text-danger small fw-bold">• 필수 답변</span>
                                                    ) : (
                                                        <span className="text-muted small">선택 답변</span>
                                                    )}
                                                </div>
                                                <p className="mb-1 fw-bold text-dark">{q.text}</p>
                                                <small className="text-muted">
                                                    {q.type === 'QUESTION' ? '✍️ 사전 질문' : '📢 단순 안내 문구'}
                                                </small>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* 오른쪽: 요약 정보 */}
                    <div className="col-lg-4">
                        <div className="card border-0 shadow-sm p-4 rounded-4 sticky-top" style={{ top: '100px', zIndex: 1010 }}>
                            <h5 className="fw-bold mb-4">채용 요약</h5>
                            <div className="vstack gap-4">
                                <div className="d-flex align-items-start">
                                    <GeoAltFill className="text-secondary me-3 fs-5 mt-1" />
                                    <div>
                                        <div className="small text-muted fw-bold">근무 지역</div>
                                        <div className="text-dark">{job.location || '지역 무관'}</div>
                                    </div>
                                </div>
                                <div className="d-flex align-items-start">
                                    <PeopleFill className="text-secondary me-3 fs-5 mt-1" />
                                    <div>
                                        <div className="small text-muted fw-bold">고용 형태</div>
                                        <div className="text-dark">{job.employmentType}</div>
                                    </div>
                                </div>
                                <div className="d-flex align-items-start">
                                    <CashStack className="text-secondary me-3 fs-5 mt-1" />
                                    <div>
                                        <div className="small text-muted fw-bold">급여 정보</div>
                                        <div className="text-dark">{job.salaryRange || '내규에 따름'}</div>
                                    </div>
                                </div>
                                <div className="d-flex align-items-start pt-3 border-top">
                                    <ClockFill className="text-danger me-3 fs-5 mt-1" />
                                    <div>
                                        <div className="small text-danger fw-bold">마감일</div>
                                        <div className="fw-bold text-dark">
                                            {job.deadline ? new Date(job.deadline).toLocaleString() : '상시 채용'}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <hr className="my-4" />

                            <h5 className="fw-bold mb-4 d-flex align-items-center">
                                <ListCheck className="text-success me-2" /> 전형 절차
                            </h5>
                            <div className="ps-2">
                                {sortedSteps.map((step, idx) => (
                                    <div key={idx} className="d-flex mb-4 position-relative">
                                        {idx !== sortedSteps.length - 1 && (
                                            <div className="position-absolute border-start border-2 h-100"
                                                 style={{ left: '14px', top: '28px', borderColor: '#e9ecef', zIndex:0 }}></div>
                                        )}
                                        <div className="bg-success text-white rounded-circle d-flex align-items-center justify-content-center me-3 shadow-sm"
                                             style={{ width: '30px', height: '30px', zIndex: 1, fontWeight: 'bold', fontSize:'0.9rem' }}>
                                            {step.order}
                                        </div>
                                        <div className="fw-bold text-dark pt-1">{step.name}</div>
                                    </div>
                                ))}
                            </div>

                            <div className="d-grid mt-4">
                                {isOwner ? (
                                    <Button variant="outline-secondary" disabled className="py-3 rounded-3">
                                        관리자는 지원할 수 없습니다
                                    </Button>
                                ) : (
                                    <Button
                                        variant="primary"
                                        size="lg"
                                        className="py-3 rounded-3 shadow fw-bold"
                                        onClick={() => navigate(`/jobs/${jobId}/apply`)}
                                        disabled={!canApply}
                                    >
                                        {job.status === 'OPEN' ? '지원하기' : '지원 기간이 마감되었습니다'}
                                    </Button>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <style>{`
                .fw-extra-bold { font-weight: 800; }
                .animate__animated { animation-duration: 0.5s; }
            `}</style>
        </div>
    );
};

export default JobDetail;