#!/usr/bin/env node
import {writeFileSync,mkdirSync} from 'node:fs';
import {fileURLToPath} from 'node:url';
import {dirname,resolve,relative} from 'node:path';
import {getCatalog,createMatch,step,serialize,restore,hashState,runDuel} from '../src/sim/index.js';
const root=resolve(dirname(fileURLToPath(import.meta.url)),'..');
function options(args,allowed){const out={};for(let i=0;i<args.length;i+=2){const k=args[i];if(!k?.startsWith('--')||!allowed.includes(k.slice(2))||args[i+1]===undefined||args[i+1].startsWith('--')||k.slice(2) in out)throw Error('Geçersiz seçenek: '+k);out[k.slice(2)]=args[i+1];}return out;}
function integer(n,fallback){if(n===undefined)return fallback;if(!/^-?\d+$/.test(n)||!Number.isSafeInteger(Number(n)))throw Error('Tamsayı gerekli');return Number(n);}
function positive(n,fallback){if(n===undefined)return fallback;const x=Number(n);if(!Number.isFinite(x)||x<=0||x>86400)throw Error('Pozitif süre gerekli');return x;}
function matchResult(o){const seed=integer(o.seed,1),map=o.map||getCatalog().maps[0].id,mode=o.mode||'1v1',difficulty=o.difficulty||'normal',max_seconds=positive(o['max-seconds'],2400),snapshot=o['snapshot-at']===undefined?null:positive(o['snapshot-at']);
 let m=createMatch({seed,map,mode,factions:o.factions?.split(','),difficulty});let saved=false;
 while(!m.state.ended&&m.state.tick<Math.floor(max_seconds/0.5)){step(m,Math.min(1,Math.floor(max_seconds/0.5)*0.5-m.state.time));if(snapshot!==null&&!saved&&m.state.time>=snapshot){m=restore(JSON.parse(serialize(m)));saved=true;}}
 return {seed,map,mode,factions:m.state.config.factions,difficulty,max_seconds,winner_team:m.state.winner_team,duration_s:m.state.time,final_hash:hashState(m)};
}
function main(){const [command,...args]=process.argv.slice(2);
 if(command==='catalog'){options(args,[]);return getCatalog();}
 if(command==='match')return matchResult(options(args,['seed','map','mode','factions','difficulty','max-seconds','snapshot-at']));
 if(command==='duel'){const o=options(args,['faction','a','b','seed']);if(!o.faction||!o.a||!o.b)throw Error('Taraf ve iki birlik gerekli');return runDuel({faction:o.faction,a:o.a,b:o.b,seed:integer(o.seed,1)});}
 if(command==='balance'){
  const o=options(args,['output','max-seconds','seed']),catalog=getCatalog(),matches=[],start=integer(o.seed,1),limit=positive(o['max-seconds'],2400);let seed=start;
  for(const a of catalog.factions)for(const b of catalog.factions)if(a.id!==b.id)for(const map of catalog.maps){const r=matchResult({seed:String(seed++),map:map.id,mode:'1v1',factions:`${a.id},${b.id}`,difficulty:'normal','max-seconds':String(limit)});const {final_hash,...record}=r;matches.push(record);}
  const faction_win_rate=Object.fromEntries(catalog.factions.map(f=>{const games=matches.filter(m=>m.factions.includes(f.id)),wins=games.filter(m=>m.winner_team!==null&&m.factions[m.winner_team]===f.id);return [f.id,wins.length/games.length];}));
  const output=o.output?resolve(o.output):resolve(root,'../docs/balance-report.json');mkdirSync(dirname(output),{recursive:true});
  const report={generated_by:'node '+[relative(process.cwd(),process.argv[1]),...process.argv.slice(2)].map(x=>/\s/.test(x)?JSON.stringify(x):x).join(' '),matches,faction_win_rate};writeFileSync(output,JSON.stringify(report,null,2)+'\n');return report;
 }
 throw Error('Komut: catalog | match | duel | balance');
}
try{process.stdout.write(JSON.stringify(main())+'\n');}catch(error){process.stdout.write(JSON.stringify({error:error.message})+'\n');process.exitCode=1;}
