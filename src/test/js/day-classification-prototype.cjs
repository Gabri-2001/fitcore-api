'use strict';

/**
 * PROTOTYPE ONLY. Does not determine persisted dayType in FitCore.
 * A descriptive, configurable heuristic based on primary exercise groups,
 * prescribed sets and movement patterns. It is not an EMG or hypertrophy score.
 */
const UPPER=new Set(['CHEST','BACK','SHOULDERS','BICEPS','TRICEPS','FOREARMS','SCAPULAR','ROTATOR_CUFF','NECK']);
const LOWER=new Set(['QUADRICEPS','HAMSTRINGS','GLUTES','ADDUCTORS','CALVES']);
const PUSH=new Set(['HORIZONTAL_PUSH','VERTICAL_PUSH','ELBOW_EXTENSION','SHOULDER_ABDUCTION','SHOULDER_FLEXION']);
const PULL=new Set(['HORIZONTAL_PULL','VERTICAL_PULL','ELBOW_FLEXION','SCAPULAR_RETRACTION_DEPRESSION']);
const BIG_LOWER=new Set(['SQUAT','HIP_HINGE','LUNGE','HIP_EXTENSION','KNEE_EXTENSION','KNEE_FLEXION']);
const CORE=new Set(['TRUNK_FLEXION','TRUNK_ROTATION','ANTI_EXTENSION','ANTI_ROTATION','ANTI_LATERAL_FLEXION','HIP_TRUNK_FLEXION']);

function classifyDay(items, catalog) {
  if(!Array.isArray(items))throw new TypeError('items must be an array');
  const known=new Map(catalog.variants.map(v=>[v.code,v]));
  const groups={},patterns={};
  let total=0,upper=0,lower=0,core=0,condition=0,unknown=0,validExercises=0;
  let pushes=0,pulls=0;
  const strengthFamilies=new Set(),movementFamilies=new Set();
  for(const item of items){
    const sets=Number(item.sets);
    if(!Number.isInteger(sets)||sets<1||sets>30)continue;
    const v=known.get(item.code);
    if(!v){unknown+=sets;continue;}
    validExercises++;total+=sets;
    groups[v.group]=(groups[v.group]||0)+sets;
    patterns[v.pattern]=(patterns[v.pattern]||0)+sets;
    if(UPPER.has(v.group))upper+=sets;
    if(LOWER.has(v.group))lower+=sets;
    if(v.group==='CORE')core+=sets;
    if(v.group==='FULL_BODY'||v.pattern==='FULL_BODY_CONDITIONING')condition+=sets;
    if(PUSH.has(v.pattern)) pushes+=sets;
    if(PULL.has(v.pattern)) pulls+=sets;
    if(v.group!=='CORE'&&v.group!=='FULL_BODY')strengthFamilies.add(v.family);
    movementFamilies.add(v.pattern);
  }
  const data={totalSets:total,unknownSets:unknown,upperSets:upper,lowerSets:lower,
    coreSets:core,conditioningSets:condition,groupSets:groups,patternSets:patterns,
    confidence:'low',structure:'UNDETERMINED',focus:[],provisional:false,
    reasons:[]};
  if(unknown>0){
    data.reasons.push('Hay ejercicios sin metadatos del catálogo');
    data.provisional=true;
  }
  if(!total){data.reasons.push('No hay ejercicios válidos');return data;}
  const eligible=upper+lower;
  const entries=Object.entries(groups).filter(([g])=>g!=='CORE'&&g!=='FULL_BODY')
    .sort((a,b)=>b[1]-a[1]||a[0].localeCompare(b[0]));
  const prominent=entries.filter(([g,n])=>n>=3&&n/Math.max(1,eligible)>=0.2).slice(0,2);
  data.focus=prominent.map(([g])=>g);
  const insufficient=validExercises<2||total<6;
  if(insufficient){data.provisional=true;data.reasons.push('Muestra insuficiente: mínimo 2 ejercicios y 6 series');}
  if(condition>=Math.max(4,total*.6)){
    data.structure='CONDITIONING';
  }else if(core>=Math.max(4,total*.65)&&upper+lower<=core*.5){
    data.structure='CORE';
  }else if(eligible===0){
    data.structure='MIXED';
  }else if(upper>=4&&lower>=4&&upper/eligible>=.25&&lower/eligible>=.25
    &&((patterns.SQUAT||0)+(patterns.HIP_HINGE||0)+(patterns.HIP_EXTENSION||0))>=3
    &&pushes+pulls>=3){
    data.structure='FULL_BODY';
  }else if(lower/eligible>=.7){
    data.structure='LOWER';
  }else if(upper/eligible>=.7){
    const arms=(groups.BICEPS||0)+(groups.TRICEPS||0);
    const compoundUpper=pushes+pulls-(groups.BICEPS||0)-(groups.TRICEPS||0);
    if(arms/upper>=.7&&(groups.BICEPS||0)>=3&&(groups.TRICEPS||0)>=3
      &&compoundUpper<=upper*.3){
      data.structure='ARMS';
    }else if(pushes>=3&&pulls>=3
      &&(groups.CHEST||0)+(groups.SHOULDERS||0)>=3&&(groups.BACK||0)>=3
      &&Math.min(pushes,pulls)/Math.max(pushes,pulls)>=.45){
      data.structure='UPPER';
    }else if(pushes>=4&&pushes/Math.max(1,pushes+pulls)>=.75
       &&(groups.CHEST||0)+(groups.SHOULDERS||0)+(groups.TRICEPS||0)>=upper*.7){
      data.structure='PUSH';
    }else if(pulls>=4&&pulls/Math.max(1,pushes+pulls)>=.75
       &&(groups.BACK||0)+(groups.BICEPS||0)+(groups.SCAPULAR||0)>=upper*.65){
      data.structure='PULL';
    }else{
      data.structure='UPPER';
    }
  }else{
    data.structure='MIXED';
  }
  if(insufficient)data.confidence='low';
  else if(unknown)data.confidence='low';
  else if(data.structure==='MIXED')data.confidence='low';
  else data.confidence='medium';
  if((data.structure==='UPPER'||data.structure==='LOWER')&&data.focus.length===1
     &&entries.length&&entries[0][1]/Math.max(1,eligible)>=.65){
    data.reasons.push('Una región domina las series directas');
  }
  // Resist false certainty when one of the two regions is represented by one exercise.
  if(data.structure==='FULL_BODY'&&
    (items.filter(item=>known.get(item.code)&&UPPER.has(known.get(item.code).group)).length<2
     ||items.filter(item=>known.get(item.code)&&LOWER.has(known.get(item.code).group)).length<2)){
    data.provisional=true;data.reasons.push('Cuerpo completo con poca diversidad regional');
  }
  return data;
}
module.exports={classifyDay,UPPER,LOWER,PUSH,PULL};
