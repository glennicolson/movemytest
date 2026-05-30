<?php
// DTC -> MMT Sync - DEBUG VERSION
// Run: php /home/u385361430/scripts/sync-debug.php

// ── Debug: Show current time ──
echo "[Sync] Starting at " . date('Y-m-d H:i:s') . "\n";

// ── Load .env ──
$envFile = '/home/u385361430/domains/movemytest.co.uk/public_html/.builds/config/.env';
echo "[Sync] Loading .env from: $envFile\n";
echo "[Sync] File exists: " . (file_exists($envFile) ? 'YES' : 'NO') . "\n";

if (file_exists($envFile)) {
    $lines = file($envFile, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES);
    echo "[Sync] .env has " . count($lines) . " lines\n";
    foreach ($lines as $line) {
        if (strpos($line, '=') !== false && strpos($line, '#') !== 0) {
            putenv($line);
        }
    }
}

// ── Debug: Check env vars ──
$dtcUrl = getenv('DTC_DATABASE_URL');
$mmtUrl = getenv('DATABASE_URL');

echo "[Sync] DTC_DATABASE_URL: " . ($dtcUrl ? substr($dtcUrl, 0, 50) . '...' : 'MISSING') . "\n";
echo "[Sync] DATABASE_URL: " . ($mmtUrl ? substr($mmtUrl, 0, 50) . '...' : 'MISSING') . "\n";

if (!$dtcUrl || !$mmtUrl) {
    echo "[Sync] ERROR: Missing database URLs\n";
    exit(1);
}

// ── Parse URLs ──
function parseDbUrl($url) {
    $parts = parse_url($url);
    return [
        'host' => $parts['host'] ?? 'localhost',
        'port' => $parts['port'] ?? 3306,
        'user' => $parts['user'] ?? '',
        'pass' => $parts['pass'] ?? '',
        'db' => ltrim($parts['path'] ?? '', '/')
    ];
}

$dtc = parseDbUrl($dtcUrl);
$mmt = parseDbUrl($mmtUrl);

echo "[Sync] DTC DB: {$dtc['db']} on {$dtc['host']}:{$dtc['port']}\n";
echo "[Sync] MMT DB: {$mmt['db']} on {$mmt['host']}:{$mmt['port']}\n";

// ── Connect ──
try {
    echo "[Sync] Connecting to DTC...\n";
    $dtcPdo = new PDO("mysql:host={$dtc['host']};port={$dtc['port']};dbname={$dtc['db']}", $dtc['user'], $dtc['pass'], [PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION]);
    echo "[Sync] DTC connected OK\n";
    
    echo "[Sync] Connecting to MMT...\n";
    $mmtPdo = new PDO("mysql:host={$mmt['host']};port={$mmt['port']};dbname={$mmt['db']}", $mmt['user'], $mmt['pass'], [PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION]);
    echo "[Sync] MMT connected OK\n";
} catch (PDOException $e) {
    echo "[Sync] ERROR: " . $e->getMessage() . "\n";
    exit(1);
}

// ── Step 1: Count ALL DTC listings ──
echo "[Sync] Checking DTC TestSwapListing table...\n";
$countStmt = $dtcPdo->query("SELECT COUNT(*) as count FROM TestSwapListing");
$totalCount = (int)$countStmt->fetch(PDO::FETCH_ASSOC)['count'];
echo "[Sync] DTC has {$totalCount} TOTAL listings\n";

// ── Step 2: Count ACTIVE listings ──
$activeStmt = $dtcPdo->query("SELECT COUNT(*) as count FROM TestSwapListing WHERE status = 'ACTIVE'");
$activeCount = (int)$activeStmt->fetch(PDO::FETCH_ASSOC)['count'];
echo "[Sync] DTC has {$activeCount} ACTIVE listings\n";

// ── Step 3: Count non-expired ACTIVE listings ──
$validStmt = $dtcPdo->query("SELECT COUNT(*) as count FROM TestSwapListing WHERE status = 'ACTIVE' AND expiresAt > NOW()");
$validCount = (int)$validStmt->fetch(PDO::FETCH_ASSOC)['count'];
echo "[Sync] DTC has {$validCount} ACTIVE+VALID listings\n";

// ── Step 4: Show sample listings ──
if ($validCount > 0) {
    $sample = $dtcPdo->query("SELECT id, status, expiresAt FROM TestSwapListing WHERE status = 'ACTIVE' LIMIT 3");
    $rows = $sample->fetchAll(PDO::FETCH_ASSOC);
    echo "[Sync] Sample listings:\n";
    foreach ($rows as $row) {
        echo "  - {$row['id']} | status={$row['status']} | expires={$row['expiresAt']}\n";
    }
}

