from pathlib import Path
import shutil
root = Path(__file__).resolve().parents[1]
work = root.parent / 'docs' / 'mutation-work'
if work.exists(): shutil.rmtree(work)
source = (root / 'src/sim/index.js').read_text()
produce_start = source.index(" if(c.type==='produce'||")
produce_end = source.index(" if(c.type==='research'||", produce_start)
production = source[produce_start:produce_end]
mutations = {
    'population_cap': source.replace('||population(s,p.id)>=f.population', '', 1),
    'production_payment': source[:produce_start] + production.replace("if(!spend(p,d.cost))return fail('Yeterli öz yok');", '', 1) + source[produce_end:],
    'power_payment': source.replace('p.power-=a.cost;', '', 1),
    'ability_range': source.replace('distance(h,q)>a.range||', '', 1),
    'camp_gold': source.replace('p.gold+=RULES.campGold;', '', 1),
}
for name, mutated in mutations.items():
    assert mutated != source, name
    target = work / name / 'game'
    shutil.copytree(root / 'src', target / 'src')
    (target / 'tests').mkdir()
    shutil.copyfile(root / 'tests/run-tests.mjs', target / 'tests/run-tests.mjs')
    shutil.copyfile(root / 'tests/audio-checks.mjs', target / 'tests/audio-checks.mjs')
    shutil.copyfile(root / 'package.json', target / 'package.json')
    (target / 'src/sim/index.js').write_text(mutated)
