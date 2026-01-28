package min.boot.ats.domain;

import lombok.Getter;
import lombok.RequiredArgsConstructor;

@Getter
@RequiredArgsConstructor
public enum JobStatus {
    DRAFT("임시"),
    OPEN("공개"),
    CLOSED("마감");
    private final String description;
}