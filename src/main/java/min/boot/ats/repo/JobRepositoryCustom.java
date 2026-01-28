package min.boot.ats.repo;

import min.boot.ats.domain.Job;
import min.boot.ats.domain.JobStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface JobRepositoryCustom {
    // 구직자용 공개 공고 검색
    Page<Job> findByFilters(JobStatus status, String title, Long categoryId, String employmentType, Pageable pageable);

    // 기업 관리자용 공고 검색 (내 기업의 공고만 + 상태/제목 필터링)
    Page<Job> findAllByCompanyIdAndFilters(Long companyId, JobStatus status, String title, Pageable pageable);
}