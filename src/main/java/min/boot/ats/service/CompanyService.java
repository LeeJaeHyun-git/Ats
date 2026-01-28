package min.boot.ats.service;

import lombok.RequiredArgsConstructor;
import min.boot.ats.domain.Company;
import min.boot.ats.dto.CompanyRequestDto;
import min.boot.ats.dto.CompanyResponseDto;
import min.boot.ats.repo.CompanyRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class CompanyService {

    private final CompanyRepository companyRepository;

    /**
     * [기업 등록]
     * 테이블 설계: id(IDENTITY), name(NOT NULL)만 반영
     */
    @Transactional
    public Long registerCompany(CompanyRequestDto dto) {
        // 기업명 중복 체크
        companyRepository.findByName(dto.getName())
                .ifPresent(c -> { throw new IllegalArgumentException("이미 존재하는 기업 이름입니다."); });

        Company company = Company.builder()
                .name(dto.getName())
                .build();

        return companyRepository.save(company).getId();
    }

    /**
     * [기업 정보 수정]
     * 테이블 설계상 수정 가능한 필드는 'name'뿐입니다.
     */
    @Transactional
    public void updateCompany(Long companyId, CompanyRequestDto dto) {
        Company company = companyRepository.findById(companyId)
                .orElseThrow(() -> new IllegalArgumentException("기업 정보를 찾을 수 없습니다."));

        // 엔티티의 changeName 메서드 호출
        company.changeName(dto.getName());
    }

    /**
     * [기업 상세 조회]
     * Fetch Join을 사용하는 리포지토리 메서드 활용
     */
    public CompanyResponseDto getCompanyWithUsers(Long companyId) {
        Company company = companyRepository.findByIdWithUsers(companyId)
                .orElseThrow(() -> new IllegalArgumentException("기업 정보를 찾을 수 없습니다."));

        return new CompanyResponseDto(company);
    }

    /**
     * [기업 삭제]
     */
    @Transactional
    public void deleteCompany(Long companyId) {
        Company company = companyRepository.findById(companyId)
                .orElseThrow(() -> new IllegalArgumentException("삭제할 기업이 존재하지 않습니다."));

        companyRepository.delete(company);
    }

    public List<CompanyResponseDto> getAllCompanies() {
        return companyRepository.findAll().stream()
                .map(CompanyResponseDto::new)
                .collect(Collectors.toList());
    }
}