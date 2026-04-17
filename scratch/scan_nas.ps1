$pathsToCheck = @(
    "\\nas\Soledad Correa\BACKUP S23\Telegram",
    "C:\nas\Soledad Correa\BACKUP S23\Telegram",
    "D:\nas\Soledad Correa\BACKUP S23\Telegram",
    "Z:\nas\Soledad Correa\BACKUP S23\Telegram",
    "\\localhost\nas\Soledad Correa\BACKUP S23\Telegram"
)

$foundPath = $null

foreach ($path in $pathsToCheck) {
    if (Test-Path $path) {
        $foundPath = $path
        break
    }
}

if ($foundPath) {
    Write-Output "Found path: $foundPath" > .\scratch\nas_result.txt
    Get-ChildItem -Path $foundPath -File | Select-Object -First 10 | ForEach-Object { $_.FullName } >> .\scratch\nas_result.txt
} else {
    Write-Output "Path not found in common locations." > .\scratch\nas_result.txt
    # check if 'nas' drive is mounted
    Get-PSDrive >> .\scratch\nas_result.txt
}
