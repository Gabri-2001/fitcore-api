/**
 * FitCore plan duration UI. Time goals are displayed as HH:MM:SS, while
 * workout plans persist their canonical duration as seconds.
 */
(function(root,factory){
    'use strict';
    const api=factory();
    if(typeof module==='object'&&module.exports)module.exports=api;
    else root.FitCoreDurationInput=api;
})(typeof globalThis!=='undefined'?globalThis:this,function(){
    'use strict';
    const MAX_SECONDS=86400;
    function format(seconds){
        if(!Number.isSafeInteger(Number(seconds))||Number(seconds)<0||Number(seconds)>MAX_SECONDS)
            return null;
        const value=Number(seconds);
        const pad=value=>String(value).padStart(2,'0');
        return pad(Math.floor(value/3600))+':'+
            pad(Math.floor(value%3600/60))+':'+pad(value%60);
    }
    function parse(value){
        if(typeof value!=='string'||!/^\d{2}:\d{2}:\d{2}$/.test(value.trim()))return null;
        const [hours,minutes,seconds]=value.trim().split(':').map(Number);
        if(minutes>59||seconds>59)return null;
        const total=hours*3600+minutes*60+seconds;
        return total<=MAX_SECONDS?total:null;
    }
    function isValidGoal(value){
        const seconds=typeof value==='string'?parse(value):value;
        return Number.isSafeInteger(seconds)&&seconds>=1&&seconds<=MAX_SECONDS;
    }
    function step(value,delta){
        const seconds=parse(value);
        if(seconds===null||!Number.isSafeInteger(delta))return null;
        return format(Math.max(1,Math.min(MAX_SECONDS,seconds+delta)));
    }
    return Object.freeze({MAX_SECONDS,format,parse,isValidGoal,step});
});
