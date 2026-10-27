package mk.skillio.controller;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import mk.skillio.dto.ProjectRequest;
import mk.skillio.dto.ProjectResponse;
import mk.skillio.service.ProjectService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/profile/projects")
@RequiredArgsConstructor
public class ProjectController {

    private final ProjectService projectService;
    @GetMapping
    public List<ProjectResponse> getMyProjects(Authentication authentication) {
        return projectService.getMyProjects(authentication.getName());

    }
    @PostMapping
    public ResponseEntity<ProjectResponse> create(Authentication authentication,@Valid @RequestBody ProjectRequest request) {
        ProjectResponse response=projectService.create(authentication.getName(),request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }
    @PutMapping("/{projectId}")
    public ProjectResponse update(Authentication authentication,@PathVariable Long projectId,@Valid @RequestBody ProjectRequest request){
        return projectService.update(authentication.getName(), projectId,request);
    }
    @DeleteMapping("/{projectId}")
    public ResponseEntity<Void> delete(Authentication authentication, @PathVariable Long projectId){
        projectService.delete(authentication.getName(), projectId);
        return ResponseEntity.noContent().build();
    }
}
