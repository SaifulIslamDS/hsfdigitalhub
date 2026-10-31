# HSF Design Studio Phase 1 — controlled source patch wrapper.
$ErrorActionPreference = 'Stop'
Set-StrictMode -Version Latest
if (-not (Test-Path './.git')) { throw 'Run this script from the hsfdigitalhub Git repository root.' }
if (-not (Test-Path './scripts/studio_phase1.py')) { throw 'Missing scripts/studio_phase1.py. Extract the ZIP into your Git repository root.' }
python ./scripts/studio_phase1.py apply
if ($LASTEXITCODE -ne 0) { throw "Phase 1 patch/validation failed (exit code $LASTEXITCODE). Review output; do not commit." }
Write-Host 'Patch source applied and basic Phase 1 validator passed. Run full validation commands before commit.' -ForegroundColor Green
