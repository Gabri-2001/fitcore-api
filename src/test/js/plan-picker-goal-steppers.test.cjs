'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const vm=require('node:vm');
const base=path.resolve(__dirname,'../../main/resources/static/fitcore-lab');
const html=fs.readFileSync(path.join(base,'index.html'),'utf8');
const css=fs.readFileSync(path.join(base,'styles.css'),'utf8');
const app=fs.readFileSync(path.join(base,'app.js'),'utf8');
const duration=require(path.join(base,'plan-duration-input.js'));

function createPickerHarness(){
    const fields={
        'exercise-picker-dialog':{open:true},
        'plan-picker-sets':{value:'3',min:'1',max:'100'},
        'plan-picker-reps':{value:'10',min:'1',max:'500'},
        'plan-picker-duration':{value:'00:00:45'}
    };
    for(const input of Object.values(fields)){
        input.setCustomValidity=function(message){this.validationMessage=message;};
        input.reportValidity=function(){this.reported=true;return false;};
    }
    const start=app.indexOf('function stepPlanPickerGoal(button) {');
    const end=app.indexOf('function planTimedStepper(seconds) {',start);
    assert.ok(start>=0&&end>start,'picker stepping must be a separate function');
    const context={
        $:id=>fields[id],
        state:{pickerMode:'plan',planPickerAction:'add'},
        FitCoreDurationInput:duration
    };
    vm.runInNewContext(app.slice(start,end)+'\nthis.pickerStep=stepPlanPickerGoal;',context);
    const click=(field,delta)=>context.pickerStep({
        isConnected:true,dataset:{pickerStep:field,step:String(delta)}
    });
    return{fields,context,click};
}

test('picker goals use same +/- stepper structure as plan editor',()=>{
    const picker=html.slice(html.indexOf('<div id="plan-picker-fields"'),
       html.indexOf('<!-- ACCIONES -->',html.indexOf('<div id="plan-picker-fields"')));
    for(const field of ['sets','reps','duration']){
        assert.match(picker,new RegExp('data-picker-step="'+field+'" data-step="-1"'));
        assert.match(picker,new RegExp('data-picker-step="'+field+'" data-step="1"'));
        assert.match(picker,new RegExp('class="plan-stepper plan-picker-stepper'));
    }
    assert.match(picker,/id="plan-picker-rest-button"/);
    assert.match(css,/\.plan-picker-numbers \.plan-picker-stepper\s*\{/);
    assert.ok(app.includes("FitCoreDurationInput.bindHoldButtons(pickerStepRoot,stepPlanPickerGoal"));
    assert.ok(app.includes("selector:'button[data-picker-step]'"));
    assert.ok(app.includes('if(button && event.detail===0)stepPlanPickerGoal(button)'));
});
test('picker series and reps adjust the saved numeric inputs, respecting min and max',()=>{
    const {fields,click}=createPickerHarness();
    assert.equal(click('sets',1),true);
    assert.equal(fields['plan-picker-sets'].value,'4');
    assert.equal(click('sets',-1),true);
    assert.equal(fields['plan-picker-sets'].value,'3');
    fields['plan-picker-sets'].value='1';
    assert.equal(click('sets',-1),false);
    assert.equal(fields['plan-picker-sets'].value,'1');
    fields['plan-picker-sets'].value='100';
    assert.equal(click('sets',1),false);
    fields['plan-picker-reps'].value='499';
    assert.equal(click('reps',1),true);
    assert.equal(fields['plan-picker-reps'].value,'500');
    assert.equal(click('reps',1),false);
    fields['plan-picker-reps'].value='1';
    assert.equal(click('reps',-1),false);
});
test('picker time changes one second and rolls over without violating 99:59:59',()=>{
    const {fields,click}=createPickerHarness();
    const input=fields['plan-picker-duration'];
    input.value='00:00:59';
    assert.equal(click('duration',1),true);
    assert.equal(input.value,'00:01:00');
    assert.equal(duration.parse(input.value),60);
    assert.equal(click('duration',-1),true);
    assert.equal(input.value,'00:00:59');
    input.value='99:59:59';
    assert.equal(click('duration',1),false);
    input.value='00:00:01';
    assert.equal(click('duration',-1),false);
    assert.equal(input.value,'00:00:01');
});
test('picker refuses to change goals outside add-to-plan mode',()=>{
    const {fields,context,click}=createPickerHarness();
    context.state.pickerMode='session';
    assert.equal(click('sets',1),false);
    assert.equal(fields['plan-picker-sets'].value,'3');
    context.state.pickerMode='plan';
    context.state.planPickerAction='replace';
    assert.equal(click('sets',1),false);
    context.state.planPickerAction='add';
    fields['exercise-picker-dialog'].open=false;
    assert.equal(click('duration',1),false);
});
