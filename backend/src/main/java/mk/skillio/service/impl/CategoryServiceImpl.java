package mk.skillio.service.impl;

import lombok.NoArgsConstructor;
import lombok.RequiredArgsConstructor;
import mk.skillio.dto.CategoryResponse;
import mk.skillio.repository.CategoryRepository;
import mk.skillio.service.CategoryService;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class CategoryServiceImpl implements CategoryService {

    private final CategoryRepository categoryRepository;

    @Override
    @Transactional(readOnly = true)
    public List<CategoryResponse> getAll() {
        return categoryRepository.findAll(Sort.by("name")).stream().map(c-> new CategoryResponse(c.getId(),c.getName())).toList();

    }
}
