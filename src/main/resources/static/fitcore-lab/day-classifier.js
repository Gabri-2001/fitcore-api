/* FitCore day classification v1. Pure, deterministic, API-first compatible. */
(function(root,factory){
    const api=factory();
    if(typeof module==='object' && module.exports) module.exports=api;
    else root.FitCoreDayClassifier=api;
})(typeof globalThis!=='undefined'?globalThis:this,function(){
    'use strict';
    const UPPER=new Set(['CHEST','BACK','SHOULDERS','BICEPS','TRICEPS','FOREARMS','SCAPULAR','ROTATOR_CUFF','NECK']);
    const LOWER=new Set(['QUADRICEPS','HAMSTRINGS','GLUTES','ADDUCTORS','CALVES']);
    const PUSH=new Set(['HORIZONTAL_PUSH','VERTICAL_PUSH','ELBOW_EXTENSION','SHOULDER_ABDUCTION','SHOULDER_FLEXION']);
    const PULL=new Set(['HORIZONTAL_PULL','VERTICAL_PULL','ELBOW_FLEXION','SCAPULAR_RETRACTION_DEPRESSION']);
    const NAMES={CHEST:'Pecho',BACK:'Espalda',SHOULDERS:'Hombros',BICEPS:'Bíceps',
        TRICEPS:'Tríceps',FOREARMS:'Antebrazos',SCAPULAR:'Escápulas',ROTATOR_CUFF:'Manguito rotador',
        QUADRICEPS:'Cuádriceps',HAMSTRINGS:'Isquiotibiales',GLUTES:'Glúteos',ADDUCTORS:'Aductores',
        CALVES:'Gemelos',CORE:'Core',NECK:'Cuello',FULL_BODY:'Cuerpo completo'};
    const STRUCTURE={PUSH:'Empuje',PULL:'Tirón',UPPER:'Torso',LOWER:'Tren inferior',
        LEGS:'Piernas',FULL_BODY:'Cuerpo completo',ARMS:'Brazos',CORE:'Core',
        CONDITIONING:'Acondicionamiento',MIXED:'Mixto',CARDIO:'Cardio',
        MOBILITY:'Movilidad',REST:'Descanso'};
    const VALID=new Set([...UPPER,...LOWER,'CORE','FULL_BODY']);
    const count=(map,key)=>map[key]||0;
    // One family gets at most one role per exercise, even with many anatomical heads.
    function aggregateMuscleFamilies(activations){
        const byGroup=new Map();
        const rank={PRIMARY:2,SECONDARY:1,STABILIZER:0};
        for(const item of activations||[]){
            if(!VALID.has(item.muscleGroup)||!Object.hasOwn(rank,item.role))continue;
            const prior=byGroup.get(item.muscleGroup);
            if(!prior||rank[item.role]>rank[prior])byGroup.set(item.muscleGroup,item.role);
        }
        return Object.fromEntries(byGroup);
    }
    function classify(items){
        const groups={},estimated={},patterns={},families={};
        let upper=0,lower=0,core=0,conditioning=0,knownSets=0,missingSets=0;
        let pushes=0,pulls=0,knownExercises=0,missingEvidence=0;
        for(const item of items||[]){
            const sets=Number(item.sets);
            if(!Number.isInteger(sets)||sets<1||sets>30)continue;
            if(!VALID.has(item.group)||!item.pattern){missingSets+=sets;continue;}
            knownSets+=sets;knownExercises++;
            groups[item.group]=count(groups,item.group)+sets;
            patterns[item.pattern]=count(patterns,item.pattern)+sets;
            if(UPPER.has(item.group))upper+=sets;
            if(LOWER.has(item.group))lower+=sets;
            if(item.group==='CORE')core+=sets;
            if(item.group==='FULL_BODY')conditioning+=sets;
            if(PUSH.has(item.pattern))pushes+=sets;
            if(PULL.has(item.pattern))pulls+=sets;
            const roles=aggregateMuscleFamilies(item.activations);
            if(!Array.isArray(item.activations)||item.activations.length===0)missingEvidence+=sets;
            // Main exercise family always gets 1 direct series. Other muscle
            // groups contribute at most 0.5 indirect units, not another full set.
            estimated[item.group]=count(estimated,item.group)+sets;
            for(const [group,role] of Object.entries(roles)){
                if(group===item.group||role==='STABILIZER')continue;
                estimated[group]=count(estimated,group)+sets*0.5;
            }
            families[item.family||item.code||item.group]=true;
        }
        const all=knownSets+missingSets,eligible=upper+lower;
        const result={structure:null,focus:[],confidence:'low',provisional:true,
            coverage:all?knownSets/all:0,knownSets,missingSets,missingEvidence,
            directSets:groups,estimatedSets:estimated,patterns,reasons:[]};
        if(!knownSets){result.reasons.push('Sin ejercicios válidos');return result;}
        if(missingSets)result.reasons.push('Faltan datos de uno o más ejercicios');
        if(missingEvidence)result.reasons.push('Activaciones anatómicas incompletas: estimación conservadora');
        if(knownExercises<2||knownSets<6)result.reasons.push('Pocos ejercicios o series');
        if(conditioning>=Math.max(4,knownSets*.6))result.structure='CONDITIONING';
        else if(core>=Math.max(4,knownSets*.65)&&eligible<=core*.5)result.structure='CORE';
        else if(upper>=4&&lower>=4&&upper/eligible>=.25&&lower/eligible>=.25
            &&count(patterns,'SQUAT')+count(patterns,'HIP_HINGE')+count(patterns,'HIP_EXTENSION')>=3
            &&pushes+pulls>=3)result.structure='FULL_BODY';
        else if(eligible&&lower/eligible>=.7)result.structure='LOWER';
        else if(eligible&&upper/eligible>=.7){
            const arms=count(groups,'BICEPS')+count(groups,'TRICEPS');
            const compound=pushes+pulls-arms;
            if(arms/upper>=.7&&count(groups,'BICEPS')>=3&&count(groups,'TRICEPS')>=3&&compound<=upper*.3)
                result.structure='ARMS';
            else if(pushes>=3&&pulls>=3&&count(groups,'BACK')>=3
                &&count(groups,'CHEST')+count(groups,'SHOULDERS')>=3
                &&Math.min(pushes,pulls)/Math.max(pushes,pulls)>=.45)result.structure='UPPER';
            else if(pushes>=4&&count(patterns,'HORIZONTAL_PUSH')+count(patterns,'VERTICAL_PUSH')>=3
                &&pushes/Math.max(1,pushes+pulls)>=.75
                &&count(groups,'CHEST')+count(groups,'SHOULDERS')+count(groups,'TRICEPS')>=upper*.7)
                result.structure='PUSH';
            else if(pulls>=4&&count(patterns,'HORIZONTAL_PULL')+count(patterns,'VERTICAL_PULL')>=3
                &&pulls/Math.max(1,pushes+pulls)>=.75
                &&count(groups,'BACK')+count(groups,'BICEPS')+count(groups,'SCAPULAR')>=upper*.65)
                result.structure='PULL';
            else result.structure='UPPER';
        }else result.structure='MIXED';
        const groupRank=Object.entries(groups).filter(([g])=>g!=='CORE'&&g!=='FULL_BODY')
            .sort((a,b)=>b[1]-a[1]||a[0].localeCompare(b[0]));
        const eligiblePrimary=Math.max(1,eligible);
        result.focus=groupRank.filter(([_,n])=>n>=3&&n/eligiblePrimary>=.2)
            .slice(0,2).map(([group])=>group);
        if(result.structure==='CORE')result.focus=['CORE'];
        if(knownSets<6||knownExercises<2||result.coverage<1||result.structure==='MIXED')return result;
        const distinctUpper=(items||[]).filter(e=>UPPER.has(e.group)&&e.sets>0).length;
        const distinctLower=(items||[]).filter(e=>LOWER.has(e.group)&&e.sets>0).length;
        if(result.structure==='FULL_BODY'&&(distinctUpper<2||distinctLower<2)){
            result.reasons.push('Poca diversidad entre tren superior e inferior');
            return result;
        }
        result.confidence=missingEvidence?'medium':'high';
        result.provisional=false;
        return result;
    }
    function describe(result){
        if(!result||!result.structure)return 'Sin clasificación todavía';
        const structure=STRUCTURE[result.structure]||result.structure;
        if(result.structure==='CORE'||result.structure==='CONDITIONING')return structure;
        const direct=result.directSets||{};
        const focus=result.focus||[];
        const eligible=Object.entries(direct).reduce((s,[g,n])=>s+(UPPER.has(g)||LOWER.has(g)?n:0),0);
        if(focus.length===1&&eligible&&count(direct,focus[0])/eligible>=.65)
            return structure+' · predominio de '+(NAMES[focus[0]]||focus[0]).toLowerCase();
        if(focus.length===2&&result.structure==='ARMS')return 'Brazos · bíceps y tríceps';
        if(focus.length===2&&result.structure==='LOWER')
            return structure+' · '+focus.map(g=>NAMES[g]||g).join(' y ');
        return structure;
    }
    return {classify,describe,aggregateMuscleFamilies,STRUCTURE,NAMES};
});
