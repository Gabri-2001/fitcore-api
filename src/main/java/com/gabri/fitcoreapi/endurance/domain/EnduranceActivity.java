package com.gabri.fitcoreapi.endurance.domain;

import com.gabri.fitcoreapi.common.model.BaseEntity;
import com.gabri.fitcoreapi.user.domain.User;
import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.Instant;
import java.util.ArrayList;
import java.util.List;

@Entity @Table(name="endurance_activities")
public class EnduranceActivity extends BaseEntity {
    @ManyToOne(fetch=FetchType.LAZY,optional=false)
    @JoinColumn(name="user_id",nullable=false) private User user;
    @Column(name="activity_type",nullable=false,length=32) private String activityType;
    @Column(nullable=false,length=24) private String source="MANUAL";
    @Column(name="external_activity_id",length=180) private String externalActivityId;
    @Column(name="started_at",nullable=false) private Instant startedAt;
    @Column(name="elapsed_seconds",nullable=false) private int elapsedSeconds;
    @Column(name="moving_seconds",nullable=false) private int movingSeconds;
    @Column(name="distance_meters",nullable=false,precision=12,scale=2) private BigDecimal distanceMeters;
    @Column(name="elevation_gain_meters",precision=10,scale=2) private BigDecimal elevationGainMeters;
    @Column(name="average_heart_rate") private Integer averageHeartRate;
    @Column(name="average_cadence") private Integer averageCadence;
    @Column(name="average_power_watts") private Integer averagePowerWatts;
    @Column(length=1500) private String notes;
    @OneToMany(mappedBy="activity",cascade=CascadeType.ALL,orphanRemoval=true)
    @OrderBy("lapNumber ASC") private List<EnduranceLap> laps=new ArrayList<>();
    protected EnduranceActivity(){}
    public EnduranceActivity(User user,String activityType,Instant startedAt,int elapsedSeconds,
            int movingSeconds,BigDecimal distanceMeters,BigDecimal elevationGainMeters,
            Integer averageHeartRate,Integer averageCadence,Integer averagePowerWatts,String notes) {
        this.user=user;this.activityType=activityType;this.startedAt=startedAt;
        this.elapsedSeconds=elapsedSeconds;this.movingSeconds=movingSeconds;
        this.distanceMeters=distanceMeters;this.elevationGainMeters=elevationGainMeters;
        this.averageHeartRate=averageHeartRate;this.averageCadence=averageCadence;
        this.averagePowerWatts=averagePowerWatts;this.notes=notes;
    }
    public void addLap(EnduranceLap lap){laps.add(lap);lap.setActivity(this);}
    public String getActivityType(){return activityType;}
    public String getSource(){return source;}
    public String getExternalActivityId(){return externalActivityId;}
    public Instant getStartedAt(){return startedAt;}
    public int getElapsedSeconds(){return elapsedSeconds;}
    public int getMovingSeconds(){return movingSeconds;}
    public BigDecimal getDistanceMeters(){return distanceMeters;}
    public BigDecimal getElevationGainMeters(){return elevationGainMeters;}
    public Integer getAverageHeartRate(){return averageHeartRate;}
    public Integer getAverageCadence(){return averageCadence;}
    public Integer getAveragePowerWatts(){return averagePowerWatts;}
    public String getNotes(){return notes;}
    public List<EnduranceLap> getLaps(){return laps;}
}
