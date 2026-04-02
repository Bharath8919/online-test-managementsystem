$files = @(
    "c:\Users\lenovo\Downloads\online-test-managementsystem\Views\Contactus.ejs",
    "c:\Users\lenovo\Downloads\online-test-managementsystem\public\HTML\aboutus.html",
    "c:\Users\lenovo\Downloads\online-test-managementsystem\public\HTML\faq.html",
    "c:\Users\lenovo\Downloads\online-test-managementsystem\public\HTML\scroll.html"
)

$searchHead = "/CSS/navbar.css"
$insertHead = '<link rel="stylesheet" href="/CSS/dark-theme.css"><script src="/HTML/theme.js"></script>'

$searchNav = '/leaderboard" class="nav_item">Leaderboard</a></li>'
$insertNav = '<li><a href="/leaderboard" class="nav_item">Leaderboard</a></li><li class="nav-item d-flex align-items-center"><div class="theme-switch-wrapper me-3"><label class="theme-switch" for="checkbox"><input type="checkbox" id="checkbox" /><div class="slider round"></div></label></div></li>'

foreach ($f in $files) {
    if (Test-Path $f) {
        $content = [IO.File]::ReadAllText($f)
        
        # Add head links if not already there
        if ($content -notlike "*dark-theme.css*") {
            if ($content -match '<link[^>]+href="[^"]*navbar\.css"[^>]*>') {
                $match = $Matches[0]
                $content = $content.Replace($match, "$match`n    $insertHead")
            }
        }
        
        # Add nav toggle if not already there
        if ($content -notlike "*theme-switch-wrapper*") {
            # Try to match the leaderboard link
            if ($content -match '<li><a[^>]+href="[^"]*leaderboard"[^>]*>Leaderboard</a></li>') {
                $match = $Matches[0]
                $content = $content.Replace($match, "$match`n            $insertNav")
            }
        }
        
        [IO.File]::WriteAllText($f, $content)
        Write-Host "Updated $f"
    }
}
