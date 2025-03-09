# PowerShell deployment script for Windows

# Build the client
Write-Host "Building client..." -ForegroundColor Green
Set-Location -Path client-ts
npm run build

# Copy the build to the server's public directory
Write-Host "Copying build to server..." -ForegroundColor Green
if (Test-Path -Path "../server/public") {
    Remove-Item -Path "../server/public" -Recurse -Force
}
New-Item -Path "../server/public" -ItemType Directory -Force
Copy-Item -Path "build/*" -Destination "../server/public/" -Recurse

# Deploy to Netlify
Write-Host "Deploying to Netlify..." -ForegroundColor Green
Set-Location -Path "../server"
netlify deploy --prod

Write-Host "Deployment complete!" -ForegroundColor Green 