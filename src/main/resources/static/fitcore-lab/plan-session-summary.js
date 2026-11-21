/**
 * FitCore plan editor: pure calculations for the selected planned session.
 * Rep cadence is a RANGE, never a claimed exact movement duration.
 * Work/rest values are taken only from the user's current plan.
 */
(function(root) {
    'use strict';
    function summarize(exercises=[], unitFor=()=> 'REPETITIONS') {
        let plannedSets=0, low=0, high=0, quantified=0, missingTargets=false;
        let hasTimedExercise=false;
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
                // General estimate: 2–4 s/repetition. Actual tempo varies.
                low+=sets*target*2;
                high+=sets*target*4;
            }
            const rest=e.restSeconds;
            if(rest==null||rest===''||!Number.isFinite(Number(rest))||Number(rest)<0) {
                missingTargets=true;
            } else {
                low+=Math.max(0,sets-1)*Number(rest);
                high+=Math.max(0,sets-1)*Number(rest);
            }
        }
        // Allow 30–60 seconds to change exercises, not for last exercise.
        if(quantified>1) {
            low+=(quantified-1)*30;
            high+=(quantified-1)*60;
        }
        const durationLabel=!quantified?'—':
            '≈ '+Math.max(1,Math.floor(low/60))+
            (Math.ceil(high/60)>Math.max(1,Math.floor(low/60))
                ? '–'+Math.ceil(high/60):'')+' min'+(missingTargets?'*':'');
        return {
            exerciseCount:exercises.length,plannedSets,
            hasTimedExercise,missingTargets,
            durationLabel,
            lowerSeconds:low,upperSeconds:high,
            assumptions:!quantified
                ? 'Añade ejercicios con objetivos de repeticiones o segundos para estimar la duración.'
                : 'Estimación basada en objetivos reales del día, 2–4 s por repetición, '+
                  'descansos entre series y 30–60 s de transición entre ejercicios.'+
                  (missingTargets?' Faltan datos en algún ejercicio.':'')
        };
    }
    const api=Object.freeze({summarize});
    if(typeof module!=='undefined'&&module.exports)module.exports=api;
    root.FitCorePlanSummary=api;
})(typeof globalThis!=='undefined'?globalThis:this);