// ── Step 5: Check MMT existing shadows ──
$shadowStmt = $mmtPdo->query("SELECT COUNT(*) as count FROM Listing WHERE source = 'DTC'");
$shadowCount = (int)$shadowStmt->fetch(PDO::FETCH_ASSOC)['count'];
echo "[Sync] MMT has {$shadowCount} DTC shadow listings\n";

// ── Step 6: Fetch and sync ──
echo "[Sync] Fetching DTC listings...\n";
$stmt = $dtcPdo->query("SELECT id, currentCentreId, originalCentreId, currentDateTime, testType, hasRemainingChange, desiredDateFrom, desiredDateTo, desiredTimePreference, desiredCentreIds, desiredDirection, status, jurisdiction, expiresAt, createdAt FROM TestSwapListing WHERE status = 'ACTIVE' AND expiresAt > NOW() LIMIT 500");

$listings = $stmt->fetchAll(PDO::FETCH_ASSOC);
echo "[Sync] Fetched " . count($listings) . " listings to sync\n";

if (count($listings) === 0) {
    echo "[Sync] Nothing to sync. Exiting.\n";
    exit(0);
}

// ── Step 7: Get existing MMT shadows ──
$existingStmt = $mmtPdo->query("SELECT dtcListingId FROM Listing WHERE source = 'DTC'");
$existingIds = [];
while ($row = $existingStmt->fetch(PDO::FETCH_ASSOC)) {
    $existingIds[$row['dtcListingId']] = true;
}
echo "[Sync] Found " . count($existingIds) . " existing shadows in MMT\n";

// ── Step 8: Sync ──
$synced = 0;
$errors = 0;

foreach ($listings as $row) {
    try {
        $data = [
            $row['id'],
            $row['currentCentreId'],
            $row['originalCentreId'] ?: null,
            $row['currentDateTime'],
            $row['testType'],
            $row['hasRemainingChange'] ? 1 : 0,
            $row['desiredDateFrom'],
            $row['desiredDateTo'],
            $row['desiredTimePreference'] ?: 'ANY',
            $row['desiredCentreIds'],
            $row['desiredDirection'],
            $row['status'],
            $row['jurisdiction'],
            $row['expiresAt'],
            $row['createdAt']
        ];

        if (isset($existingIds[$row['id']])) {
            $mmtPdo->prepare("UPDATE Listing SET currentCentreId = ?, originalCentreId = ?, currentDateTime = ?, testType = ?, hasRemainingChange = ?, desiredDateFrom = ?, desiredDateTo = ?, desiredTimePreference = ?, desiredCentreIds = ?, desiredDirection = ?, status = ?, jurisdiction = ?, expiresAt = ?, updatedAt = NOW() WHERE dtcListingId = ? AND source = 'DTC'")
                ->execute([$data[1], $data[2], $data[3], $data[4], $data[5], $data[6], $data[7], $data[8], $data[9], $data[10], $data[11], $data[12], $data[13], $data[0]]);
            echo "[Sync] Updated {$row['id']}\n";
        } else {
            $mmtPdo->prepare("INSERT INTO Listing (id, source, dtcListingId, accountId, currentCentreId, originalCentreId, currentDateTime, testType, hasRemainingChange, desiredDateFrom, desiredDateTo, desiredTimePreference, desiredCentreIds, desiredDirection, status, jurisdiction, expiresAt, createdAt, updatedAt) VALUES (UUID(), 'DTC', ?, NULL, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())")
                ->execute($data);
            echo "[Sync] Inserted {$row['id']}\n";
        }
        $synced++;
    } catch (PDOException $e) {
        echo "[Sync] ERROR {$row['id']}: " . $e->getMessage() . "\n";
        $errors++;
    }
}

// ── Step 9: Withdraw stale ──
$currentIds = array_flip(array_column($listings, 'id'));
$withdrawnIds = array_diff(array_keys($existingIds), array_keys($currentIds));
if (count($withdrawnIds) > 0) {
    $placeholders = implode(',', array_fill(0, count($withdrawnIds), '?'));
    $mmtPdo->prepare("UPDATE Listing SET status = 'EXPIRED', updatedAt = NOW() WHERE source = 'DTC' AND dtcListingId IN ($placeholders)")
        ->execute(array_values($withdrawnIds));
    echo "[Sync] Withdrawn " . count($withdrawnIds) . " stale listings\n";
}

echo "[Sync] COMPLETE: synced={$synced}, errors={$errors}\n";
exit($errors > 0 ? 1 : 0);
