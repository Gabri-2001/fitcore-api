'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const path=require('node:path');
const classifier=require(path.resolve(__dirname,'../../main/resources/static/fitcore-lab/day-classifier.js'));
const catalog=require(path.resolve(__dirname,'../resources/day-classification-catalog.json'));
const byCode=new Map(catalog.variants.map(v=>[v.code,v]));
const toRows=(items)=>items.map(item=>{
  const exercise=byCode.get(item.code);
  return {code:item.code,sets:item.sets,
      group:exercise?.group,pattern:exercise?.pattern,family:exercise?.family,
      activations:exercise?[]:null};
});
// Original 30 scenario hypotheses checked against real exercise codes and the new motor.
// Anatomical activation grouping is tested separately with representative API-shaped rows.
const cases=[
  {
    "name": "empty",
    "structure": null,
    "provisional": true,
    "focus": null,
    "exercises": []
  },
  {
    "name": "single-press",
    "structure": "UPPER",
    "provisional": true,
    "focus": null,
    "exercises": [
      {
        "code": "benchPressBarbellFlatMediumGrip",
        "sets": 3
      }
    ]
  },
  {
    "name": "single-squat",
    "structure": "LOWER",
    "provisional": true,
    "focus": null,
    "exercises": [
      {
        "code": "backSquatBarbellMediumStance",
        "sets": 4
      }
    ]
  },
  {
    "name": "chest-specialization",
    "structure": "PUSH",
    "provisional": false,
    "focus": "CHEST",
    "exercises": [
      {
        "code": "benchPressBarbellFlatMediumGrip",
        "sets": 4
      },
      {
        "code": "benchPressBarbellInclineMediumGrip",
        "sets": 3
      },
      {
        "code": "chestFlyPecDeckSeated",
        "sets": 3
      }
    ]
  },
  {
    "name": "push",
    "structure": "PUSH",
    "provisional": false,
    "focus": null,
    "exercises": [
      {
        "code": "benchPressBarbellFlatMediumGrip",
        "sets": 4
      },
      {
        "code": "overheadPressDumbbellSeated",
        "sets": 3
      },
      {
        "code": "tricepsPushdownCableRope",
        "sets": 3
      }
    ]
  },
  {
    "name": "pull",
    "structure": "PULL",
    "provisional": false,
    "focus": null,
    "exercises": [
      {
        "code": "pullUpPronatedWideGrip",
        "sets": 4
      },
      {
        "code": "seatedCableRowNeutralGrip",
        "sets": 4
      },
      {
        "code": "bicepsCurlDumbbellStandingSupinated",
        "sets": 3
      }
    ]
  },
  {
    "name": "back-specialization",
    "structure": "PULL",
    "provisional": false,
    "focus": "BACK",
    "exercises": [
      {
        "code": "pullUpPronatedWideGrip",
        "sets": 4
      },
      {
        "code": "latPulldownPronatedWideGripToChest",
        "sets": 4
      },
      {
        "code": "seatedCableRowNeutralGrip",
        "sets": 4
      }
    ]
  },
  {
    "name": "balanced-upper",
    "structure": "UPPER",
    "provisional": false,
    "focus": null,
    "exercises": [
      {
        "code": "benchPressBarbellFlatMediumGrip",
        "sets": 4
      },
      {
        "code": "seatedCableRowNeutralGrip",
        "sets": 4
      },
      {
        "code": "overheadPressDumbbellSeated",
        "sets": 3
      },
      {
        "code": "latPulldownPronatedWideGripToChest",
        "sets": 3
      }
    ]
  },
  {
    "name": "upper-with-arm",
    "structure": "UPPER",
    "provisional": false,
    "focus": null,
    "exercises": [
      {
        "code": "benchPressBarbellFlatMediumGrip",
        "sets": 4
      },
      {
        "code": "seatedCableRowNeutralGrip",
        "sets": 4
      },
      {
        "code": "bicepsCurlBarbellStanding",
        "sets": 3
      }
    ]
  },
  {
    "name": "arms",
    "structure": "ARMS",
    "provisional": false,
    "focus": null,
    "exercises": [
      {
        "code": "bicepsCurlBarbellStanding",
        "sets": 3
      },
      {
        "code": "hammerCurlDumbbellStanding",
        "sets": 3
      },
      {
        "code": "tricepsPushdownCableRope",
        "sets": 3
      },
      {
        "code": "overheadTricepsExtensionCableRope",
        "sets": 3
      }
    ]
  },
  {
    "name": "biceps-only",
    "structure": "UPPER",
    "provisional": false,
    "focus": "BICEPS",
    "exercises": [
      {
        "code": "bicepsCurlBarbellStanding",
        "sets": 4
      },
      {
        "code": "hammerCurlDumbbellStanding",
        "sets": 4
      }
    ]
  },
  {
    "name": "triceps-only",
    "structure": "UPPER",
    "provisional": false,
    "focus": "TRICEPS",
    "exercises": [
      {
        "code": "tricepsPushdownCableRope",
        "sets": 4
      },
      {
        "code": "overheadTricepsExtensionCableRope",
        "sets": 4
      }
    ]
  },
  {
    "name": "shoulder-isolation",
    "structure": "UPPER",
    "provisional": false,
    "focus": "SHOULDERS",
    "exercises": [
      {
        "code": "lateralRaiseDumbbellStanding",
        "sets": 4
      },
      {
        "code": "rearDeltFlyMachineSeated",
        "sets": 4
      }
    ]
  },
  {
    "name": "quadriceps-specialization",
    "structure": "LOWER",
    "provisional": false,
    "focus": "QUADRICEPS",
    "exercises": [
      {
        "code": "backSquatBarbellMediumStance",
        "sets": 4
      },
      {
        "code": "frontSquatBarbellMediumStance",
        "sets": 3
      },
      {
        "code": "legPressMachineMidFeet",
        "sets": 3
      }
    ]
  },
  {
    "name": "posterior-chain",
    "structure": "LOWER",
    "provisional": false,
    "focus": null,
    "exercises": [
      {
        "code": "romanianDeadliftBarbell",
        "sets": 4
      },
      {
        "code": "barbellHipThrust",
        "sets": 4
      },
      {
        "code": "legCurlMachineSeated",
        "sets": 3
      }
    ]
  },
  {
    "name": "leg-balanced",
    "structure": "LOWER",
    "provisional": false,
    "focus": null,
    "exercises": [
      {
        "code": "backSquatBarbellMediumStance",
        "sets": 4
      },
      {
        "code": "romanianDeadliftBarbell",
        "sets": 4
      },
      {
        "code": "legCurlMachineSeated",
        "sets": 3
      },
      {
        "code": "standingCalfRaiseBodyweight",
        "sets": 3
      }
    ]
  },
  {
    "name": "lower-adductors",
    "structure": "LOWER",
    "provisional": false,
    "focus": "ADDUCTORS",
    "exercises": [
      {
        "code": "hipAdductionMachineSeated",
        "sets": 3
      },
      {
        "code": "copenhagenPlankShortLeverBench",
        "sets": 3
      }
    ]
  },
  {
    "name": "full-body",
    "structure": "FULL_BODY",
    "provisional": false,
    "focus": null,
    "exercises": [
      {
        "code": "backSquatBarbellMediumStance",
        "sets": 3
      },
      {
        "code": "romanianDeadliftBarbell",
        "sets": 3
      },
      {
        "code": "benchPressBarbellFlatMediumGrip",
        "sets": 3
      },
      {
        "code": "seatedCableRowNeutralGrip",
        "sets": 3
      }
    ]
  },
  {
    "name": "full-body-one-leg-exercise",
    "structure": "FULL_BODY",
    "provisional": true,
    "focus": null,
    "exercises": [
      {
        "code": "backSquatBarbellMediumStance",
        "sets": 4
      },
      {
        "code": "benchPressBarbellFlatMediumGrip",
        "sets": 4
      },
      {
        "code": "seatedCableRowNeutralGrip",
        "sets": 4
      }
    ]
  },
  {
    "name": "torso-plus-small-leg",
    "structure": "UPPER",
    "provisional": false,
    "focus": null,
    "exercises": [
      {
        "code": "backSquatBarbellMediumStance",
        "sets": 3
      },
      {
        "code": "benchPressBarbellFlatMediumGrip",
        "sets": 4
      },
      {
        "code": "seatedCableRowNeutralGrip",
        "sets": 4
      }
    ]
  },
  {
    "name": "fullbody-asymmetric",
    "structure": "FULL_BODY",
    "provisional": false,
    "focus": null,
    "exercises": [
      {
        "code": "backSquatBarbellMediumStance",
        "sets": 5
      },
      {
        "code": "legCurlMachineSeated",
        "sets": 3
      },
      {
        "code": "benchPressBarbellFlatMediumGrip",
        "sets": 3
      },
      {
        "code": "seatedCableRowNeutralGrip",
        "sets": 3
      }
    ]
  },
  {
    "name": "pure-core",
    "structure": "CORE",
    "provisional": false,
    "focus": null,
    "exercises": [
      {
        "code": "plankBodyweightFront",
        "sets": 3
      },
      {
        "code": "crunchBodyweight",
        "sets": 3
      },
      {
        "code": "deadBugBodyweightAlternating",
        "sets": 2
      }
    ]
  },
  {
    "name": "core-accessory-push",
    "structure": "PUSH",
    "provisional": false,
    "focus": null,
    "exercises": [
      {
        "code": "benchPressBarbellFlatMediumGrip",
        "sets": 4
      },
      {
        "code": "overheadPressDumbbellSeated",
        "sets": 3
      },
      {
        "code": "plankBodyweightFront",
        "sets": 3
      }
    ]
  },
  {
    "name": "core-accessory-legs",
    "structure": "LOWER",
    "provisional": false,
    "focus": null,
    "exercises": [
      {
        "code": "backSquatBarbellMediumStance",
        "sets": 4
      },
      {
        "code": "romanianDeadliftBarbell",
        "sets": 3
      },
      {
        "code": "sidePlankBodyweightForearm",
        "sets": 3
      }
    ]
  },
  {
    "name": "conditioning",
    "structure": "CONDITIONING",
    "provisional": false,
    "focus": null,
    "exercises": [
      {
        "code": "burpeeBodyweightStandard",
        "sets": 4
      },
      {
        "code": "jumpingJackBodyweightStandard",
        "sets": 4
      }
    ]
  },
  {
    "name": "conditioning-accessory",
    "structure": "UPPER",
    "provisional": false,
    "focus": null,
    "exercises": [
      {
        "code": "burpeeBodyweightStandard",
        "sets": 3
      },
      {
        "code": "benchPressBarbellFlatMediumGrip",
        "sets": 4
      },
      {
        "code": "seatedCableRowNeutralGrip",
        "sets": 4
      }
    ]
  },
  {
    "name": "mixed-upper-lower",
    "structure": "MIXED",
    "provisional": true,
    "focus": null,
    "exercises": [
      {
        "code": "backSquatBarbellMediumStance",
        "sets": 4
      },
      {
        "code": "latPulldownPronatedWideGripToChest",
        "sets": 3
      }
    ]
  },
  {
    "name": "scapular-and-pull",
    "structure": "PULL",
    "provisional": false,
    "focus": null,
    "exercises": [
      {
        "code": "scapularPullUpPronated",
        "sets": 3
      },
      {
        "code": "pullUpPronatedWideGrip",
        "sets": 3
      }
    ]
  },
  {
    "name": "unknown-code",
    "structure": "PUSH",
    "provisional": true,
    "focus": null,
    "exercises": [
      {
        "code": "benchPressBarbellFlatMediumGrip",
        "sets": 4
      },
      {
        "code": "overheadPressDumbbellSeated",
        "sets": 4
      },
      {
        "code": "notARealVariant",
        "sets": 3
      }
    ]
  },
  {
    "name": "invalid-sets",
    "structure": null,
    "provisional": true,
    "focus": null,
    "exercises": [
      {
        "code": "benchPressBarbellFlatMediumGrip",
        "sets": 0
      },
      {
        "code": "seatedCableRowNeutralGrip",
        "sets": -2
      }
    ]
  }
];
for(const scenario of cases){
  test('canonical day classification: '+scenario.name,()=>{
    const actual=classifier.classify(toRows(scenario.exercises));
    assert.equal(actual.structure,scenario.structure,JSON.stringify(actual));
    assert.equal(actual.provisional,scenario.provisional,JSON.stringify(actual));
    if(scenario.focus)assert.equal(actual.focus[0],scenario.focus);
  });
}
test('many anatomical heads count once per family and per planned series',()=>{
 const grouped=classifier.aggregateMuscleFamilies([
  {muscleCode:'PECTORAL_UPPER',muscleGroup:'CHEST',role:'PRIMARY'},
  {muscleCode:'PECTORAL_MIDDLE',muscleGroup:'CHEST',role:'PRIMARY'},
  {muscleCode:'PECTORAL_LOWER',muscleGroup:'CHEST',role:'SECONDARY'},
  {muscleCode:'TRICEPS_LONG_HEAD',muscleGroup:'TRICEPS',role:'SECONDARY'},
  {muscleCode:'TRICEPS_LATERAL_HEAD',muscleGroup:'TRICEPS',role:'SECONDARY'},
  {muscleCode:'RECTUS_ABDOMINIS',muscleGroup:'CORE',role:'STABILIZER'}
 ]);
 assert.deepEqual(grouped,{CHEST:'PRIMARY',TRICEPS:'SECONDARY',CORE:'STABILIZER'});
 const bench={...toRows([{code:'benchPressBarbellFlatMediumGrip',sets:4}])[0],
   activations:Object.entries(grouped).map(([muscleGroup,role])=>({muscleGroup,role}))};
 const result=classifier.classify([bench]);
 assert.equal(result.directSets.CHEST,4);
 assert.equal(result.estimatedSets.CHEST,4);
 assert.equal(result.estimatedSets.TRICEPS,2);
 assert.equal(result.estimatedSets.CORE,undefined);
});
test('extra primary anatomical family does not double count full series',()=>{
 const press={...toRows([{code:'benchPressBarbellFlatMediumGrip',sets:3}])[0],
   activations:[{muscleGroup:'CHEST',role:'PRIMARY'}, {muscleGroup:'SHOULDERS',role:'PRIMARY'}]};
 const result=classifier.classify([press]);
 assert.equal(result.estimatedSets.CHEST,3);
 assert.equal(result.estimatedSets.SHOULDERS,1.5);
});
test('weights of missing metadata do not result in definitive classification',()=>{
 const rows=[...toRows([{code:'benchPressBarbellFlatMediumGrip',sets:4},
    {code:'overheadPressDumbbellSeated',sets:4}]),{code:'notInCatalog',sets:5}];
 const r=classifier.classify(rows);
 assert.equal(r.structure,'PUSH');
 assert.equal(r.provisional,true);
 assert.equal(r.missingSets,5);
 assert.ok(r.coverage<1);
});
test('isometrics use prescribed sets, not duration as number of sets',()=>{
 const r=classifier.classify(toRows([
    {code:'plankBodyweightFront',sets:3},
    {code:'sidePlankBodyweightForearm',sets:3}]));
 assert.equal(r.knownSets,6);
 assert.equal(r.structure,'CORE');
});
test('one exercise is a provisional suggestion and never a definitive label',()=>{
 const r=classifier.classify(toRows([{code:'backSquatBarbellMediumStance',sets:5}]));
 assert.equal(r.structure,'LOWER');
 assert.equal(r.provisional,true);
});
test('classifier never mutates caller prescriptions',()=>{
 const rows=toRows([{code:'benchPressBarbellFlatMediumGrip',sets:4}]);
 const frozen=JSON.stringify(rows);
 classifier.classify(rows);
 assert.equal(JSON.stringify(rows),frozen);
});
test('day display labels remain separate from structural type',()=>{
 const a=classifier.classify(toRows([{code:'benchPressBarbellFlatMediumGrip',sets:4},
 {code:'benchPressBarbellInclineMediumGrip',sets:4}]));
 assert.equal(a.structure,'PUSH');
 assert.match(classifier.describe(a),/predominio de pecho/i);
});
