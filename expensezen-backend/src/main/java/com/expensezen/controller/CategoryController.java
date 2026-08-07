package com.expensezen.controller;

import com.expensezen.dto.request.CategoryRequest;
import com.expensezen.dto.response.CategoryResponse;
import com.expensezen.enums.TransactionType;
import com.expensezen.service.CategoryService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/categories")
public class CategoryController {

    private final CategoryService categoryService;

    public CategoryController(
            CategoryService categoryService
    ) {
        this.categoryService = categoryService;
    }

    @PostMapping
    public ResponseEntity<CategoryResponse> create(
            @Valid @RequestBody CategoryRequest request,
            Authentication authentication
    ) {
        CategoryResponse response =
                categoryService.create(
                        authentication.getName(),
                        request
                );

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(response);
    }

    @GetMapping
    public ResponseEntity<List<CategoryResponse>> getAll(
            @RequestParam(required = false)
            TransactionType type,
            Authentication authentication
    ) {
        return ResponseEntity.ok(
                categoryService.getAll(
                        authentication.getName(),
                        type
                )
        );
    }

    @GetMapping("/{categoryId}")
    public ResponseEntity<CategoryResponse> getById(
            @PathVariable Long categoryId,
            Authentication authentication
    ) {
        return ResponseEntity.ok(
                categoryService.getById(
                        authentication.getName(),
                        categoryId
                )
        );
    }

    @PutMapping("/{categoryId}")
    public ResponseEntity<CategoryResponse> update(
            @PathVariable Long categoryId,
            @Valid @RequestBody CategoryRequest request,
            Authentication authentication
    ) {
        return ResponseEntity.ok(
                categoryService.update(
                        authentication.getName(),
                        categoryId,
                        request
                )
        );
    }

    @DeleteMapping("/{categoryId}")
    public ResponseEntity<Void> delete(
            @PathVariable Long categoryId,
            Authentication authentication
    ) {
        categoryService.delete(
                authentication.getName(),
                categoryId
        );

        return ResponseEntity.noContent().build();
    }
}