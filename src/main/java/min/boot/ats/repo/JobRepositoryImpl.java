package min.boot.ats.repo;

import com.querydsl.core.types.dsl.BooleanExpression;
import com.querydsl.jpa.impl.JPAQuery;
import com.querydsl.jpa.impl.JPAQueryFactory;
import lombok.RequiredArgsConstructor;
import min.boot.ats.domain.Job;
import min.boot.ats.domain.JobStatus;
import min.boot.ats.domain.QJob;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.support.PageableExecutionUtils;
import java.util.List;
@RequiredArgsConstructor
public class JobRepositoryImpl implements JobRepositoryCustom {

    private final JPAQueryFactory queryFactory;

    @Override
    public Page<Job> findByFilters(JobStatus status, String title, Long categoryId, String employmentType, Pageable pageable) {
        QJob job = QJob.job; // QClass 활용

        List<Job> content = queryFactory
                .selectFrom(job)
                .where(
                        job.status.eq(status),
                        titleContains(title),
                        categoryEq(categoryId),
                        employmentTypeEq(employmentType)
                )
                .offset(pageable.getOffset())
                .limit(pageable.getPageSize())
                .orderBy(job.createdAt.desc())
                .fetch();

        JPAQuery<Long> countQuery = queryFactory
                .select(job.count())
                .from(job)
                .where(
                        job.status.eq(status),
                        titleContains(title),
                        categoryEq(categoryId),
                        employmentTypeEq(employmentType)
                );

        return PageableExecutionUtils.getPage(content, pageable, countQuery::fetchOne);
    }

    @Override
    public Page<Job> findAllByCompanyIdAndFilters(Long companyId, JobStatus status, String title, Pageable pageable) {
        QJob job = QJob.job;

        // 동적 조건 생성
        BooleanExpression predicate = job.company.id.eq(companyId)
                .and(titleContains(title));

        // 상태 필터가 'ALL'(Null)이 아니면 조건 추가
        if (status != null) {
            predicate = predicate.and(job.status.eq(status));
        }

        List<Job> content = queryFactory
                .selectFrom(job)
                .where(predicate)
                .offset(pageable.getOffset())
                .limit(pageable.getPageSize())
                .orderBy(job.createdAt.desc()) // 최신순 정렬
                .fetch();

        JPAQuery<Long> countQuery = queryFactory
                .select(job.count())
                .from(job)
                .where(predicate);

        return PageableExecutionUtils.getPage(content, pageable, countQuery::fetchOne);
    }

    // 동적 조건 메서드들 (Null일 경우 조건 무시)
    private BooleanExpression titleContains(String title) {
        // 검색어가 빈 문자열("")로 들어오는 경우도 무시하도록 처리
        return (title != null && !title.isBlank()) ? QJob.job.title.containsIgnoreCase(title) : null;
    }

    private BooleanExpression categoryEq(Long categoryId) {
        return categoryId != null ? QJob.job.category.id.eq(categoryId) : null;
    }

    private BooleanExpression employmentTypeEq(String type) {
        return type != null ? QJob.job.employmentType.eq(type) : null;
    }
}