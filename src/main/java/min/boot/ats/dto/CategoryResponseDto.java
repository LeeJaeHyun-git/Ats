package min.boot.ats.dto;

import lombok.Getter;
import min.boot.ats.domain.JobCategory;
import java.util.List;
import java.util.stream.Collectors;

@Getter
public class CategoryResponseDto {

    private Long id;
    private String name;
    private Integer displayOrder;
    private Long parentId;
    private List<CategoryResponseDto> children; // 하위 카테고리 목록 (계층형 구조 대응)

    public CategoryResponseDto(JobCategory category) {
        this.id = category.getId();
        this.name = category.getName();
        this.displayOrder = category.getDisplayOrder();

        // 부모 카테고리가 존재할 경우 ID만 추출
        if (category.getParent() != null) {
            this.parentId = category.getParent().getId();
        }

        // 하위 카테고리들을 DTO로 재귀적 변환 (Entity의 하위 목록 필드명이 children인 경우)
        if (category.getChildren() != null) {
            this.children = category.getChildren().stream()
                    .map(CategoryResponseDto::new)
                    .collect(Collectors.toList());
        }
    }
}