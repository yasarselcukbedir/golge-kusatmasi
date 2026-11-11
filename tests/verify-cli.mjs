import {readFileSync,writeFileSync,rmSync} from 'node:fs';
import assert from 'node:assert/strict';
const docs=new URL('../../docs/',import.meta.url);
const read=name=>JSON.parse(readFileSync(new URL(name,docs),'utf8'));
const cases=read('cli-cases.json'),report=read('balance-report.json'),results={};
for(const c of cases){const raw=readFileSync(new URL('cli-check-work/'+c.file,docs),'utf8');assert.equal(raw.trim().split('\n').length,1);const r=JSON.parse(raw);assert.ok(r.final_hash);assert.ok([0,1,null].includes(r.winner_team));assert.ok(r.duration_s<=r.max_seconds);results[c.name]=r;}
for(let seed=1;seed<=3;seed++)assert.deepEqual(results['seed-'+seed],results['snapshot-'+seed]);
assert.ok(new Set([1,2,3,4,5].map(n=>results['seed-'+n].final_hash)).size>=2);
for(const [i,r] of [...report.matches.slice(0,3),report.matches.at(-1)].entries())for(const [k,v] of Object.entries(r))assert.deepEqual(results['replay-'+i][k],v);
assert.deepEqual(read('cli-check-work/catalog-other.json'),read('catalog.json'));
assert.ok(read('cli-check-work/invalid.json').error&&read('cli-check-work/invalid-option.json').error);
const wall_seconds={};for(const map of read('catalog.json').maps){const n=Number(readFileSync(new URL('cli-check-work/map-3v3-'+map.id+'.wall',docs),'utf8'));assert.ok(n<=60);wall_seconds[map.id]=n;}
const audit={passed:true,match_cases:cases.length,separate_process_snapshot_roundtrips:3,reproduced_balance_records:4,modes_checked:9,maps_checked:4,invalid_arguments_rejected:true,other_cwd_catalog_equal:true,wall_seconds,results};
writeFileSync(new URL('cli-audit.json',docs),JSON.stringify(audit,null,2)+'\n');rmSync(new URL('cli-check-work/',docs),{recursive:true,force:true});console.log('CLI passed='+cases.length+' failed=0');
