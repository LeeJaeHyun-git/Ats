package min.boot.ats.control;

import lombok.RequiredArgsConstructor;
import min.boot.ats.dto.CompanyRequestDto;
import min.boot.ats.dto.CompanyResponseDto;
import min.boot.ats.service.CompanyService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/companies")
@RequiredArgsConstructor
public class CompanyController {

    private final CompanyService companyService;

    @PostMapping
    public ResponseEntity<Long> createCompany(@RequestBody CompanyRequestDto dto) {
        return ResponseEntity.ok(companyService.registerCompany(dto));
    }

    @GetMapping("/{companyId}")
    public ResponseEntity<CompanyResponseDto> getCompany(@PathVariable Long companyId) {
        return ResponseEntity.ok(companyService.getCompanyWithUsers(companyId));
    }

    @PutMapping("/{companyId}")
    public ResponseEntity<Void> updateCompany(@PathVariable Long companyId,
                                              @RequestBody CompanyRequestDto dto) {
        companyService.updateCompany(companyId, dto);
        return ResponseEntity.ok().build();
    }

    @DeleteMapping("/{companyId}")
    public ResponseEntity<Void> deleteCompany(@PathVariable Long companyId) {
        companyService.deleteCompany(companyId);
        return ResponseEntity.ok().build();
    }

    @GetMapping
    public ResponseEntity<List<CompanyResponseDto>> getAllCompanies() {
        return ResponseEntity.ok(companyService.getAllCompanies());
    }

}
