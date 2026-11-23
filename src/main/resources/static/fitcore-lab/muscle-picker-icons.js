/*
 * FitCore muscle-filter artwork: custom SVG anatomical miniatures.
 * All icons share dark-green outlines, soft green structure and lime highlights.
 * Decorative illustrations; accessible muscle names live on the filter controls.
 */
(function(root,factory){
    'use strict';
    const api=factory();
    if(typeof module==='object'&&module.exports)module.exports=api;
    else root.FitCoreMuscleIcons=api;
})(typeof globalThis!=='undefined'?globalThis:this,function(){
    'use strict';
    const CODES=Object.freeze([
        'CHEST','BACK','SHOULDERS','SCAPULAR','ROTATOR_CUFF',
        'BICEPS','TRICEPS','FOREARMS','QUADRICEPS','HAMSTRINGS',
        'GLUTES','ADDUCTORS','CALVES','CORE','NECK','FULL_BODY'
    ]);
    const BASE=Object.freeze({
        front:'<path d="M25 7v5c-2.7 2.3-7 3.2-12 5.4C8 19.4 6 23.5 5 28L2 46l7 2 6-17 4 25h26l4-25 6 17 7-2-3-18c-1-4.5-3-8.6-8-10.6-5-2.2-9.3-3.1-12-5.4V7"/><path class="mi-detail" d="M32 15v41M19 24c4 2 8 3 13 3s9-1 13-3M20 29c4 3 8 4 12 4s8-1 12-4M21 37c4 2 7 2 11 2s7 0 11-2M22 44c4 2 7 2 10 2s6 0 10-2M25 50h14M15 31l-3-8M49 31l3-8"/>',
        back:'<path d="M25 7v5c-2.7 2.3-7 3.2-12 5.4C8 19.4 6 23.5 5 28L2 46l7 2 6-17 4 25h26l4-25 6 17 7-2-3-18c-1-4.5-3-8.6-8-10.6-5-2.2-9.3-3.1-12-5.4V7"/><path class="mi-detail" d="M32 12v44M17 22c4 0 7 3 11 6M47 22c-4 0-7 3-11 6M18 31l11 8M46 31l-11 8M21 49l9-9M43 49l-9-9M25 17l7 6 7-6"/>',
        flex:'<path d="M10 54c2-7 8-12 11-19l4-10c1-3 1-7 4-9l6-3c4-3 8-2 12 1l8 8c2 3 1 6-2 8-3 1-5 0-7-2l-5-5-3 9c-1 6-5 10-9 15l-9 12"/><path class="mi-detail" d="M25 25c4 3 8 4 13 7M20 38c3 2 7 3 11 3M45 19l7 7"/>',
        arm:'<path d="M19 7c10-3 20 0 24 10 2 4 0 8-1 12l-4 12-5 17-11-3 5-19 1-12c-2-5-7-7-13-8"/><path class="mi-detail" d="M21 16c8 2 12 6 13 13M27 36l11 5"/>',
        forearm:'<path d="M8 52c7-7 13-14 20-26l5-9c2-5 4-7 7-7 3 0 4 2 4 5l7-5c3-1 5 1 4 4l-3 5c5-2 7 1 4 5l-4 5c3 1 3 4 1 6L42 47c-7 8-16 12-24 14"/><path class="mi-detail" d="M21 43l12 6M28 28c5 3 9 6 13 9"/>',
        legs:'<path d="M15 5c-2 7-3 14-2 23l3 28c1 4 8 5 11 0l5-26 5 26c3 5 10 4 11 0l3-28c1-9 0-16-2-23"/><path class="mi-detail" d="M32 9v21M18 31l10 1M36 32l10-1M17 43l11 1M36 44l11-1M21 9c-2 5-4 11-4 18M43 9c2 5 4 11 4 18"/>',
        backlegs:'<path d="M15 5c-2 7-3 14-2 23l3 28c1 4 8 5 11 0l5-26 5 26c3 5 10 4 11 0l3-28c1-9 0-16-2-23"/><path class="mi-detail" d="M32 9v21M19 27l9 7M45 27l-9 7M18 41l9 3M37 44l9-3M18 10c4 3 9 5 14 5s10-2 14-5"/>',
        neck:'<path d="M24 5l1 11c-2 4-6 7-12 9-5 2-8 5-10 11M40 5l-1 11c2 4 6 7 12 9 5 2 8 5 10 11M3 36c7-2 15 0 22 6 4 3 9 3 14 0 7-6 15-8 22-6M12 48c12-7 28-7 40 0"/><path class="mi-detail" d="M25 16l7 8 7-8M32 24v17"/>',
        full:'<circle cx="32" cy="9" r="6"/><path d="M25 18c-5 2-7 4-10 10L9 43c-1 3 3 5 5 2l9-14 3 11-4 17c0 3 5 4 6 1l5-18 4 18c2 3 6 2 6-1l-4-17 3-11 9 14c2 3 6 1 5-2l-6-15c-3-6-5-8-10-10z"/><path class="mi-detail" d="M32 22v20M24 28h16"/>',
        rotator:'<path d="M7 50c-2-10 3-22 13-29l15-10 17-3 6 8-3 12-12 7-6 18"/><circle cx="41" cy="28" r="7"/><path class="mi-detail" d="M19 21l15 15M48 9l-2 12"/>',
        calves:'<path d="M16 5l-4 25 4 27h12l4-23 4 23h12l4-27-4-25"/><path class="mi-detail" d="M32 5v30M19 47l4 10M45 47l-4 10"/>',
        all:'<path d="M11 20L32 9l21 11-21 11zM11 31l21 11 21-11M11 42l21 11 21-11"/>'
    });
    // Anatomical highlights are individual, not a reused generic muscle symbol.
    const ART=Object.freeze({
        CHEST:{base:'front',active:'<path d="M18 20c5-1 10 0 14 5v7c-6 2-13 1-15-4zM46 20c-5-1-10 0-14 5v7c6 2 13 1 15-4z"/>'},
        BACK:{base:'back',active:'<path d="M18 24c5 3 9 6 12 8l1 9-10 11-3-18zM46 24c-5 3-9 6-12 8l-1 9 10 11 3-18z"/>'},
        SHOULDERS:{base:'front',active:'<path d="M15 18c-7 2-8 9-8 13l8 4 6-9-1-6zM49 18c7 2 8 9 8 13l-8 4-6-9 1-6z"/>'},
        SCAPULAR:{base:'back',active:'<path d="M19 22l11 8-9 8-5-9zM45 22l-11 8 9 8 5-9z"/>'},
        ROTATOR_CUFF:{base:'rotator',active:'<path d="M24 20l14-8 13-2-3 11-13 5zM27 29l8-4 7 10-8 14z"/>'},
        BICEPS:{base:'flex',active:'<path d="M24 27c2-6 8-10 13-9l5 4-5 12c-4 5-10 8-15 5z"/>'},
        TRICEPS:{base:'arm',active:'<path d="M32 14c7-1 12 6 9 13l-6 15-9-4 3-15z"/>'},
        FOREARMS:{base:'forearm',active:'<path d="M12 51l17-26 7 8-14 22-5 4zM29 30l7 4 6 13-9-2z"/>'},
        QUADRICEPS:{base:'legs',active:'<path d="M16 12l13 1 1 17-7 15-7-5-2-14zM48 12l-13 1-1 17 7 15 7-5 2-14z"/>'},
        HAMSTRINGS:{base:'backlegs',active:'<path d="M16 19l12 3 1 16-7 11-5-6-2-16zM48 19l-12 3-1 16 7 11 5-6 2-16z"/>'},
        GLUTES:{base:'backlegs',active:'<path d="M16 13c5-5 11-4 16-2v13c-6 8-12 9-17 2zM48 13c-5-5-11-4-16-2v13c6 8 12 9 17 2z"/>'},
        ADDUCTORS:{base:'legs',active:'<path d="M29 15l2 10-4 24-7-6 3-20zM35 15l-2 10 4 24 7-6-3-20z"/>'},
        CALVES:{base:'calves',active:'<path d="M15 15c8-4 13 4 13 12l-4 21-9-9-2-14zM49 15c-8-4-13 4-13 12l4 21 9-9 2-14z"/>'},
        CORE:{base:'front',active:'<rect x="25" y="28" width="6" height="6" rx="2"/><rect x="33" y="28" width="6" height="6" rx="2"/><rect x="25" y="36" width="6" height="6" rx="2"/><rect x="33" y="36" width="6" height="6" rx="2"/><rect x="25" y="44" width="6" height="6" rx="2"/><rect x="33" y="44" width="6" height="6" rx="2"/><path d="M21 31l3 18-4-4-2-11zM43 31l-3 18 4-4 2-11z"/>'},
        NECK:{base:'neck',active:'<path d="M25 10l7 14-8 13-7-8 7-13zM39 10l-7 14 8 13 7-8-7-13z"/>'},
        FULL_BODY:{base:'full',active:'<path d="M25 19l-7 10 5 7 4-9 5-4 5 4 4 9 5-7-7-10zM27 39l-4 16 5 1 4-13 4 13 5-1-4-16z"/>',
            accent:'<path d="M6 17l4 3M54 20l4-3M3 30h5M56 30h5M8 43l4-3M52 40l4 3"/>'},
        ALL:{base:'all',accent:'<path d="M11 31l21 11 21-11"/>'}
    });
    // High-definition sprite atlas, 192x192 per cell, 4 columns x 2 rows.
    // Batch 1 is preserved, and batch 2 supplies seven additional detailed icons.
    // Neck and full body retain their existing vector illustrations.
    const PREMIUM=Object.freeze({
        CHEST:[0,0],BACK:[1,0],SHOULDERS:[2,0],SCAPULAR:[3,0],
        ROTATOR_CUFF:[0,1],BICEPS:[1,1],TRICEPS:[2,1]
    });
    // Second batch retains the same 4×2 sprite layout and visual treatment.
    const PREMIUM_BATCH2=Object.freeze({
        FOREARMS:[0,0],QUADRICEPS:[1,0],HAMSTRINGS:[2,0],GLUTES:[3,0],
        ADDUCTORS:[0,1],CALVES:[1,1],CORE:[2,1]
    });
    // All five portraits have individual framing. Glutes and hamstrings are
    // newly illustrated instead of atlas crops; their SVGs embed only their
    // own WebP portrait. A revision query avoids stale browser caches.
    const CENTERED=Object.freeze({
        BICEPS:'./muscle-icon-biceps.webp',
        TRICEPS:'./muscle-icon-triceps.webp',
        QUADRICEPS:'./muscle-icon-quadriceps.svg?v=2',
        HAMSTRINGS:'./muscle-icon-hamstrings.svg?v=5',
        GLUTES:'./muscle-icon-glutes.svg?v=5'
    });
    function centeredIcon(code,css){
        return '<svg class="'+css+' mi-premium mi-centered" viewBox="0 0 64 64" '+
            'focusable="false" aria-hidden="true" xmlns="http://www.w3.org/2000/svg">'+
            '<image href="'+CENTERED[code]+'" x="0" y="0" width="64" height="64" '+
            'preserveAspectRatio="xMidYMid meet"/></svg>';
    }
    const PREMIUM_ATLAS='./muscle-icons-premium.webp';
    const PREMIUM_ATLAS_BATCH2='./muscle-icons-premium-2.webp';
    function premiumIcon(code,css){
        const second=Object.prototype.hasOwnProperty.call(PREMIUM_BATCH2,code);
        const [col,row]=second?PREMIUM_BATCH2[code]:PREMIUM[code];
        const atlas=second?PREMIUM_ATLAS_BATCH2:PREMIUM_ATLAS;
        // The SVG viewBox clips a single 64-unit cell from a scaled atlas,
        // keeping the full muscle portrait in exactly the same icon API.
        return '<svg class="'+css+' mi-premium" viewBox="0 0 64 64" '+
            'focusable="false" aria-hidden="true" xmlns="http://www.w3.org/2000/svg">'+
            '<image href="'+atlas+'" x="'+(-64*col)+'" y="'+(-64*row)+
            '" width="256" height="128" preserveAspectRatio="none"/></svg>';
    }
    function icon(code,options={}){
        const art=ART[code||'ALL']||ART.ALL;
        const css=options.className||'fitcore-muscle-icon';
        if(!/^[a-zA-Z0-9 _-]+$/.test(css))throw new TypeError('Invalid icon class');
        if(Object.prototype.hasOwnProperty.call(CENTERED,code))return centeredIcon(code,css);
        if(Object.prototype.hasOwnProperty.call(PREMIUM,code) ||
           Object.prototype.hasOwnProperty.call(PREMIUM_BATCH2,code))return premiumIcon(code,css);
        return '<svg class="'+css+'" viewBox="0 0 64 64" focusable="false" aria-hidden="true" xmlns="http://www.w3.org/2000/svg">'+
            '<circle class="mi-halo" cx="32" cy="32" r="30"/>'+
            (art.active?'<g class="mi-active">'+art.active+'</g>':'')+
            '<g class="mi-outline">'+BASE[art.base]+'</g>'+
            (art.accent?'<g class="mi-accent">'+art.accent+'</g>':'')+
            '</svg>';
    }
    return Object.freeze({CODES,icon});
});
