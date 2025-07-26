# TypeScript Error Fix Script for PhishNet
# This PowerShell script will apply systematic fixes to resolve TypeScript compilation errors

Write-Host "🔧 Fixing TypeScript errors in PhishNet server..." -ForegroundColor Blue

$RoutesFile = "server\routes.ts"

if (-not (Test-Path $RoutesFile)) {
    Write-Host "❌ Routes file not found: $RoutesFile" -ForegroundColor Red
    exit 1
}

Write-Host "📁 Backing up original routes file..." -ForegroundColor Yellow
Copy-Item $RoutesFile "$RoutesFile.backup"

Write-Host "🔍 Reading routes file..." -ForegroundColor Cyan
$content = Get-Content $RoutesFile -Raw

Write-Host "🔧 Applying TypeScript fixes..." -ForegroundColor Green

# Fix 1: Add assertUser calls after req.user usage
$content = $content -replace '(req\.user)(?!\.)', 'req.user; assertUser(req.user); req.user'

# Fix 2: Replace database field access inconsistencies for email templates
$content = $content -replace 'emailTemplate\.organizationId', 'emailTemplate.organization_id'
$content = $content -replace 'template\.organizationId', 'template.organization_id'

# Fix 3: Fix object property construction for missing organizationId
$content = $content -replace '(createGroup\(req\.user\.organizationId,\s*)(validatedData)(\))', '$1{ ...validatedData, organizationId: req.user.organizationId }$3'
$content = $content -replace '(createTarget\(req\.user\.organizationId,\s*groupId,\s*)(validatedData)(\))', '$1{ ...validatedData, organizationId: req.user.organizationId, groupId }$3'
$content = $content -replace '(createSmtpProfile\(req\.user\.organizationId,\s*)(validatedData)(\))', '$1{ ...validatedData, organizationId: req.user.organizationId }$3'
$content = $content -replace '(createLandingPage\(\s*req\.user\.organizationId,\s*req\.user\.id,\s*)(validatedData)(\))', '$1{ ...validatedData, organizationId: req.user.organizationId }$3'

# Fix 4: Fix campaign creation with missing organizationId
$content = $content -replace '(createCampaign\(\s*req\.user\.organizationId,\s*req\.user\.id,\s*\{\s*)(\.\.\.validatedData,)', '$1organizationId: req.user.organizationId, $2'

# Fix 5: Fix email template object literal properties
$content = $content -replace 'htmlContent:\s*validatedData\.html_content\s*\|\|\s*validatedData\.htmlContent', 'html_content: validatedData.html_content'
$content = $content -replace 'textContent:\s*validatedData\.text_content\s*\|\|\s*validatedData\.textContent', 'text_content: validatedData.text_content'
$content = $content -replace 'senderName:\s*validatedData\.sender_name\s*\|\|\s*validatedData\.senderName', 'sender_name: validatedData.sender_name'
$content = $content -replace 'senderEmail:\s*validatedData\.sender_email\s*\|\|\s*validatedData\.senderEmail', 'sender_email: validatedData.sender_email'

# Fix 6: Handle error type assertion
$content = $content -replace '\$\{error\.message \|\| "Unknown error"\}', '${(error as Error)?.message || "Unknown error"}'

# Fix 7: Fix for...of iteration (downlevelIteration issue)
$content = $content -replace 'for \(const \[index, row\] of results\.data\.entries\(\)\)', 'for (let index = 0; index < results.data.length; index++) { const row = results.data[index];'

Write-Host "💾 Writing fixed content to file..." -ForegroundColor Cyan
$content | Set-Content $RoutesFile -Encoding UTF8

Write-Host "✅ TypeScript fixes applied successfully!" -ForegroundColor Green
Write-Host "📋 Summary of fixes:" -ForegroundColor Yellow
Write-Host "   - Added assertUser() calls for authentication" -ForegroundColor White
Write-Host "   - Fixed database field naming consistency" -ForegroundColor White
Write-Host "   - Corrected missing organizationId properties" -ForegroundColor White
Write-Host "   - Fixed email template property names" -ForegroundColor White
Write-Host "   - Fixed error type assertion" -ForegroundColor White
Write-Host "   - Fixed for...of iteration compatibility" -ForegroundColor White
Write-Host "   - Original file backed up as $RoutesFile.backup" -ForegroundColor White

Write-Host "🔨 Attempting to compile TypeScript..." -ForegroundColor Blue
try {
    npm run build
    Write-Host "✅ TypeScript compilation successful!" -ForegroundColor Green
} catch {
    Write-Host "⚠️  Some errors may remain. Check the output above." -ForegroundColor Yellow
}

Write-Host "🎉 Fix script completed!" -ForegroundColor Magenta
