package min.boot.ats.repo;

import min.boot.ats.domain.JobCategory;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface JobCategoryRepository extends JpaRepository<JobCategory, Long> {
    /**
     * 카테고리 목록 조회 시 하위 카테고리(children)까지 한 번에 조회 (Fetch Join)
     * 계층형 구조에서 N+1 문제를 방지하기 위한 최적화 쿼리입니다.
     */
    @Query("select distinct jc from JobCategory jc " +
            "left join fetch jc.children " +
            "where jc.parent is null " +
            "order by jc.displayOrder asc")
    List<JobCategory> findAllWithChildren();
}