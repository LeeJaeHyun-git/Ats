package min.boot.ats.service;

import lombok.RequiredArgsConstructor;
import min.boot.ats.domain.JobCategory;
import min.boot.ats.dto.CategoryRequestDto;
import min.boot.ats.dto.CategoryResponseDto;
import min.boot.ats.repo.JobCategoryRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class CategoryService {

    private final JobCategoryRepository categoryRepository;

    /**
     * [카테고리 등록]
     * 테이블 설계의 parent_id(NUMBER)를 반영하여 계층 구조를 생성합니다.
     */
    @Transactional
    public Long createCategory(CategoryRequestDto dto) {
        JobCategory parent = null;

        // 부모 ID가 전달된 경우, 설계서의 FK 제약조건에 따라 부모 엔티티 존재 여부 확인
        if (dto.getParentId() != null) {
            parent = categoryRepository.findById(dto.getParentId())
                    .orElseThrow(() -> new IllegalArgumentException("존재하지 않는 부모 카테고리입니다."));
        }

        // 수정된 엔티티 빌더를 사용하여 parent 객체 직접 주입 (컴파일 에러 해결)
        JobCategory category = JobCategory.builder()
                .name(dto.getName())
                .displayOrder(dto.getDisplayOrder())
                .parent(parent)
                .build();

        return categoryRepository.save(category).getId();
    }

    /**
     * [전체 카테고리 계층 조회]
     * 최상위 카테고리(parent_id IS NULL)부터 자식 노드까지 재귀적으로 조회합니다.
     */
    public List<CategoryResponseDto> getAllCategories() {
        // 기존 findByParentIsNull... 대신 fetch join이 적용된 메서드 호출
        return categoryRepository.findAllWithChildren().stream()
                .map(CategoryResponseDto::new)
                .collect(Collectors.toList());
    }

    /**
     * [카테고리 수정]
     * 설계서에 정의된 name(VARCHAR2 50)과 display_order(NUMBER)를 수정합니다.
     */
    @Transactional
    public void updateCategory(Long id, CategoryRequestDto dto) {
        JobCategory category = categoryRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("해당 카테고리를 찾을 수 없습니다."));

        // 엔티티 내 비즈니스 메서드 호출 (Dirty Checking 반영)
        category.updateInfo(dto.getName(), dto.getDisplayOrder());

        if (dto.getParentId() != null) {
            if (dto.getParentId().equals(category.getId())) {
                throw new IllegalArgumentException("자기 자신을 부모로 설정할 수 없습니다.");
            }

            JobCategory newParent = categoryRepository.findById(dto.getParentId())
                    .orElseThrow(() -> new IllegalArgumentException("부모 카테고리 없음"));

            category.setParent(newParent);
        }

    }

    /**
     * [카테고리 삭제]
     * 테이블 설계상 자식 카테고리가 있다면 처리가 필요합니다.
     * (현재 엔티티 설정: CascadeType.ALL에 의해 자식도 함께 삭제됨)
     */
    @Transactional
    public void deleteCategory(Long id) {
        JobCategory category = categoryRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("삭제할 카테고리가 존재하지 않습니다."));

        categoryRepository.delete(category);
    }
}