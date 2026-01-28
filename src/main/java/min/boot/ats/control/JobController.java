package min.boot.ats.control;

import lombok.RequiredArgsConstructor;
import min.boot.ats.domain.JobStatus;
import min.boot.ats.dto.JobRequestDto;
import min.boot.ats.dto.JobResponseDto;
import min.boot.ats.dto.JobReorderRequestDto;
import min.boot.ats.service.JobService;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/jobs")
@RequiredArgsConstructor
public class JobController {

    private final JobService jobService;

    /*
     [채용 공고 등록]
     */
    @PostMapping("/company/{companyId}/user/{userId}/category/{categoryId}")
    public ResponseEntity<Long> createJob(@PathVariable Long companyId,
                                          @PathVariable Long userId,
                                          @PathVariable Long categoryId,
                                          @RequestBody JobRequestDto dto) {
        return ResponseEntity.ok(jobService.createJob(companyId, userId, categoryId, dto));
    }

    /*
    [채용 공고 수정] - (프론트엔드 JobPostPage.js와 연동됨)
     */
    @PutMapping("/{id}")
    public ResponseEntity<Void> updateJob(@PathVariable Long id, @RequestBody JobRequestDto dto) {
        // JobService에 updateJob(Long id, JobRequestDto dto) 메서드가 있어야 합니다.
        jobService.updateJob(id, dto);
        return ResponseEntity.ok().build();
    }

    /*
    [전형 단계 및 문항 순서 변경]
     */
    @PutMapping("/{jobId}/reorder")
    public ResponseEntity<Void> reorderJob(
            @PathVariable Long jobId,
            @RequestBody JobReorderRequestDto dto
    ) {
        jobService.reorderJobElements(jobId, dto.getStepIds(), dto.getQuestionIds());
        return ResponseEntity.ok().build();
    }

    /*
    [채용 공고 상태 변경]
     */
    @PutMapping("/{jobId}/status")
    public ResponseEntity<Void> updateStatus(@PathVariable Long jobId,
                                             @RequestParam JobStatus status) {
        jobService.updateStatus(jobId, status);
        return ResponseEntity.ok().build();
    }

    /*
     [채용 공고 상세 조회]
     */
    @GetMapping("/{jobId}")
    public ResponseEntity<JobResponseDto> getJob(@PathVariable Long jobId) {

        return ResponseEntity.ok(jobService.getJobDetail(jobId));
    }

    @GetMapping("/company/{companyId}")
    public ResponseEntity<Page<JobResponseDto>> getCompanyJobs(
            @PathVariable Long companyId,
            @RequestParam(required = false) String title,
            @RequestParam(required = false) String status, // "ALL", "OPEN" 등 문자열로 받음
            Pageable pageable) {

        // "ALL"이거나 없으면 null 처리하여 전체 조회
        JobStatus jobStatus = (status != null && !status.equals("ALL"))
                ? JobStatus.valueOf(status)
                : null;

        return ResponseEntity.ok(jobService.getCompanyJobsPaging(companyId, title, jobStatus, pageable));
    }

    /*
    [전체 공개 공고 목록 조회] - 검색/필터링 포함
     */
    @GetMapping("/open")
    public ResponseEntity<Page<JobResponseDto>> getOpenJobs(
            @RequestParam(required = false) String title,
            @RequestParam(required = false) Long categoryId,
            @RequestParam(required = false) String employmentType,
            Pageable pageable) {

        // 서비스에 getOpenJobs 메서드가 QueryDSL 등을 통해 구현되어 있어야 합니다.
        return ResponseEntity.ok(jobService.getOpenJobs(title, categoryId, employmentType, pageable));
    }

    /*
    [채용 공고 삭제]
     */
    @DeleteMapping("/{jobId}")
    public ResponseEntity<Void> deleteJob(@PathVariable Long jobId) {
        jobService.deleteJob(jobId);
        return ResponseEntity.ok().build();
    }
}