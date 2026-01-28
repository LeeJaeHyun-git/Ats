package min.boot.ats.domain;

import lombok.Getter;
import lombok.RequiredArgsConstructor;

@Getter
@RequiredArgsConstructor
public enum QuestionType {
    QUESTION("질문형"),
    GUIDE("안내형");

    private final String description;
}