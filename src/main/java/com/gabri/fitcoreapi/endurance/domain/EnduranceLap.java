package com.gabri.fitcoreapi.endurance.domain;

import com.gabri.fitcoreapi.common.model.BaseEntity;
import jakarta.persistence.*;
import java.math.BigDecimal;

@Entity @Table(name="endurance_laps")
public class EnduranceLap extends BaseEntity {
    @ManyToOne(fetch=FetchType.LAZY,optional=false)
    @JoinColumn(name="activity_id",nullable=false) private EnduranceActivity activity;
    @Column(name="lap_number",nullable=false) private int lapNumber;
    @Column(name="distance_meters",nullable=false,precision=12,scale=2) private BigDecimal distanceMeters;
    @Column(name="duration_seconds",nullable=false) private int durationSeconds;
    @Column(name="average_heart_rate") private Integer averageHeartRate;
    protected EnduranceLap(){}
    public EnduranceLap(int lapNumber,BigDecimal distanceMeters,int durationSeconds,Integer averageHeartRate){
        this.lapNumber=lapNumber;this.distanceMeters=distanceMeters;
        this.durationSeconds=durationSeconds;this.averageHeartRate=averageHeartRate;
    }
    public void setActivity(EnduranceActivity activity){this.activity=activity;}
    public int getLapNumber(){return lapNumber;}
    public BigDecimal getDistanceMeters(){return distanceMeters;}
    public int getDurationSeconds(){return durationSeconds;}
    public Integer getAverageHeartRate(){return averageHeartRate;}
}
