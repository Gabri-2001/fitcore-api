// FitCore: pure, modality-specific progress series. No fake or interpolated values.
(function(root){
'use strict';
const specs=[
    {id:'repsBody',label:'Repeticiones · peso corporal',unit:'reps',field:'reps',mode:'BODYWEIGHT'},
    {id:'repsWeighted',label:'Repeticiones · lastradas',unit:'reps',field:'reps',mode:'WEIGHTED'},
    {id:'repsAssisted',label:'Repeticiones · asistidas',unit:'reps',field:'reps',mode:'ASSISTED'},
    {id:'repsExternal',label:'Repeticiones · carga externa',unit:'reps',field:'reps',mode:'EXTERNAL_LOAD'},
    {id:'seconds',label:'Tiempo sostenido',unit:'s',field:'durationSeconds'},
    {id:'weight',label:'Carga externa',unit:'kg',field:'weight',mode:'EXTERNAL_LOAD'},
    {id:'oneRepMax',label:'1RM estimado · carga externa',unit:'kg',field:'estimatedOneRepMax',mode:'EXTERNAL_LOAD'},
    {id:'added',label:'Lastre añadido',unit:'kg',field:'addedWeightKg',mode:'WEIGHTED'},
    {id:'assistance',label:'Asistencia (menos es mejor)',unit:'kg',field:'assistanceWeightKg',mode:'ASSISTED',lowerBetter:true},
    {id:'distance',label:'Distancia',unit:'m',field:'distanceMeters'},
    {id:'volume',label:'Volumen externo (kg × reps)',unit:'kg·reps',field:'volume',mode:'EXTERNAL_LOAD'}
];
const numeric=value=>value == null || value === '' ? null :
    Number.isFinite(Number(value)) ? Number(value) : null;
function points(history,spec) {
    return (history||[]).filter(row=>
        !spec.mode || (row.loadMode||'EXTERNAL_LOAD')===spec.mode
    ).map(row=>({date:row.date,value:numeric(row[spec.field])}))
    .filter(row=>row.value!=null && row.value>=(spec.id==='distance'?0:0));
}
function available(history) {
    return specs.filter(spec=>{
        const valid=points(history,spec);
        return valid.some(point=>point.value>0) ||
            ['repsBody','repsAssisted','repsWeighted','repsExternal','seconds'].includes(spec.id)
                && valid.length>0;
    });
}
function chartData(history,id) {
    const spec=specs.find(s=>s.id===id);
    if(!spec)return null;
    const values=points(history,spec);
    if(!values.length)return {spec,points:[],svg:''};
    const left=52,right=558,top=20,bottom=174;
    const min=Math.min(...values.map(v=>v.value));
    const max=Math.max(...values.map(v=>v.value));
    const spread=max-min || Math.max(1,Math.abs(max)*.12);
    const low=min===max?min-spread/2:min;
    const high=min===max?max+spread/2:max;
    const data=values.map((v,i)=>({
        ...v,x:values.length===1?(left+right)/2:left+(i/(values.length-1))*(right-left),
        y:bottom-((v.value-low)/(high-low))*(bottom-top)
    }));
    const coords=data.map(v=>v.x.toFixed(2)+','+v.y.toFixed(2)).join(' ');
    const circles=data.map(v=>'<circle cx="'+v.x.toFixed(2)+'" cy="'+v.y.toFixed(2)+
        '" r="4" fill="#2a8065" />').join('');
    const svg='<svg viewBox="0 0 610 212" role="img" aria-label="Evolución de '+spec.label+'">'+
        '<line x1="52" y1="174" x2="558" y2="174" stroke="#aabeb2" />'+
        '<line x1="52" y1="20" x2="52" y2="174" stroke="#aabeb2" />'+
        '<text x="45" y="25" text-anchor="end" font-size="12">'+
            high.toFixed(1)+'</text>'+
        '<text x="45" y="174" text-anchor="end" font-size="12">'+
            low.toFixed(1)+'</text>'+
        (data.length>1?'<polyline fill="none" stroke="#2a8065" stroke-width="3" points="'+coords+'" />':'')+
        circles+
        '<text x="52" y="199" font-size="12">'+data[0].date+'</text>'+
        (data.length>1?'<text x="558" y="199" font-size="12" text-anchor="end">'+
            data[data.length-1].date+'</text>':'')+
        '</svg>';
    return {spec,points:data,svg};
}
const api=Object.freeze({available,chartData,specs,points});
if(typeof module!=='undefined' && module.exports)module.exports=api;
root.FitCoreProgressUI=api;
})(typeof globalThis!=='undefined'?globalThis:this);
