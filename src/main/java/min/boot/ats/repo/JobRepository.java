package min.boot.ats.repo;

import min.boot.ats.domain.Job;
import min.boot.ats.domain.JobStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface JobRepository extends JpaRepository<Job, Long>, JobRepositoryCustom {

    List<Job> findByCreatedById(Long userId);

    @Modifying(clearAutomatically = true) // 연산 후 1차 캐시 비우기
    @Query("UPDATE Job j SET j.status = :targetStatus " +
            "WHERE j.status = :currentStatus AND j.deadline < :now")
    int updateStatusForExpiredJobs(
            @Param("targetStatus") JobStatus targetStatus,
            @Param("currentStatus") JobStatus currentStatus,
            @Param("now") LocalDateTime now
    );

    @EntityGraph(attributePaths = {"company", "category"})
    Page<Job> findByStatus(JobStatus status, Pageable pageable);

    @Query("SELECT j FROM Job j LEFT JOIN FETCH j.category WHERE j.id = :id")
    Optional<Job> findByIdWithDetails(@Param("id") Long id);

}