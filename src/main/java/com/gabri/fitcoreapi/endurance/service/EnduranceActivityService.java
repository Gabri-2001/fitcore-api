package com.gabri.fitcoreapi.endurance.service;

import com.gabri.fitcoreapi.common.exception.BusinessRuleException;
import com.gabri.fitcoreapi.common.exception.ResourceNotFoundException;
import com.gabri.fitcoreapi.endurance.domain.EnduranceActivity;
import com.gabri.fitcoreapi.endurance.domain.EnduranceLap;
import com.gabri.fitcoreapi.endurance.dto.CreateEnduranceActivityRequest;
import com.gabri.fitcoreapi.endurance.repository.EnduranceActivityRepository;
import com.gabri.fitcoreapi.user.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.math.BigDecimal;
import java.util.HashSet;
import java.util.List;

@Service @Transactional
public class EnduranceActivityService {
    private final EnduranceActivityRepository activities;
    private final UserRepository users;
    public EnduranceActivityService(EnduranceActivityRepository activities,UserRepository users) {
        this.activities=activities;this.users=users;
    }
    public EnduranceActivity createManual(Long userId,CreateEnduranceActivityRequest request) {
        var user=users.findById(userId)
            .orElseThrow(()->new ResourceNotFoundException("User not found"));
        if(request.elapsedSeconds()<request.movingSeconds())
            throw new BusinessRuleException("Elapsed time cannot be shorter than moving time");
        var activity=new EnduranceActivity(user,request.activityType(),request.startedAt(),
            request.elapsedSeconds(),request.movingSeconds(),request.distanceMeters(),
            request.elevationGainMeters(),request.averageHeartRate(),
            request.averageCadence(),request.averagePowerWatts(),request.notes());
        var seen=new HashSet<Integer>();
        for(var lap:request.laps()==null?List.<CreateEnduranceActivityRequest.EnduranceLapRequest>of():request.laps()) {
            if(!seen.add(lap.lapNumber()))
                throw new BusinessRuleException("Duplicate lap number");
            activity.addLap(new EnduranceLap(lap.lapNumber(),lap.distanceMeters(),
                lap.durationSeconds(),lap.averageHeartRate()));
        }
        return activities.save(activity);
    }
    @Transactional(readOnly=true)
    public List<EnduranceActivity> list(Long userId) {
        if(!users.existsById(userId))throw new ResourceNotFoundException("User not found");
        return activities.findByUserIdOrderByStartedAtDesc(userId);
    }
    @Transactional(readOnly=true)
    public EnduranceActivity find(Long userId,Long id) {
        return activities.findByIdAndUserId(id,userId)
            .orElseThrow(()->new ResourceNotFoundException("Activity not found"));
    }
    public void delete(Long userId,Long id) {
        activities.delete(find(userId,id));
    }
}
