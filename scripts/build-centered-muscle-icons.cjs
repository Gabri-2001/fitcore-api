'use strict';
/**
 * Rebuild FitCore's cropped, anatomically centered lower-body portraits.
 * The Python helper uses Pillow; it embeds only each group's WebP crop.
 * Install: python -m pip install Pillow
 * Run: node scripts/build-centered-muscle-icons.cjs
 */
const path=require('node:path');
const {spawnSync}=require('node:child_process');
const pythonScript=path.join(__dirname,'build-centered-muscle-icons.py');
const specs=Object.freeze([
    {code:'QUADRICEPS',filename:'muscle-icon-quadriceps.svg',col:1,offsetX:-9},
    {code:'HAMSTRINGS',filename:'muscle-icon-hamstrings.svg',col:2,offsetX:-17},
    {code:'GLUTES',filename:'muscle-icon-glutes.svg',col:3,offsetX:-18}
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
