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
    const MAX_SECONDS=99*3600+59*60+59;
    const MAX_DIGITS=6;
    const editStates=new WeakMap();
    // Numeric mask: 1 -> 00:00:01; 123456 -> 12:34:56.
    // The UI never renders minutes or seconds above 59: 999999 -> 99:59:59.
    // Preserve the user's raw digits separately while editing, so continuing
    // to type or backspacing is intuitive even when a segment is clamped.
    function mask(value){
        const digits=String(value??'').replace(/\D/g,'').slice(0,MAX_DIGITS).padStart(MAX_DIGITS,'0');
        const cap=part=>String(Math.min(59,Number(part))).padStart(2,'0');
        return digits.slice(0,2)+':'+cap(digits.slice(2,4))+':'+cap(digits.slice(4,6));
    }
    function beginEdit(input){
        const digits=String(input.value??'').replace(/\D/g,'').slice(0,MAX_DIGITS);
        editStates.set(input,{digits,replace:true});
        if(typeof input.select==='function')input.select();
    }
    function edit(input,action,text=''){
        const state=editStates.get(input)||{
            digits:String(input.value??'').replace(/\D/g,'').slice(0,MAX_DIGITS),
            replace:true
        };
        if(action==='insert'){
            const next=String(text??'').replace(/\D/g,'');
            if(!next)return input.value;
            state.digits=(state.replace?'':state.digits).concat(next).slice(0,MAX_DIGITS);
        }else if(action==='delete'){
            state.digits=state.replace?'':state.digits.slice(0,-1);
        }else if(action==='clear'){
            state.digits='';
        }
        state.replace=false;
        editStates.set(input,state);
        input.value=mask(state.digits);
        input.setCustomValidity?.(isValidGoal(parse(input.value)) ? '' :
            'Introduce un tiempo real entre 00:00:01 y 99:59:59 (minutos y segundos hasta 59).');
        input.setSelectionRange?.(input.value.length,input.value.length);
        return input.value;
    }
    function endEdit(input){editStates.delete(input);}
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
    // One press changes one second immediately. Holding repeats after a
    // deliberate pause; callers stop on pointer release, cancellation or blur.
    // Clock injection keeps timing deterministic in unit tests.
    function createHoldController(onStep, options={}){
        if(typeof onStep!=='function')throw new TypeError('onStep must be a function');
        const clock=options.clock||{
            setTimeout,clearTimeout,setInterval,clearInterval
        };
        const delayMs=options.delayMs??350;
        const intervalMs=options.intervalMs??90;
        let current=null,delayId=null,intervalId=null;
        function stop(target){
            if(target && target!==current)return;
            if(delayId!==null)clock.clearTimeout(delayId);
            if(intervalId!==null)clock.clearInterval(intervalId);
            current=null;delayId=null;intervalId=null;
        }
        function start(target){
            stop();
            if(!target)return;
            current=target;
            if(onStep(target)===false){stop();return;}
            delayId=clock.setTimeout(()=>{
                delayId=null;
                if(current!==target)return;
                if(onStep(target)===false){stop();return;}
                intervalId=clock.setInterval(()=>{
                    if(current!==target)return;
                    if(onStep(target)===false)stop();
                },intervalMs);
            },delayMs);
        }
        return Object.freeze({start,stop,isActive:target=>current===target});
    }
    // One delegated binding survives plan-row re-renders. Pointer capture
    // retains the gesture until release, even when the pointer leaves the button.
    // This is deliberately separate from click: mouse/touch steps on pointerdown,
    // while keyboard-generated clicks are handled in the existing editor handler.
    function bindHoldButtons(root, onStep, options={}){
        if(!root || typeof root.addEventListener!=='function')
            throw new TypeError('A root element is required');
        const hold=createHoldController(onStep,options);
        const selector='button[data-step-field="durationSeconds"]';
        const doc=root.ownerDocument;
        const win=doc.defaultView;
        let activeButton=null,activePointer=null;
        const isTarget=target=>{
            const button=target?.closest?.(selector);
            return button && root.contains(button) ? button : null;
        };
        function stop(){
            const button=activeButton,id=activePointer;
            activeButton=null;activePointer=null;
            hold.stop();
            if(button && id!==null && button.hasPointerCapture?.(id)){
                try{button.releasePointerCapture(id);}catch(_error){/* already released */}
            }
        }
        root.addEventListener('pointerdown',event=>{
            const button=isTarget(event.target);
            if(!button || event.button!==0 || event.isPrimary===false)return;
            stop();
            activeButton=button;activePointer=event.pointerId;
            try{button.setPointerCapture?.(event.pointerId);}catch(_error){/* fallback to document */}
            hold.start(button);
            event.preventDefault();
        },true);
        const stopPointer=event=>{
            if(activePointer===event.pointerId)stop();
        };
        doc.addEventListener('pointerup',stopPointer,true);
        doc.addEventListener('pointercancel',stopPointer,true);
        win.addEventListener('blur',stop);
        doc.addEventListener('visibilitychange',()=>{
            if(doc.hidden)stop();
        });
        return Object.freeze({stop,isActive:()=>activeButton!==null&&hold.isActive(activeButton)});
    }
    return Object.freeze({MAX_SECONDS,MAX_DIGITS,mask,beginEdit,edit,endEdit,
        format,parse,isValidGoal,step,createHoldController,bindHoldButtons});
});
