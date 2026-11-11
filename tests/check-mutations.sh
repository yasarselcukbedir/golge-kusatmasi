#!/usr/bin/env bash
set -euo pipefail
mutation_game_root="$(cd "$(dirname "$0")/.." && pwd)"
python3 "$mutation_game_root/tests/prepare-mutations.py"
mutation_work="$mutation_game_root/../docs/mutation-work"
for mutation_case in population_cap production_payment power_payment ability_range camp_gold; do
  if node "$mutation_work/$mutation_case/game/tests/run-tests.mjs" > "$mutation_work/$mutation_case.log"; then
    printf 'SURVIVED %s\n' "$mutation_case"
    exit 1
  fi
done
python3 - "$mutation_work" <<'PY'
import sys,re,json,shutil
from pathlib import Path
work=Path(sys.argv[1]);results=[]
for path in sorted(work.glob('*.log')):
    text=path.read_text();last=text.strip().splitlines()[-1]
    match=re.fullmatch(r'TESTS passed=(\d+) failed=(\d+)',last)
    assert match and int(match[2])>0,(path,last)
    results.append({'mutation':path.stem,'detected':True,'passed':int(match[1]),'failed':int(match[2]),'failing_assertions':[line for line in text.splitlines()if line.startswith('FAIL ')]})
assert len(results)==5
(work.parent/'mutation-report.json').write_text(json.dumps({'detected':5,'survived':0,'results':results},ensure_ascii=False,indent=2)+'\n')
shutil.rmtree(work)
print('MUTATIONS detected=5 survived=0')
PY
