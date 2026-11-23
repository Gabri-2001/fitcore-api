'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const vm=require('node:vm');
const dir=path.resolve(__dirname,'../../main/resources/static/fitcore-lab');
const icons=require(path.join(dir,'muscle-picker-icons.js'));
const app=fs.readFileSync(path.join(dir,'app.js'),'utf8');
const html=fs.readFileSync(path.join(dir,'index.html'),'utf8');
const css=fs.readFileSync(path.join(dir,'styles.css'),'utf8');

test('every catalog muscle group has a distinct vector anatomical highlight',()=>{
 const expected=['CHEST','BACK','SHOULDERS','SCAPULAR','ROTATOR_CUFF','BICEPS',
  'TRICEPS','FOREARMS','QUADRICEPS','HAMSTRINGS','GLUTES','ADDUCTORS',
  'CALVES','CORE','NECK','FULL_BODY'];
 assert.deepEqual([...icons.CODES],expected);
 const batch1=['CHEST','BACK','SHOULDERS','SCAPULAR','ROTATOR_CUFF'];
 const centered=['BICEPS','TRICEPS','QUADRICEPS','HAMSTRINGS','GLUTES'];
 const batch2=['FOREARMS','ADDUCTORS','CALVES','CORE'];
 const premium=[...batch1,...centered,...batch2];
 const vectorHighlights=[],positions1=[],positions2=[];
 for(const filename of ['muscle-icons-premium.webp','muscle-icons-premium-2.webp']){
  const atlasPath=path.join(dir,filename);
  assert.ok(fs.existsSync(atlasPath),filename+' must exist');
  assert.ok(fs.statSync(atlasPath).size>10000,filename+' must contain artwork');
 }
 for(const code of expected){
  const svg=icons.icon(code);
  assert.match(svg,/^<svg /);
  assert.match(svg,/viewBox="0 0 64 64"/);
  assert.match(svg,/aria-hidden="true"/);
  if(premium.includes(code)){
   assert.match(svg,/mi-premium/);
   if(centered.includes(code)){
    const filenames={
     BICEPS:'muscle-icon-biceps.webp',
     TRICEPS:'muscle-icon-triceps.webp',
     QUADRICEPS:'muscle-icon-quadriceps.svg',
     HAMSTRINGS:'muscle-icon-hamstrings.svg',
     GLUTES:'muscle-icon-glutes.svg'
    };
    const filename=filenames[code];
    const urlSuffix=code==='HAMSTRINGS'||code==='GLUTES'?'?v=5':filename.endsWith('.svg')?'?v=2':'';
    assert.ok(svg.includes('<image href="./'+filename+urlSuffix+'"'),code+' uses its own centered portrait');
    assert.match(svg,/mi-centered/);
    assert.match(svg,/x="0" y="0" width="64" height="64"/);
    assert.match(svg,/preserveAspectRatio="xMidYMid meet"/);
    const asset=fs.readFileSync(path.join(dir,filename));
    assert.ok(asset.length>10000,code+' includes high-definition artwork');
    if(filename.endsWith('.webp')){
     assert.equal(asset.toString('ascii',0,4),'RIFF');
     assert.equal(asset.toString('ascii',8,12),'WEBP');
     assert.equal(asset.toString('ascii',12,16),'VP8X');
     assert.equal(asset.readUIntLE(24,3)+1,360);
     assert.equal(asset.readUIntLE(27,3)+1,360);
    }else{
     const contents=asset.toString('utf8');
     assert.match(contents,/width="360" height="360" viewBox="0 0 360 360"/);
     assert.match(contents,/<image x="0" y="0" width="360" height="360"/);
     const encoded=contents.match(/href="data:image\/webp;base64,([A-Za-z0-9+/=]+)"/);
     assert.ok(encoded,'only its own cropped WebP is embedded');
     const webp=Buffer.from(encoded[1],'base64');
     assert.ok(webp.length<30000,'compressed source is smaller than the original atlas');
     assert.ok(contents.length<40000,'the SVG must not include the whole atlas');
     assert.equal(webp.toString('ascii',0,4),'RIFF');
     assert.equal(webp.toString('ascii',8,12),'WEBP');
     assert.equal(webp.toString('ascii',12,16),'VP8X');
     assert.equal(webp.readUIntLE(24,3)+1,360);
     assert.equal(webp.readUIntLE(27,3)+1,360);
     assert.doesNotMatch(contents,/<image[^>]*href="https?:\/\//);
     if(code==='HAMSTRINGS'||code==='GLUTES'){
      assert.match(contents,/independently approved anatomical design; no atlas crop/);
      assert.doesNotMatch(contents,/<clipPath|<mask/,'new artwork needs no additional SVG clipping or masks');
     }
    }
   }else{
    const filename=batch1.includes(code)?'muscle-icons-premium.webp':'muscle-icons-premium-2.webp';
    assert.ok(svg.includes('<image href="./'+filename+'"'),code+' has its original atlas');
    assert.match(svg,/width="256" height="128"/);
    (batch1.includes(code)?positions1:positions2).push(svg.match(/x="(-?\d+)" y="(-?\d+)"/)[0]);
   }
  }else{
   assert.match(svg,/<g class="mi-active">/);
   assert.match(svg,/<g class="mi-outline">/);
   vectorHighlights.push(svg.match(/<g class="mi-active">([\s\S]*?)<\/g>/)[1]);
  }
 }
 assert.equal(new Set(positions1).size,5,'the other five batch-one sprites are unchanged');
 assert.equal(new Set(positions2).size,4,'four atlas illustrations remain after centering three portraits');
 assert.equal(new Set(vectorHighlights).size,2,'neck and full body remain vector-based');
 assert.match(icons.icon(''),/mi-accent/);
});

test('quadriceps is regenerable while redrawn muscles remain independent',()=>{
 const builder=require(path.resolve(__dirname,'../../../scripts/build-centered-muscle-icons.cjs'));
 assert.deepEqual(builder.specs.map(spec=>spec.code),['QUADRICEPS']);
 assert.equal(builder.specs[0].offsetX,-9);
 const atlas=fs.readFileSync(path.join(dir,'muscle-icons-premium-2.webp'));
 let totalBytes=0;
 for(const code of ['QUADRICEPS','HAMSTRINGS','GLUTES']){
  const filename='muscle-icon-'+code.toLowerCase()+'.svg';
  const asset=fs.readFileSync(path.join(dir,filename),'utf8');
  const match=asset.match(/href="data:image\/webp;base64,([A-Za-z0-9+/=]+)"/);
  assert.ok(match,code+' embeds its independent illustration');
  const decoded=Buffer.from(match[1],'base64');
  assert.ok(decoded.length<30000,code+' stays compact');
  assert.notDeepEqual(decoded,atlas,code+' must not embed full atlas');
  totalBytes+=Buffer.byteLength(asset);
 }
 assert.ok(totalBytes<atlas.length*1.5,'standalone artwork stays far smaller than three copies of the atlas');
});

test('muscle filter uses custom listbox yet keeps native select as source of truth',()=>{
 assert.match(html,/id="session-muscle-filter-button"/);
 assert.match(html,/id="session-muscle-filter-list"[\s\S]*?role="listbox"/);
 assert.match(html,/id="session-exercise-muscle" class="muscle-filter-native"/);
 assert.match(html,/muscle-picker-icons\.js" defer/);
 assert.ok(html.indexOf('muscle-picker-icons.js')<html.indexOf('app.js'));
 assert.match(app,/function initializeMuscleFilter\(\)/);
 assert.match(app,/initializeMuscleFilter\(\);/);
 assert.match(app,/native\.dispatchEvent\(new Event\('change',\{bubbles:true\}\)\)/);
 assert.match(app,/muscle: \$\('session-exercise-muscle'\)\?\.value \|\| ''/);
 assert.match(css,/\.muscle-filter-option\[aria-selected="true"\]/);
 assert.match(css,/\.muscle-filter-menu\[hidden\]/);
});
test('keyboard and dismiss patterns are preserved in the filter',()=>{
 assert.match(app,/event\.key==='ArrowDown'/);
 assert.match(app,/event\.key==='ArrowUp'/);
 assert.match(app,/event\.key==='Home'/);
 assert.match(app,/event\.key==='End'/);
 assert.match(app,/event\.key==='Escape'/);
 assert.match(app,/event\.key==='Tab'/);
 assert.match(app,/close\(true\)/);
 assert.match(app,/menu\.hidden=true/);
});
test('svg helper never interpolates an unsafe CSS class',()=>{
 assert.throws(()=>icons.icon('CHEST',{className:'x" onload="alert(1)'}),TypeError);
});

test('14 premium icons coexist with neck and full-body original vectors',()=>{
 const vector=['NECK','FULL_BODY'];
 assert.equal(icons.CODES.filter(code=>icons.icon(code).includes('mi-premium')).length,14);
 assert.ok(vector.every(code=>!icons.icon(code).includes('mi-premium')));
 assert.ok(vector.every(code=>icons.icon(code).includes('mi-outline')));
 assert.match(css,/\.muscle-filter-option-icon:has\(\.mi-premium\)/);
});
