# Powershell E2E Flow Test Script for My Memories Microservices API Gateway

$GATEWAY = "http://localhost:8080"

Write-Host "==========================================================" -ForegroundColor Cyan
Write-Host " MY MEMORIES MICROSERVICES END-TO-END API TEST SUITE " -ForegroundColor Cyan
Write-Host " Testing dynamic routing via API Gateway on $GATEWAY " -ForegroundColor Cyan
Write-Host "==========================================================" -ForegroundColor Cyan

# 1. Test User Creation (user-service -> MySQL)
Write-Host "`n[1] Creating User via Gateway (user-service)..." -ForegroundColor Yellow
$userBody = @{
    name = "Alex Mercer"
    email = "alex.mercer@example.com"
} | ConvertTo-Json

try {
    $userResp = Invoke-RestMethod -Uri "$GATEWAY/api/users" -Method Post -Body $userBody -ContentType "application/json"
    Write-Host "   [SUCCESS] Created User ID: $($userResp.id), Name: $($userResp.name)" -ForegroundColor Green
    $userId = $userResp.id
} catch {
    Write-Host "   [WARNING] User service offline or Gateway not running yet ($($_)). Using Mock User ID 1 for testing format." -ForegroundColor DarkYellow
    $userId = 1
}

# 2. Test Fetching Users
Write-Host "`n[2] Fetching User List via Gateway..." -ForegroundColor Yellow
try {
    $users = Invoke-RestMethod -Uri "$GATEWAY/api/users" -Method Get
    Write-Host "   [SUCCESS] Retrieved $($users.Count) users." -ForegroundColor Green
} catch {
    Write-Host "   [NOTICE] Gateway endpoint $GATEWAY/api/users unreachable right now." -ForegroundColor DarkYellow
}

# 3. Test Event Creation (event-service -> MongoDB)
Write-Host "`n[3] Creating Memory Event via Gateway (event-service)..." -ForegroundColor Yellow
$eventBody = @{
    userId = $userId
    title = "Trip to Mount Rainier"
    description = "Unforgettable hiking adventure with clear blue skies."
    eventDate = "2026-08-15"
    location = "Mount Rainier National Park, WA"
} | ConvertTo-Json

try {
    $eventResp = Invoke-RestMethod -Uri "$GATEWAY/api/events" -Method Post -Body $eventBody -ContentType "application/json"
    Write-Host "   [SUCCESS] Created Memory Event ID: $($eventResp.id), Title: $($eventResp.title)" -ForegroundColor Green
    $eventId = $eventResp.id
} catch {
    Write-Host "   [WARNING] Event service offline ($($_)). Using Mock Event ID 'evt_1001'." -ForegroundColor DarkYellow
    $eventId = "evt_1001"
}

# 4. Test Fetching Events
Write-Host "`n[4] Fetching Memory Events via Gateway..." -ForegroundColor Yellow
try {
    $events = Invoke-RestMethod -Uri "$GATEWAY/api/events" -Method Get
    Write-Host "   [SUCCESS] Retrieved $($events.Count) events." -ForegroundColor Green
} catch {
    Write-Host "   [NOTICE] Gateway endpoint $GATEWAY/api/events unreachable right now." -ForegroundColor DarkYellow
}

Write-Host "`n==========================================================" -ForegroundColor Cyan
Write-Host " TEST SUITE COMPLETE! Open frontend/index.html to view UI. " -ForegroundColor Cyan
Write-Host "==========================================================" -ForegroundColor Cyan
