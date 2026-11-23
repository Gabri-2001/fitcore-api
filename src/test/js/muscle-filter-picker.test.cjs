'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const crypto=require('node:crypto');
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
 const centered=['BICEPS','TRICEPS','QUADRICEPS','HAMSTRINGS','GLUTES','ADDUCTORS','CALVES','CORE','NECK','FULL_BODY'];
 const batch2=['FOREARMS'];
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
     GLUTES:'muscle-icon-glutes.svg',
     ADDUCTORS:'muscle-icon-adductors.svg',
     CALVES:'muscle-icon-calves.svg',
     CORE:'muscle-icon-core.svg',
     NECK:'muscle-icon-neck.svg',
     FULL_BODY:'muscle-icon-full-body.svg'
    };
    const filename=filenames[code];
    const urlSuffix=code==='NECK'?'?v=2':['ADDUCTORS','CALVES','CORE','FULL_BODY'].includes(code)?'?v=1':
     code==='HAMSTRINGS'||code==='GLUTES'?'?v=6':filename.endsWith('.svg')?'?v=2':'';
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
 assert.equal(new Set(positions2).size,1,'only forearms still use atlas batch two');
 assert.equal(vectorHighlights.length,0,'all 16 muscle groups have premium icons');
 assert.match(icons.icon(''),/muscle-icon-all.svg\?v=2/);
 assert.equal(icons.icon(''),icons.icon('ALL'));
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
  if(code==='HAMSTRINGS'||code==='GLUTES'){
   const expectedHash={HAMSTRINGS:'e42cebf5816e',GLUTES:'6d0fae63b4c3'}[code];
   assert.equal(crypto.createHash('sha256').update(decoded).digest('hex').slice(0,12),expectedHash,
    'keep the approved anatomy and color palette unchanged');
  }
  totalBytes+=Buffer.byteLength(asset);
 }
 assert.ok(totalBytes<atlas.length*1.5,'standalone artwork stays far smaller than three copies of the atlas');
});

test('adductors calves and core retain their approved standalone artwork',()=>{
 const expected={
  ADDUCTORS:{bytes:12928,sha256:'3e7e1e32aae9b7acf0265e92df54be5391a632100419ec763cfda4360c57a2bd'},
  CALVES:{bytes:10174,sha256:'63b326dde35e8072d50a77eb04df348ad8adf21c538d8655b4c15b5068267e85'},
  CORE:{bytes:13892,sha256:'dd34fc232f91c54763281f3e9376f009d8251752bafe8bd21f490b6a212496ef'}
 };
 for(const [code,spec] of Object.entries(expected)){
  const filename='muscle-icon-'+code.toLowerCase()+'.svg';
  const svg=fs.readFileSync(path.join(dir,filename),'utf8');
  assert.match(svg,/width="360" height="360" viewBox="0 0 360 360"/);
  const images=[...svg.matchAll(/href="data:image\/webp;base64,([A-Za-z0-9+/=]+)"/g)];
  assert.equal(images.length,1,code+' embeds exactly one independent image');
  const data=Buffer.from(images[0][1],'base64');
  assert.equal(data.length,spec.bytes);
  assert.equal(crypto.createHash('sha256').update(data).digest('hex'),spec.sha256);
  assert.equal(data.toString('ascii',0,4),'RIFF');
  assert.equal(data.toString('ascii',8,12),'WEBP');
  assert.equal(data.readUIntLE(24,3)+1,360);
  assert.equal(data.readUIntLE(27,3)+1,360);
  assert.doesNotMatch(svg,/<clipPath|<mask|<image[^>]*href="https?:\/\//);
  assert.ok(icons.icon(code).includes('./'+filename+'?v=1'));
 }
});


test('three new approved portraits are individually optimized and unchanged',()=>{
 const expected={"neck":"1a1fe1615fc7dc3e0ca4ad3182bfbdb986dfcf45a8fb57e36166c4da7c296440","full-body":"1a3e504ef87620a2317b7502a39af03ee6f0e92994edbc2e8e2a77d3275926ce","all":"841a5c8e31387e418f1ecfe030bb963205236bc68f7e3ec98bf8a001349a0af4"};
 for(const [name,hash] of Object.entries(expected)){
  const svg=fs.readFileSync(path.join(dir,'muscle-icon-'+name+'.svg'),'utf8');
  assert.match(svg,/width="360" height="360" viewBox="0 0 360 360"/);
  const encoded=[...svg.matchAll(/href="data:image\/webp;base64,([A-Za-z0-9+/=]+)"/g)];
  assert.equal(encoded.length,1);
  const data=Buffer.from(encoded[0][1],'base64');
  assert.equal(crypto.createHash('sha256').update(data).digest('hex'),hash);
  assert.ok(data.length<30000);
  assert.equal(data.toString('ascii',0,4),'RIFF');
  assert.equal(data.toString('ascii',8,12),'WEBP');
  if(name==='neck'){
   assert.equal(data.toString('ascii',12,16),'VP8X');
   assert.ok(data[20]&0x10,'neck icon must have transparent corners outside the mint circle');
   assert.match(svg,/centered mint circular canvas/);
  }
  if(name==='all'){
   assert.equal(data.toString('ascii',12,16),'VP8X');
   assert.ok(data[20]&0x10,'ALL has alpha outside the mint circle');
   assert.match(svg,/circular mint background/);
  }
  assert.equal(data.readUIntLE(24,3)+1,360);
  assert.equal(data.readUIntLE(27,3)+1,360);
  assert.doesNotMatch(svg,/<clipPath|<mask|<image[^>]*href="https?:\/\//);
 }
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

test('all 16 muscle groups plus ALL use the approved artwork',()=>{
 assert.equal(icons.CODES.filter(code=>icons.icon(code).includes('mi-premium')).length,16);
 for(const code of ['NECK','FULL_BODY','ALL']){
  const name={'NECK':'neck','FULL_BODY':'full-body','ALL':'all'}[code];
  assert.match(icons.icon(code),/mi-premium mi-centered/);
  assert.ok(icons.icon(code).includes('./muscle-icon-'+name+'.svg?v='+(code==='ALL'||code==='NECK'?'2':'1')));
 }
 assert.ok(icons.icon('').includes('./muscle-icon-all.svg?v=2'));
 assert.match(css,/\.muscle-filter-option-icon:has\(\.mi-premium\)/);
});
