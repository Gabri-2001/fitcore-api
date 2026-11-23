// FitCore: rest duration wheel, domain-independent and testable.
(function(root) {
    'use strict';
    const MAX_SECONDS=3600;
    function options(saved) {
        const result=[0];
        for(let s=5;s<=120;s+=5)result.push(s);
        for(let s=135;s<=MAX_SECONDS;s+=15)result.push(s);
        // Older sessions can contain durations outside the new increments:
        // display them without silently replacing a user's saved setting.
        if(Number.isSafeInteger(saved)&&saved>0&&saved<=MAX_SECONDS&&!result.includes(saved)) {
            result.push(saved);
            result.sort((a,b)=>a-b);
        }
        return result;
    }
    function label(seconds) {
        const n=Math.max(0,Math.floor(Number(seconds)||0));
        if(n===0)return 'Apagado';
        const minutes=Math.floor(n/60),rest=n%60;
        if(!minutes)return n+' s';
        return minutes+' min'+(rest?' '+rest+' s':'');
    }
    function nearest(seconds,values=options()) {
        const value=Number(seconds);
        return values.reduce((previous,next)=>
            Math.abs(next-value)<Math.abs(previous-value)?next:previous,values[0]);
    }
    const api=Object.freeze({MAX_SECONDS,options,label,nearest});
    if(typeof module!=='undefined'&&module.exports)module.exports=api;
    root.FitCoreRestWheel=api;
})(typeof globalThis!=='undefined'?globalThis:this);
