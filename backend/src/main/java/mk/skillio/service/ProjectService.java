package mk.skillio.service;

import mk.skillio.dto.ProjectRequest;
import mk.skillio.dto.ProjectResponse;
import mk.skillio.model.Project;

import java.util.List;

public interface ProjectService {

    List<ProjectResponse> getMyProjects(String email);
    ProjectResponse create(String email, ProjectRequest request);
    ProjectResponse update(String email,Long projectId,ProjectRequest request);
    void delete(String email,Long projectId);
}
