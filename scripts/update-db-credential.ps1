# CoinLift - Secure DATABASE_URL Updater
# Prompts for PostgreSQL password using hidden input, URL-encodes it, and updates .env safely.

$ErrorActionPreference = "Stop"

$envPath = Join-Path $PSScriptRoot "..\.env"
if (-not (Test-Path $envPath)) {
    Write-Error ".env file not found at $envPath"
    exit 1
}

$lines = Get-Content -Path $envPath

# Validate that exactly one DATABASE_URL entry exists in .env
$dbUrlMatches = @($lines | Where-Object { $_ -match '^DATABASE_URL=' })
if ($dbUrlMatches.Count -ne 1) {
    Write-Error "Validation failed: Expected exactly 1 DATABASE_URL entry in .env, found $($dbUrlMatches.Count). Operation aborted."
    exit 1
}

Write-Host "Please enter your PostgreSQL password (input will be hidden):" -ForegroundColor Cyan
$securePass = Read-Host -Prompt "Password" -AsSecureString

$bstr = [System.Runtime.InteropServices.Marshal]::SecureStringToBSTR($securePass)
$plainPass = [System.Runtime.InteropServices.Marshal]::PtrToStringAuto($bstr)
[System.Runtime.InteropServices.Marshal]::ZeroFreeBSTR($bstr)

if ([string]::IsNullOrEmpty($plainPass)) {
    Write-Host "Password cannot be empty. Operation aborted." -ForegroundColor Yellow
    exit 1
}

# URL-encode the password
$encodedPass = [System.Uri]::EscapeDataString($plainPass)
$plainPass = $null

$updatedLines = @()
foreach ($line in $lines) {
    if ($line -match '^DATABASE_URL=') {
        $updatedLines += "DATABASE_URL=`"postgresql://postgres:${encodedPass}@localhost:5432/coinlift_db?schema=public`""
    } else {
        $updatedLines += $line
    }
}

Set-Content -Path $envPath -Value $updatedLines -Encoding UTF8

Write-Host "`n[SUCCESS] Successfully updated DATABASE_URL in .env with URL-encoded credentials." -ForegroundColor Green
Write-Host "[SECURITY] Password was kept hidden and was not written to terminal output." -ForegroundColor Green
