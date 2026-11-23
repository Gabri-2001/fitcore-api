/**
 * FitCore plan editor: a RANGE estimate, never an exact predicted session length.
 * "Apagado" (restSeconds === 0) disables the timer, NOT the user's rest.
 * Explicit positive rests remain authoritative; otherwise conservative intervals
 * are inferred only for display (without changing the saved prescription).
 *
 * Default ranges are product assumptions, not personal recommendations.
 * Heavy compounds and individual training preferences can need longer breaks.
 */
(function(root) {
    'use strict';
    const REST_RANGES=Object.freeze({
        COMPOUND:Object.freeze({low:90,high:180}),
        ISOLATION:Object.freeze({low:60,high:120}),
        GENERAL:Object.freeze({low:60,high:180})
    });
    function summarize(exercises=[],unitFor=()=> 'REPETITIONS',options={}) {
        let plannedSets=0,low=0,high=0,quantified=0,missingTargets=false;
        let hasTimedExercise=false,assumedRestPeriods=0,configuredRestPeriods=0;
        const restCategoryFor=typeof options.restCategoryFor==='function'
            ? options.restCategoryFor:()=> 'GENERAL';
        for(const e of exercises) {
            const sets=Number(e.sets);
            if(!Number.isInteger(sets)||sets<1) {missingTargets=true;continue;}
            plannedSets+=sets;
            const timed=unitFor(e.exerciseVariantCode)==='SECONDS';
            if(timed)hasTimedExercise=true;
            const target=Number(timed?e.targetDurationSeconds:e.reps);
            if(!Number.isFinite(target)||target<=0) {
                missingTargets=true;
                continue;
            }
            quantified++;
            if(timed) {
                low+=sets*target;
                high+=sets*target;
            } else {
                // Broad cadence estimate: 2–4 seconds per repetition.
                low+=sets*target*2;
                high+=sets*target*4;
            }
            // No need to rest after the last set of an exercise.
            const pauses=Math.max(0,sets-1);
            if(!pauses)continue;
            const rest=e.restSeconds;
            const specified=rest!=null&&rest!==''&&
                Number.isFinite(Number(rest))&&Number(rest)>0;
            if(specified) {
                low+=pauses*Number(rest);
                high+=pauses*Number(rest);
                configuredRestPeriods+=pauses;
            } else {
                // 0 means the countdown is off, NOT that recovery is instantaneous.
                const group=restCategoryFor(e.exerciseVariantCode);
                const range=REST_RANGES[group]||REST_RANGES.GENERAL;
                low+=pauses*range.low;
                high+=pauses*range.high;
                assumedRestPeriods+=pauses;
                if(rest!=null&&rest!==''&&
                    (!Number.isFinite(Number(rest))||Number(rest)<0))
                    missingTargets=true;
            }
        }
        // Switching exercise: preparation and movement between stations.
        if(quantified>1) {
            low+=(quantified-1)*30;
            high+=(quantified-1)*60;
        }
        const minMinutes=Math.max(1,Math.floor(low/60));
        const maxMinutes=Math.ceil(high/60);
        const durationLabel=!quantified?'—':
            '≈ '+minMinutes+(maxMinutes>minMinutes?'–'+maxMinutes:'')+
            ' min'+(missingTargets?'*':'');
        const assumptions=!quantified
            ? 'Añade ejercicios con objetivos de repeticiones o segundos para estimar la duración.'
            : 'Estimación basada en 2–4 s por repetición y 30–60 s entre ejercicios. '+
              (configuredRestPeriods?'Los descansos configurados se respetan. ':'')+
              (assumedRestPeriods?
                  'Con el temporizador apagado se estiman pausas de 1–3 min '+
                  'según el patrón del ejercicio; no se activa ningún temporizador. ':'')+
              'No incluye calentamiento ni esperas por material o máquinas.'+
              (missingTargets?' Faltan datos en algún ejercicio.':'');
        return {
            exerciseCount:exercises.length,plannedSets,
            hasTimedExercise,missingTargets,
            hasAssumedRest:assumedRestPeriods>0,
            assumedRestPeriods,configuredRestPeriods,
            durationLabel,lowerSeconds:low,upperSeconds:high,
            assumptions
        };
    }
    const api=Object.freeze({summarize});
    if(typeof module!=='undefined'&&module.exports)module.exports=api;
    root.FitCorePlanSummary=api;
})(typeof globalThis!=='undefined'?globalThis:this);
