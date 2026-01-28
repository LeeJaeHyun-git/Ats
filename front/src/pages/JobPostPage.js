import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import {
    BriefcaseFill, CheckCircleFill, SaveFill, PlusCircle, ChevronLeft, TrashFill, CashStack
} from 'react-bootstrap-icons';

// [추가됨] 챗봇 컴포넌트 임포트
import Chatbot from '../components/Chatbot';

const JobPostPage = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const { jobId } = useParams();

    const isEditMode = Boolean(jobId);

    const [jobData, setJobData] = useState({
        title: '',
        content: '',
        location: '',
        employmentType: '정규직',
        salaryRange: '',
        deadline: '',
        categoryId: '', // 초기값
        steps: [{ name: '서류전형', order: 1 }],
        questions: [{ text: '', type: 'QUESTION', isRequired: 'Y', order: 1 }]
    });

    const [mainCategories, setMainCategories] = useState([]);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // 1. 카테고리 로드
    useEffect(() => {
        api.get('/api/categories')
            .then(res => setMainCategories(res.data))
            .catch(err => console.error("카테고리 로드 실패", err));
    }, []);

    // 2. 수정 모드 데이터 불러오기
    useEffect(() => {
        if (isEditMode) {
            api.get(`/api/jobs/${jobId}`)
                .then(res => {
                    const data = res.data;
                    setJobData({
                        title: data.title,
                        content: data.content,
                        location: data.location,
                        employmentType: data.employmentType || '정규직',
                        salaryRange: data.salaryRange,
                        deadline: data.deadline ? data.deadline.substring(0, 16) : '',
                        categoryId: data.categoryId || '',
                        steps: data.steps || [{ name: '서류전형', order: 1 }],
                        questions: data.questions || [{ text: '', type: 'QUESTION', isRequired: 'Y', order: 1 }]
                    });
                })
                .catch(err => {
                    console.error("공고 데이터 로드 실패", err);
                    alert("공고 정보를 불러올 수 없습니다.");
                    navigate('/jobs/manage');
                });
        }
    }, [isEditMode, jobId, navigate]);


    // --- [기존 로직 유지] 카테고리 파생 데이터 계산 ---
    const getParentId = (currentId) => {
        if (!currentId) return '';
        const id = parseInt(currentId);

        // 1. 현재 ID가 대분류 ID인 경우
        const isMain = mainCategories.find(c => c.id === id);
        if (isMain) return isMain.id;

        // 2. 현재 ID가 소분류 ID인 경우 (부모를 찾음)
        const parent = mainCategories.find(main => main.children && main.children.some(child => child.id === id));
        return parent ? parent.id : '';
    };

    const currentParentId = getParentId(jobData.categoryId);
    // 선택된 대분류의 자식들(소분류) 목록
    const currentSubCategories = mainCategories.find(c => c.id === currentParentId)?.children || [];


    // 대분류 변경 핸들러
    const handleMainCategoryChange = (e) => {
        const val = e.target.value;
        const newParentId = val ? parseInt(val) : '';
        setJobData(prev => ({ ...prev, categoryId: newParentId }));
    };

    // 소분류 변경 핸들러
    const handleSubCategoryChange = (e) => {
        const val = e.target.value;
        if (!val) {
            setJobData(prev => ({ ...prev, categoryId: currentParentId }));
        } else {
            setJobData(prev => ({ ...prev, categoryId: parseInt(val) }));
        }
    };

    // -----------------------------------------------------------
    // [추가됨] AI 챗봇이 생성한 초안을 공고 폼에 적용하는 함수
    // -----------------------------------------------------------
    const handleApplyAiDraft = (draftData) => {
        // 1. 단순 텍스트인 경우 (기존 본문에 이어붙이기)
        if (typeof draftData === 'string') {
            setJobData(prev => ({
                ...prev,
                content: prev.content ? prev.content + "\n\n" + draftData : draftData
            }));
        }
        // 2. 객체(JSON) 형태인 경우 (제목, 본문 등 필드별 매핑)
        else {
            setJobData(prev => ({
                ...prev,
                title: draftData.title || prev.title,
                content: draftData.content || prev.content,
            }));
        }
    };
    // -----------------------------------------------------------

    // 전형 단계 핸들러들
    const addStep = () => {
        setJobData(prev => ({ ...prev, steps: [...prev.steps, { name: '', order: prev.steps.length + 1 }] }));
    };
    const removeStep = (index) => {
        if (jobData.steps.length <= 1) return alert("최소 1개 이상의 전형 단계가 필요합니다.");
        const newSteps = jobData.steps.filter((_, i) => i !== index).map((step, i) => ({ ...step, order: i + 1 }));
        setJobData(prev => ({ ...prev, steps: newSteps }));
    };

    // 질문 문항 핸들러들
    const addQuestion = () => {
        setJobData(prev => ({ ...prev, questions: [...prev.questions, { text: '', type: 'QUESTION', isRequired: 'Y', order: prev.questions.length + 1 }] }));
    };
    const updateQuestionField = (index, field, value) => {
        const newQs = [...jobData.questions];
        newQs[index][field] = value;
        setJobData(prev => ({ ...prev, questions: newQs }));
    };
    const removeQuestion = (index) => {
        const newQs = jobData.questions.filter((_, i) => i !== index).map((q, i) => ({ ...q, order: i + 1 }));
        setJobData(prev => ({ ...prev, questions: newQs }));
    };

    // 저장 로직
    const handleSave = async (targetStatus) => {
        if (isSubmitting) return;

        if (!jobData.title.trim()) return alert("공고 제목을 입력해주세요.");
        if (!isEditMode && !jobData.categoryId) return alert("직무 카테고리를 선택해주세요.");
        if (!jobData.content.trim()) return alert("모집 상세 설명을 입력해주세요.");

        for (let i = 0; i < jobData.steps.length; i++) {
            if (!jobData.steps[i].name.trim()) return alert(`${i + 1}번째 전형 단계의 명칭을 입력해주세요.`);
        }
        for (let i = 0; i < jobData.questions.length; i++) {
            if (!jobData.questions[i].text.trim()) return alert(`${i + 1}번째 지원서 문항의 내용이 비어있습니다.`);
        }

        setIsSubmitting(true);
        try {
            const safeDeadline = jobData.deadline ?
                (jobData.deadline.length === 16 ? `${jobData.deadline}:00` : jobData.deadline) : null;

            const payload = { ...jobData, deadline: safeDeadline };

            if (isEditMode) {
                await api.put(`/api/jobs/${jobId}`, payload);
                if (targetStatus) {
                    await api.put(`/api/jobs/${jobId}/status`, null, { params: { status: targetStatus } });
                }
                alert("공고가 성공적으로 수정되었습니다.");
            } else {
                const createRes = await api.post(
                    `/api/jobs/company/${user.companyId}/user/${user.id}/category/${jobData.categoryId}`,
                    payload
                );
                const newJobId = createRes.data;
                if (targetStatus === 'OPEN') {
                    await api.put(`/api/jobs/${newJobId}/status`, null, { params: { status: 'OPEN' } });
                }
                alert("공고가 성공적으로 등록되었습니다.");
            }

            navigate('/jobs/manage');

        } catch (err) {
            console.error(err);
            alert("저장 중 오류가 발생했습니다.\n" + (err.response?.data?.message || err.message));
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="d-flex min-vh-100 bg-light">
            {/* [기존 코드 유지] 사이드바 */}
            <aside className="bg-dark text-white p-3 shadow-lg" style={{ width: '260px', flexShrink: 0 }}>
                <div className="d-flex align-items-center px-2 py-4 mb-4 border-bottom border-secondary cursor-pointer" onClick={() => navigate('/')}>
                    <BriefcaseFill className="text-primary me-2" size={30} />
                    <span className="fs-4 fw-bold">ATS Core</span>
                </div>
                <nav className="nav flex-column gap-2">
                    <div className="nav-link text-white active bg-primary rounded-3 d-flex align-items-center py-2 px-3 cursor-pointer">
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
                    <div
                        className="nav-link text-white rounded-3 d-flex align-items-center py-2 px-3 cursor-pointer hover-bg-secondary"
                        onClick={() => navigate('/profile')}
                    >
                        <BriefcaseFill className="me-3" /> 마이페이지
                    </div>
                </nav>
            </aside>

            {/* [기존 코드 유지] 메인 콘텐츠 */}
            <main className="flex-grow-1 p-5 overflow-auto">
                <div className="mb-4">
                    <button
                        className="btn btn-link text-secondary text-decoration-none p-0 fw-bold d-flex align-items-center"
                        onClick={() => navigate(-1)}
                        style={{ fontSize: '0.95rem' }}
                    >
                        <ChevronLeft className="me-1" /> 뒤로 가기
                    </button>
                </div>

                <header className="mb-4 d-flex justify-content-between align-items-center">
                    <div>
                        <h2 className="fw-bold text-dark mb-1">
                            {isEditMode ? '채용 공고 수정' : '채용 공고 등록'}
                        </h2>
                        <p className="text-muted mb-0">
                            {isEditMode ? '현재 공고 상태(공개/비공개)를 유지하며 내용을 수정합니다.' : '새로운 인재를 찾기 위한 공고를 설계합니다.'}
                        </p>
                    </div>

                    <div className="d-flex gap-2">
                        {isEditMode ? (
                            <button
                                type="button"
                                className="btn btn-primary px-4 shadow fw-bold"
                                onClick={() => handleSave(null)}
                                disabled={isSubmitting}
                            >
                                <CheckCircleFill className="me-2" /> 수정 사항 저장
                            </button>
                        ) : (
                            <>
                                <button
                                    type="button"
                                    className="btn btn-outline-secondary px-4 fw-bold"
                                    onClick={() => handleSave('DRAFT')}
                                    disabled={isSubmitting}
                                >
                                    <SaveFill className="me-2" /> 임시 저장
                                </button>
                                <button
                                    type="button"
                                    className="btn btn-primary px-4 shadow fw-bold"
                                    onClick={() => handleSave('OPEN')}
                                    disabled={isSubmitting}
                                >
                                    <CheckCircleFill className="me-2" /> 공고 게시하기
                                </button>
                            </>
                        )}
                    </div>
                </header>

                <div className="row g-4">
                    <div className="col-lg-8">
                        <div className="card border-0 shadow-sm mb-4 p-4 rounded-4">
                            <h5 className="fw-bold mb-4 text-primary border-bottom pb-2">기본 정보</h5>
                            <div className="mb-4">
                                <label className="form-label fw-bold small text-secondary">공고 제목 <span className="text-danger">*</span></label>
                                <input type="text" className="form-control form-control-lg bg-light border-0" value={jobData.title} onChange={e => setJobData({...jobData, title: e.target.value})} placeholder="예: 2026년 상반기 백엔드 개발자 신입/경력 채용" />
                            </div>

                            <div className="row g-3 mb-4">
                                <div className="col-md-6">
                                    <label className="form-label fw-bold small text-secondary">직무 카테고리 <span className="text-danger">*</span></label>
                                    <select
                                        className="form-select bg-light border-0"
                                        value={currentParentId}
                                        onChange={handleMainCategoryChange}
                                    >
                                        <option value="">
                                            {isEditMode ? "(기존 카테고리 유지 시 선택 안 함)" : "대분류"}
                                        </option>
                                        {mainCategories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                                    </select>
                                </div>
                                <div className="col-md-6">
                                    <label className="form-label fw-bold small text-secondary">상세 직무 (선택)</label>
                                    <select
                                        className="form-select bg-light border-0"
                                        value={currentSubCategories.some(c => c.id === parseInt(jobData.categoryId)) ? jobData.categoryId : ''}
                                        onChange={handleSubCategoryChange}
                                        disabled={!currentSubCategories.length && !isEditMode}
                                    >
                                        <option value="">전체 (대분류만 선택)</option>
                                        {currentSubCategories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                                    </select>
                                </div>
                            </div>
                            <div>
                                <label className="form-label fw-bold small text-secondary">모집 상세 설명 <span className="text-danger">*</span></label>
                                <div className="bg-light p-3 rounded-3 mb-3 border">
                                    <small className="text-muted">
                                        💡<b>AI 팁:</b> 우측 하단 챗봇에게 "자바 백엔드 공고 써줘"라고 말한 뒤 [적용]을 누르면 내용이 자동 완성됩니다.
                                    </small>
                                </div>
                                <textarea className="form-control bg-light border-0" rows="12" value={jobData.content} onChange={e => setJobData({...jobData, content: e.target.value})} placeholder="주요 업무, 자격 요건, 우대 사항 등을 상세히 작성해주세요." />
                            </div>
                        </div>

                        {/* 문항 섹션 */}
                        <div className="card border-0 shadow-sm p-4 rounded-4">
                            <div className="d-flex justify-content-between mb-4 align-items-center border-bottom pb-2">
                                <h5 className="fw-bold mb-0 text-dark">지원 요구 사항</h5>
                                <button type="button" className="btn btn-sm btn-outline-dark rounded-pill" onClick={addQuestion}><PlusCircle className="me-1"/> 문항 추가</button>
                            </div>
                            {jobData.questions.map((q, idx) => (
                                <div key={idx} className="bg-light p-3 rounded-3 mb-3 border border-light d-flex gap-2 align-items-center">
                                    <div className="badge bg-secondary rounded-pill me-2">{q.order}</div>
                                    <div className="flex-grow-1">
                                        <input
                                            type="text"
                                            className="form-control border-0 bg-white shadow-sm"
                                            value={q.text}
                                            onChange={e => updateQuestionField(idx, 'text', e.target.value)}
                                            placeholder="지원자에게 물어볼 질문을 입력하세요."
                                        />
                                    </div>
                                    <select
                                        className="form-select form-select-sm w-auto border-0 shadow-sm"
                                        value={q.type}
                                        onChange={e => updateQuestionField(idx, 'type', e.target.value)}
                                    >
                                        <option value="QUESTION">질문형</option>
                                        <option value="GUIDE">안내형</option>
                                    </select>
                                    <select
                                        className={`form-select form-select-sm w-auto border-0 shadow-sm ${q.isRequired === 'Y' ? 'text-danger fw-bold' : 'text-muted'}`}
                                        value={q.isRequired}
                                        onChange={e => updateQuestionField(idx, 'isRequired', e.target.value)}
                                    >
                                        <option value="Y">필수</option>
                                        <option value="N">선택</option>
                                    </select>
                                    <TrashFill className="text-secondary ms-2 opacity-50 hover-opacity-100" style={{cursor:'pointer'}} onClick={() => removeQuestion(idx)} />
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="col-lg-4">
                        <div className="card border-0 shadow-sm mb-4 p-4 text-dark rounded-4">
                            <h5 className="fw-bold mb-4 text-dark border-bottom pb-2">모집 조건 설정</h5>
                            <div className="mb-3">
                                <label className="small fw-bold text-secondary mb-1">마감 일시</label>
                                <input type="datetime-local" className="form-control bg-light border-0" value={jobData.deadline} onChange={e => setJobData({...jobData, deadline: e.target.value})} />
                            </div>
                            <div className="mb-3">
                                <label className="small fw-bold text-secondary mb-1">근무 지역</label>
                                <input type="text" className="form-control bg-light border-0" value={jobData.location} onChange={e => setJobData({...jobData, location: e.target.value})} placeholder="예: 서울 강남구" />
                            </div>
                            <div className="mb-3">
                                <label className="small fw-bold text-secondary mb-1">고용 형태</label>
                                <select className="form-select bg-light border-0" value={jobData.employmentType} onChange={e => setJobData({...jobData, employmentType: e.target.value})}>
                                    <option value="정규직">정규직</option>
                                    <option value="계약직">계약직</option>
                                    <option value="인턴">인턴십</option>
                                    <option value="프리랜서">프리랜서</option>
                                </select>
                            </div>
                            <div className="mb-0">
                                <label className="small fw-bold text-secondary mb-1 d-flex justify-content-between">
                                    <span><CashStack className="me-1"/> 급여 범위</span>
                                    <span className="text-primary small text-decoration-underline" style={{cursor:'pointer'}} onClick={() => setJobData({...jobData, salaryRange: '회사 내규에 따름'})}>내규적용</span>
                                </label>
                                <input type="text" className="form-control bg-light border-0" value={jobData.salaryRange} onChange={e => setJobData({...jobData, salaryRange: e.target.value})} placeholder="예: 4,000 ~ 5,000만원" />
                            </div>
                        </div>

                        <div className="card border-0 shadow-sm p-4 text-dark rounded-4">
                            <div className="d-flex justify-content-between mb-4 align-items-center border-bottom pb-2">
                                <h5 className="fw-bold mb-0 text-dark">전형 단계</h5>
                                <button type="button" className="btn btn-sm btn-outline-success rounded-pill" onClick={addStep}>+ 단계 추가</button>
                            </div>
                            {jobData.steps.map((step, idx) => (
                                <div key={idx} className="d-flex align-items-center mb-2 bg-white p-2 rounded-3 border shadow-sm">
                                    <div className="badge bg-success rounded-pill me-2" style={{width:'25px'}}>{step.order}</div>
                                    <input
                                        type="text"
                                        className="form-control border-0 fw-semibold"
                                        value={step.name}
                                        onChange={e => {
                                            const newSteps = [...jobData.steps];
                                            newSteps[idx].name = e.target.value;
                                            setJobData({...jobData, steps: newSteps});
                                        }}
                                        placeholder="단계 명칭 (예: 1차 면접)"
                                    />
                                    <TrashFill className="text-secondary ms-2 opacity-50 hover-opacity-100" style={{cursor:'pointer'}} onClick={() => removeStep(idx)} />
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </main>

            {/* [추가됨] AI 챗봇 컴포넌트 (데이터 적용 핸들러 전달) */}
            <Chatbot onApplyDraft={handleApplyAiDraft} />

            <style>{`
                .cursor-pointer { cursor: pointer; }
                .hover-bg-secondary:hover { background-color: rgba(255, 255, 255, 0.1); }
            `}</style>
        </div>
    );
};

export default JobPostPage;