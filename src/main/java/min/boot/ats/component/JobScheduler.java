package min.boot.ats.component;

import lombok.RequiredArgsConstructor;
import min.boot.ats.service.JobService;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class JobScheduler {
    private final JobService jobService;

    @Scheduled(cron = "0 * * * * *") // 매 분 정각에 실행
    public void autoCloseExpiredJobs() {
        jobService.closeExpiredJobs();
    }
}