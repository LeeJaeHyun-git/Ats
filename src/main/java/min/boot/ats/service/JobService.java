package min.boot.ats.service;

import lombok.RequiredArgsConstructor;
import min.boot.ats.domain.*;
import min.boot.ats.dto.JobRequestDto;
import min.boot.ats.dto.JobResponseDto;
import min.boot.ats.repo.*;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class JobService {

    private final JobRepository jobRepository;
    private final CompanyRepository companyRepository;
    private final JobCategoryRepository categoryRepository;
    private final UserRepository userRepository;

    /**
     * [채용 공고 등록]
     * 설계서의 jobs, job_steps, job_questions 테이블에 데이터를 동시 저장합니다.
     */
    @Transactional
    public Long createJob(Long companyId, Long userId, Long categoryId, JobRequestDto dto) {

        // 연관 엔티티 조회
        Company company = companyRepository.findById(companyId)
                .orElseThrow(() -> new IllegalArgumentException("존재하지 않는 기업입니다."));
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("존재하지 않는 사용자입니다."));
        JobCategory category = categoryRepository.findById(categoryId)
                .orElseThrow(() -> new IllegalArgumentException("존재하지 않는 카테고리입니다."));

        // Job 엔티티 생성 (신규 필드 location, employmentType, salaryRange 반영)
        Job job = Job.builder()
                .title(dto.getTitle())
                .content(dto.getContent())
                .deadline(dto.getDeadline())
                .company(company)
                .category(category)
                .createdBy(user)
                .location(dto.getLocation())
                .employmentType(dto.getEmploymentType())
                .salaryRange(dto.getSalaryRange())
                .build();

        //  전형 단계 추가
        if (dto.getSteps() != null) {
            dto.getSteps().forEach(stepDto ->
                    job.addStep(JobStep.builder()
                            .stepName(stepDto.getName())
                            .stepOrder(stepDto.getOrder())
                            .build())
            );
        }

        // 지원서 문항 추가
        if (dto.getQuestions() != null) {
            dto.getQuestions().forEach(questDto ->
                    job.addQuestion(JobQuestion.builder()
                            .questionText(questDto.getText())
                            .questionType(questDto.getType())
                            .isRequired(questDto.getIsRequired())
                            .displayOrder(questDto.getOrder())
                            .build())
            );
        }

        return jobRepository.save(job).getId();
    }

    /**
     * [전형 단계 및 문항 순서 일괄 업데이트]
     */
    @Transactional
    public void reorderJobElements(Long jobId, List<Long> stepIds, List<Long> questionIds) {
        Job job = jobRepository.findByIdWithDetails(jobId)
                .orElseThrow(() -> new IllegalArgumentException("공고를 찾을 수 없습니다."));

        if (stepIds != null) {
            for (int i = 0; i < stepIds.size(); i++) {
                Long id = stepIds.get(i);
                int order = i + 1;
                job.getSteps().stream()
                        .filter(s -> s.getId().equals(id))
                        .findFirst()
                        .ifPresent(s -> s.updateOrder(order));
            }
        }

        if (questionIds != null) {
            for (int i = 0; i < questionIds.size(); i++) {
                Long id = questionIds.get(i);
                int order = i + 1;
                job.getQuestions().stream()
                        .filter(q -> q.getId().equals(id))
                        .findFirst()
                        .ifPresent(q -> q.updateOrder(order));
            }
        }
    }

    /**
     * [마감 공고 자동 상태 변경]
     * JobScheduler에서 주기적으로 호출 (벌크 업데이트로 성능 확보)
     */
    @Transactional
    public int closeExpiredJobs() {
        LocalDateTime now = LocalDateTime.now();
        return jobRepository.updateStatusForExpiredJobs(JobStatus.CLOSED, JobStatus.OPEN, now);
    }

    /**
     * [공고 상세 조회]
     */
    public JobResponseDto getJobDetail(Long jobId) {
        Job job = jobRepository.findByIdWithDetails(jobId)
                .orElseThrow(() -> new IllegalArgumentException("해당 공고를 찾을 수 없습니다."));
        return new JobResponseDto(job);
    }

    public Page<JobResponseDto> getCompanyJobsPaging(Long companyId, String title, JobStatus status, Pageable pageable) {
        // QueryDSL을 이용해 동적 쿼리 실행
        return jobRepository.findAllByCompanyIdAndFilters(companyId, status, title, pageable)
                .map(JobResponseDto::new);
    }

    /**
     * [채용 공고 삭제]
     */
    @Transactional
    public void deleteJob(Long jobId) {
        Job job = jobRepository.findById(jobId)
                .orElseThrow(() -> new IllegalArgumentException("삭제할 공고가 존재하지 않습니다."));
        jobRepository.delete(job);
    }

    /**
     * [단일 상태 변경]
     */
    @Transactional
    public void updateStatus(Long jobId, JobStatus status) {
        Job job = jobRepository.findById(jobId)
                .orElseThrow(() -> new IllegalArgumentException("공고를 찾을 수 없습니다."));
        job.updateStatus(status);
    }

    /**
     * [전체 공개 공고 목록 조회 - 필터링 및 페이징 포함]
     * 검색어, 카테고리, 고용형태 조건을 결합하여 조회합니다.
     */
    public Page<JobResponseDto> getOpenJobs(String title, Long categoryId, String employmentType, Pageable pageable) {
        // Custom Repository에 정의한 메서드가 호출됩니다.
        return jobRepository.findByFilters(JobStatus.OPEN, title, categoryId, employmentType, pageable)
                .map(JobResponseDto::new);
    }

    /**
     * [공고 수정 로직]
     * 1. 기본 정보(제목, 내용 등) 업데이트
     * 2. 기존 전형 단계/질문 모두 삭제 후, 요청받은 새 리스트로 교체 (Delete-Insert)
     */
    @Transactional
    public void updateJob(Long jobId, JobRequestDto dto) {
        Job job = jobRepository.findById(jobId)
                .orElseThrow(() -> new IllegalArgumentException("해당 공고를 찾을 수 없습니다."));

        // 1. 기본 정보 수정 (Job 엔티티에 updateInfo 메서드 필요 -> 3단계 참고)
        job.updateInfo(
                dto.getTitle(),
                dto.getContent(),
                dto.getLocation(),
                dto.getEmploymentType(),
                dto.getSalaryRange(),
                dto.getDeadline()
        );

        // 2. 전형 단계 교체 (기존 것 비우고 새로 추가)
        job.clearSteps(); // 기존 리스트 clear
        if (dto.getSteps() != null) {
            dto.getSteps().forEach(stepDto -> {
                job.addStep(JobStep.builder()
                        .stepName(stepDto.getName()) // DTO: name
                        .stepOrder(stepDto.getOrder()) // DTO: order
                        .build());
            });
        }

        // 3. 질문 문항 교체 (기존 것 비우고 새로 추가)
        job.clearQuestions(); // 기존 리스트 clear
        if (dto.getQuestions() != null) {
            dto.getQuestions().forEach(qDto -> {
                job.addQuestion(JobQuestion.builder()
                        .questionText(qDto.getText()) // DTO: text
                        .questionType(qDto.getType()) // DTO: type (Enum)
                        .isRequired(qDto.getIsRequired()) // DTO: isRequired
                        .displayOrder(qDto.getOrder()) // DTO: order
                        .build());
            });
        }
    }

}