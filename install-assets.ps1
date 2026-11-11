# SPLAT WALL asset installer — Windows PowerShell
# Downloads selected Kenney CC0 GLB models from the public Kenney mirror.
$ErrorActionPreference = "Stop"
$root = Join-Path $PSScriptRoot "public\assets"
$folders = @("characters","fruits","props")
foreach ($folder in $folders) { New-Item -ItemType Directory -Force -Path (Join-Path $root $folder) | Out-Null }

$base = "https://raw.githubusercontent.com/shorepine/kenney/main/"
$assets = @(
  @{ Path="3d/blocky-characters/character-a.glb"; Out="characters/character-a.glb" },
  @{ Path="3d/blocky-characters/character-b.glb"; Out="characters/character-b.glb" },
  @{ Path="3d/blocky-characters/character-c.glb"; Out="characters/character-c.glb" },
  @{ Path="3d/mini-characters/character-male-a.glb"; Out="characters/mini-male-a.glb" },
  @{ Path="3d/mini-characters/character-female-a.glb"; Out="characters/mini-female-a.glb" },
  @{ Path="3d/food/apple.glb"; Out="fruits/apple.glb" },
  @{ Path="3d/food/banana.glb"; Out="fruits/banana.glb" },
  @{ Path="3d/food/orange.glb"; Out="fruits/orange.glb" },
  @{ Path="3d/food/tomato.glb"; Out="fruits/tomato.glb" },
  @{ Path="3d/food/watermelon.glb"; Out="fruits/watermelon.glb" },
  @{ Path="3d/food/pineapple.glb"; Out="fruits/pineapple.glb" },
  @{ Path="3d/blaster/grenade-a.glb"; Out="props/paint-capsule.glb" }
)
foreach ($asset in $assets) {
  $url = $base + $asset.Path
  $dest = Join-Path $root $asset.Out
  Write-Host "Downloading $($asset.Out) ..."
  Invoke-WebRequest -Uri $url -OutFile $dest
}
$license = @"
Kenney assets mirror: https://github.com/shorepine/kenney
Original asset publisher: Kenney — https://kenney.nl
License: CC0 1.0 (verify the included/original pack license before redistribution).
This project downloads only selected GLB files for local game use.
"@
Set-Content -Path (Join-Path $root "ASSET-SOURCES.txt") -Value $license -Encoding UTF8
Write-Host ""
Write-Host "SPLAT WALL assets installed. Restart npm start and refresh the browser."
