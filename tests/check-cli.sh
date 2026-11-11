#!/usr/bin/env bash
set -euo pipefail
cli_game_root="$(cd "$(dirname "$0")/.." && pwd)"
cli_work_dir="$cli_game_root/../docs/cli-check-work"
mkdir -p "$cli_work_dir"
node "$cli_game_root/tools/sim-cli.mjs" match --seed 1 > "$cli_work_dir/seed-1.json"
node "$cli_game_root/tools/sim-cli.mjs" match --seed 1 --snapshot-at 300 > "$cli_work_dir/snapshot-1.json"
node "$cli_game_root/tools/sim-cli.mjs" match --seed 2 > "$cli_work_dir/seed-2.json"
node "$cli_game_root/tools/sim-cli.mjs" match --seed 2 --snapshot-at 300 > "$cli_work_dir/snapshot-2.json"
node "$cli_game_root/tools/sim-cli.mjs" match --seed 3 > "$cli_work_dir/seed-3.json"
node "$cli_game_root/tools/sim-cli.mjs" match --seed 3 --snapshot-at 300 > "$cli_work_dir/snapshot-3.json"
node "$cli_game_root/tools/sim-cli.mjs" match --seed 4 > "$cli_work_dir/seed-4.json"
node "$cli_game_root/tools/sim-cli.mjs" match --seed 5 > "$cli_work_dir/seed-5.json"
node "$cli_game_root/tools/sim-cli.mjs" match --seed 1 --mode 1v1 --max-seconds 600 > "$cli_work_dir/mode-1v1.json"
node "$cli_game_root/tools/sim-cli.mjs" match --seed 1 --mode 1v2 --max-seconds 600 > "$cli_work_dir/mode-1v2.json"
node "$cli_game_root/tools/sim-cli.mjs" match --seed 1 --mode 1v3 --max-seconds 600 > "$cli_work_dir/mode-1v3.json"
node "$cli_game_root/tools/sim-cli.mjs" match --seed 1 --mode 2v1 --max-seconds 600 > "$cli_work_dir/mode-2v1.json"
node "$cli_game_root/tools/sim-cli.mjs" match --seed 1 --mode 2v2 --max-seconds 600 > "$cli_work_dir/mode-2v2.json"
node "$cli_game_root/tools/sim-cli.mjs" match --seed 1 --mode 2v3 --max-seconds 600 > "$cli_work_dir/mode-2v3.json"
node "$cli_game_root/tools/sim-cli.mjs" match --seed 1 --mode 3v1 --max-seconds 600 > "$cli_work_dir/mode-3v1.json"
node "$cli_game_root/tools/sim-cli.mjs" match --seed 1 --mode 3v2 --max-seconds 600 > "$cli_work_dir/mode-3v2.json"
cli_case_start=$SECONDS
node "$cli_game_root/tools/sim-cli.mjs" match --seed 1 --mode 3v3 --max-seconds 600 > "$cli_work_dir/mode-3v3.json"
printf '%s\n' "$((SECONDS-cli_case_start))" > "$cli_work_dir/mode-3v3.wall"
node "$cli_game_root/tools/sim-cli.mjs" match --seed 1 --mode 2v2 --map catal --max-seconds 600 > "$cli_work_dir/map-2v2-catal.json"
cli_case_start=$SECONDS
node "$cli_game_root/tools/sim-cli.mjs" match --seed 1 --mode 3v3 --map catal --max-seconds 1200 > "$cli_work_dir/map-3v3-catal.json"
printf '%s\n' "$((SECONDS-cli_case_start))" > "$cli_work_dir/map-3v3-catal.wall"
node "$cli_game_root/tools/sim-cli.mjs" match --seed 1 --mode 2v2 --map havza --max-seconds 600 > "$cli_work_dir/map-2v2-havza.json"
cli_case_start=$SECONDS
node "$cli_game_root/tools/sim-cli.mjs" match --seed 1 --mode 3v3 --map havza --max-seconds 1200 > "$cli_work_dir/map-3v3-havza.json"
printf '%s\n' "$((SECONDS-cli_case_start))" > "$cli_work_dir/map-3v3-havza.wall"
node "$cli_game_root/tools/sim-cli.mjs" match --seed 1 --mode 2v2 --map teras --max-seconds 600 > "$cli_work_dir/map-2v2-teras.json"
cli_case_start=$SECONDS
node "$cli_game_root/tools/sim-cli.mjs" match --seed 1 --mode 3v3 --map teras --max-seconds 1200 > "$cli_work_dir/map-3v3-teras.json"
printf '%s\n' "$((SECONDS-cli_case_start))" > "$cli_work_dir/map-3v3-teras.wall"
node "$cli_game_root/tools/sim-cli.mjs" match --seed 1 --mode 2v2 --map ayna --max-seconds 600 > "$cli_work_dir/map-2v2-ayna.json"
cli_case_start=$SECONDS
node "$cli_game_root/tools/sim-cli.mjs" match --seed 1 --mode 3v3 --map ayna --max-seconds 1200 > "$cli_work_dir/map-3v3-ayna.json"
printf '%s\n' "$((SECONDS-cli_case_start))" > "$cli_work_dir/map-3v3-ayna.wall"
node "$cli_game_root/tools/sim-cli.mjs" match --seed 1 --map catal --mode 1v1 --factions sedef,filiz --difficulty normal --max-seconds 2400 > "$cli_work_dir/replay-0.json"
node "$cli_game_root/tools/sim-cli.mjs" match --seed 2 --map havza --mode 1v1 --factions sedef,filiz --difficulty normal --max-seconds 2400 > "$cli_work_dir/replay-1.json"
node "$cli_game_root/tools/sim-cli.mjs" match --seed 3 --map teras --mode 1v1 --factions sedef,filiz --difficulty normal --max-seconds 2400 > "$cli_work_dir/replay-2.json"
node "$cli_game_root/tools/sim-cli.mjs" match --seed 120 --map ayna --mode 1v1 --factions prizma,yel --difficulty normal --max-seconds 2400 > "$cli_work_dir/replay-3.json"
node "$cli_game_root/tools/sim-cli.mjs" match --max-seconds 0.1 > "$cli_work_dir/short-limit.json"
cd "$cli_work_dir"
node "$cli_game_root/tools/sim-cli.mjs" catalog > catalog-other.json
if node "$cli_game_root/tools/sim-cli.mjs" match --seed invalid > invalid.json; then exit 1; fi
if node "$cli_game_root/tools/sim-cli.mjs" catalog --extra nope > invalid-option.json; then exit 1; fi
node "$cli_game_root/tests/verify-cli.mjs"
