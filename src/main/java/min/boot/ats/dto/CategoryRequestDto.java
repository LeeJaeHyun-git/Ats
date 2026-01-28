package min.boot.ats.dto;

import lombok.*;

@Getter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CategoryRequestDto {

    private String name;            // 카테고리명 (VARCHAR2 50)
    private Long parentId;          // 부모 카테고리 ID (설계서의 parent_id 매핑, Nullable)
    private Integer displayOrder;   // 정렬 순서 (설계서의 display_order 매핑)

}