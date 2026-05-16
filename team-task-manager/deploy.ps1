# Install Railway CLI if not already installed
try {
    railway --version | Out-Null
    Write-Host "Railway CLI is already installed." -ForegroundColor Green
} catch {
    Write-Host "Installing Railway CLI..." -ForegroundColor Yellow
    npm i -g @railway/cli
}

Write-Host "`nLogging into Railway..." -ForegroundColor Yellow
Write-Host "A browser window will open. Please authenticate with your Railway account." -ForegroundColor Cyan
railway login

Write-Host "`nInitializing Railway project..." -ForegroundColor Yellow
railway init

Write-Host "`nDeploying to Railway..." -ForegroundColor Yellow
railway up

Write-Host "`nDeployment process completed! Check your Railway Dashboard for the status." -ForegroundColor Green
