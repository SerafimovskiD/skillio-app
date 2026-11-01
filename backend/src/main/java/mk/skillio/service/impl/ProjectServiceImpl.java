package mk.skillio.service.impl;

import lombok.RequiredArgsConstructor;
import mk.skillio.ai.EmbeddingRefreshEvent;
import mk.skillio.dto.ProjectRequest;
import mk.skillio.dto.ProjectResponse;
import mk.skillio.exception.ResourceNotFoundException;
import mk.skillio.model.Project;
import mk.skillio.model.User;
import mk.skillio.repository.ProjectRepository;
import mk.skillio.repository.UserRepository;
import mk.skillio.service.ProjectService;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class ProjectServiceImpl implements ProjectService {

    private final UserRepository userRepository;
    private final ProjectRepository projectRepository;
    private final ApplicationEventPublisher eventPublisher;

    @Override
    @Transactional(readOnly = true)
    public List<ProjectResponse> getMyProjects(String email) {
        User user = findUser(email);
        return projectRepository.findByUserId(user.getId()).stream()
                .map(this::toResponse).toList();
    }

    @Override
    @Transactional
    public ProjectResponse create(String email, ProjectRequest request) {
        User user = findUser(email);
        Project project = new Project();
        project.setUser(user);
        apply(project, request);
        Project saved = projectRepository.save(project);
        eventPublisher.publishEvent(EmbeddingRefreshEvent.student(user.getId()));
        return toResponse(saved);
    }

    @Override
    @Transactional
    public ProjectResponse update(String email, Long projectId, ProjectRequest request) {
        Project project = findOwnedProject(email, projectId);
        apply(project, request);
        eventPublisher.publishEvent(EmbeddingRefreshEvent.student(project.getUser().getId()));
        return toResponse(project);
    }

    @Override
    @Transactional
    public void delete(String email, Long projectId) {
        Project project = findOwnedProject(email, projectId);
        Long userId = project.getUser().getId();
        projectRepository.delete(project);
        eventPublisher.publishEvent(EmbeddingRefreshEvent.student(userId));
    }

    private User findUser(String email) {
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
    }

    // Проектот мора да му припаѓа на најавениот корисник, иначе 404
    private Project findOwnedProject(String email, Long projectId) {
        User user = findUser(email);
        return projectRepository.findByIdAndUserId(projectId, user.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Project not found"));
    }

    private void apply(Project project, ProjectRequest request) {
        project.setTitle(request.title().trim());
        project.setDescription(request.description());
        project.setLink(request.link());
    }

    private ProjectResponse toResponse(Project project) {
        return new ProjectResponse(
                project.getId(),
                project.getTitle(),
                project.getDescription(),
                project.getLink()
        );
    }
}