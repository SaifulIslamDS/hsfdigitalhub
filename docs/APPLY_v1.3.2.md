# Apply v1.3.2 over v1.3.1

## 1. Apply the patch

From the Git repository root in PowerShell:

```powershell
$PatchZip = "$HOME\Downloads\hsfdigitalhub-v1.3.1-to-v1.3.2-patch.zip"
$Temp = Join-Path $env:TEMP "hsfdigitalhub-v1.3.2-patch"

Remove-Item $Temp -Recurse -Force -ErrorAction SilentlyContinue
Expand-Archive -Path $PatchZip -DestinationPath $Temp -Force
Copy-Item -Path (Join-Path $Temp "hsfdigitalhub-v1.3.1-to-v1.3.2-patch\*") -Destination . -Recurse -Force
```

## 2. Configure Netlify

Add or update this environment variable:

```text
HSF_IDLE_TIMEOUT_MINUTES=30
```

The default is 30 minutes when the variable is absent. Valid values are 1 through 720 whole minutes.

Existing required variables remain unchanged:

```text
HSF_ACCESS_PIN
HSF_ACCESS_SECRET
```

Trigger a new production deploy after changing the environment variable.

## 3. Review before committing

```powershell
git status
git diff --check
git diff --stat
git diff -- netlify/edge-functions/pin-gate.ts netlify/edge-functions/pin-login.ts netlify/edge-functions/pin-logout.ts
```

## 4. Acceptance test

For quick testing, `HSF_IDLE_TIMEOUT_MINUTES` may temporarily be set to `1`, followed by a Netlify redeploy.

Confirm:

1. Correct PIN grants access.
2. Normal activity keeps the session authorized.
3. Complete inactivity for the configured duration returns the browser to the PIN screen.
4. Returning to a protected URL after timeout still requires the PIN.
5. Activity in one open Hub tab keeps other Hub tabs alive through the shared browser activity timestamp.
6. Manual **Sign out** continues to work.
7. The 12-hour absolute session still remains the maximum.

After testing, restore:

```text
HSF_IDLE_TIMEOUT_MINUTES=30
```

and redeploy.
