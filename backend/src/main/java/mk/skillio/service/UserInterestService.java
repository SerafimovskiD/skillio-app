package mk.skillio.service;

import mk.skillio.dto.InterestResponse;

import java.util.List;

public interface UserInterestService {

    List<InterestResponse> getMyInterests(String email);
    InterestResponse addInterest(String email,Long categoryId);
    void removeInterest(String email,Long categoryId);


}
