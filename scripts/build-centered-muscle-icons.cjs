'use strict';
/**
 * Rebuild ONLY the atlas-sourced quadriceps portrait.
 * Glutes and hamstrings have been redrawn and are not atlas crops.
 * The Python helper uses Pillow and embeds the quadriceps WebP crop.
 * Install: python -m pip install Pillow
 * Run: node scripts/build-centered-muscle-icons.cjs
 */
const path=require('node:path');
const {spawnSync}=require('node:child_process');
const pythonScript=path.join(__dirname,'build-centered-muscle-icons.py');
const specs=Object.freeze([
    {code:'QUADRICEPS',filename:'muscle-icon-quadriceps.svg',col:1,offsetX:-9}
]);
function build(){
    const candidates=process.env.FITCORE_PYTHON
        ? [[process.env.FITCORE_PYTHON,[]]]
        : process.platform==='win32'
            ? [['py',['-3']],['python',[]]]
            : [['python3',[]],['python',[]]];
    for(const [binary,args] of candidates){
        const result=spawnSync(binary,[...args,pythonScript],{stdio:'inherit'});
        if(result.error?.code==='ENOENT')continue;
        if(result.error)throw result.error;
        if(result.status!==0)throw new Error('Portrait generation failed; install Pillow first.');
        return;
    }
    throw new Error('Python 3 not found. Install Python and Pillow.');
}
if(require.main===module)build();
module.exports={specs,build};
