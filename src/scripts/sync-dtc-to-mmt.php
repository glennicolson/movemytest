<?php
/**
 * DTC → MMT Sync Script (PHP)
 * 
 * Runs on Hostinger shared hosting where Node.js is not available in SSH.
 * Uses PDO to connect to both databases and sync listings.
 * 
 * Usage:
 *   php src/scripts/sync-dtc-to-mmt.php
 * 
 * Requires:
 *   - DTC_DATABASE_URL in environment or .env
 *   - DATABASE_URL in environment or .env
 *   - PHP PDO with MySQL driver
 */

// ── Load .env ──
$envFile = __DIR__ . '/../../.env';
if (file_exists($envFile)) {
    $lines = file($envFile, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES);
    foreach ($lines as $line) {
        if (strpos($line, '=') !== false && strpos($line, '#') !== 0) {
            putenv($line);
            list($key, $value) = explode('=', $line, 2);
            $_ENV[$key] = $value;
            $_SERVER[$key] = $value;
        }
    }
}

// ── Parse database URLs ──
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

$dtcUrl = getenv('DTC_DATABASE_URL');
$mmtUrl = getenv('DATABASE_URL');

if (!$dtcUrl || !$mmtUrl) {
    echo "[Sync] Error: Missing DTC_DATABASE_URL or DATABASE_URL\n";
    exit(1);
}

$dtc = parseDbUrl($dtcUrl);
$mmt = parseDbUrl($mmtUrl);

echo "[Sync] DTC DB: {$dtc['db']}\n";
echo "[Sync] MMT DB: {$mmt['db']}\n";

// ── Connect to both databases ──
try {
    $dtcPdo = new PDO(
        "mysql:host={$dtc['host']};port={$dtc['port']};dbname={$dtc['db']}",
        $dtc['user'],
        $dtc['pass'],
        [PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION]
    );
    
    $mmtPdo = new PDO(
        "mysql:host={$mmt['host']};port={$mmt['port']};dbname={$mmt['db']}",
        $mmt['user'],
        $mmt['pass'],
        [PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION]
    );
} catch (PDOException $e) {
    echo "[Sync] Connection failed: " . $e->getMessage() . "\n";
    exit(1);
}

// ── Step 1: Count DTC listings ──
$countStmt = $dtcPdo->query("SELECT COUNT(*) as count FROM TestSwapListing WHERE status = 'ACTIVE' AND expiresAt > NOW()");
$dtcCount = (int)$countStmt->fetch(PDO::FETCH_ASSOC)['count'];
echo "[Sync] DTC has {$dtcCount} ACTIVE listings\n";

// ── Step 2: Get DTC listings ──
$stmt = $dtcPdo->query("
    SELECT id, currentCentreId, originalCentreId, currentDateTime,
           testType, hasRemainingChange, desiredDateFrom, desiredDateTo,
           desiredTimePreference, desiredCentreIds, desiredDirection,
           status, jurisdiction, expiresAt, createdAt
    FROM TestSwapListing
    WHERE status = 'ACTIVE' AND expiresAt > NOW()
    LIMIT 500
");

$listings = $stmt->fetchAll(PDO::FETCH_ASSOC);
echo "[Sync] Fetched " . count($listings) . " listings\n";

// ── Step 3: Get existing shadow IDs ──
$existingStmt = $mmtPdo->query("SELECT dtcListingId FROM Listing WHERE source = 'DTC'");
$existingIds = [];
while ($row = $existingStmt->fetch(PDO::FETCH_ASSOC)) {
    $existingIds[] = $row['dtcListingId'];
}
$existingIds = array_flip($existingIds);

// ── Step 4: Upsert each listing ──
$synced = 0;
$errors = 0;

$insertSql = "INSERT INTO Listing 
    (id, source, dtcListingId, accountId, currentCentreId, originalCentreId, currentDateTime,
     testType, hasRemainingChange, desiredDateFrom, desiredDateTo, desiredTimePreference,
     desiredCentreIds, desiredDirection, status, jurisdiction, expiresAt, createdAt, updatedAt)
    VALUES (UUID(), ?, ?, NULL, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())";

$updateSql = "UPDATE Listing SET
    currentCentreId = ?, originalCentreId = ?, currentDateTime = ?,
    testType = ?, hasRemainingChange = ?, desiredDateFrom = ?, desiredDateTo = ?,
    desiredTimePreference = ?, desiredCentreIds = ?, desiredDirection = ?,
    status = ?, jurisdiction = ?, expiresAt = ?, updatedAt = NOW()
    WHERE dtcListingId = ? AND source = 'DTC'";

$insertStmt = $mmtPdo->prepare($insertSql);
$updateStmt = $mmtPdo->prepare($updateSql);

foreach ($listings as $row) {
    try {
        $data = [
            'source' => 'DTC',
            'dtcListingId' => $row['id'],
            'currentCentreId' => $row['currentCentreId'],
            'originalCentreId' => $row['originalCentreId'] ?: null,
            'currentDateTime' => $row['currentDateTime'],
            'testType' => $row['testType'],
            'hasRemainingChange' => $row['hasRemainingChange'] ? 1 : 0,
            'desiredDateFrom' => $row['desiredDateFrom'],
            'desiredDateTo' => $row['desiredDateTo'],
            'desiredTimePreference' => $row['desiredTimePreference'] ?: 'ANY',
            'desiredCentreIds' => $row['desiredCentreIds'],
            'desiredDirection' => $row['desiredDirection'],
            'status' => $row['status'],
            'jurisdiction' => $row['jurisdiction'],
            'expiresAt' => $row['expiresAt'],
            'createdAt' => $row['createdAt']
        ];

        if (isset($existingIds[$row['id']])) {
            $updateStmt->execute([
                $data['currentCentreId'], $data['originalCentreId'], $data['currentDateTime'],
                $data['testType'], $data['hasRemainingChange'], $data['desiredDateFrom'], $data['desiredDateTo'],
                $data['desiredTimePreference'], $data['desiredCentreIds'], $data['desiredDirection'],
                $data['status'], $data['jurisdiction'], $data['expiresAt'], $row['id']
            ]);
        } else {
            $insertStmt->execute([
                $data['source'], $data['dtcListingId'], $data['currentCentreId'], $data['originalCentreId'], $data['currentDateTime'],
                $data['testType'], $data['hasRemainingChange'], $data['desiredDateFrom'], $data['desiredDateTo'],
                $data['desiredTimePreference'], $data['desiredCentreIds'], $data['desiredDirection'],
                $data['status'], $data['jurisdiction'], $data['expiresAt'], $data['createdAt']
            ]);
        }
        $synced++;
    } catch (PDOException $e) {
        echo "[Sync] Error {$row['id']}: " . $e->getMessage() . "\n";
        $errors++;
    }
}

// ── Step 5: Withdraw stale listings ──
$currentIds = array_flip(array_column($listings, 'id'));
$withdrawnIds = array_diff(array_keys($existingIds), array_keys($currentIds));

if (count($withdrawnIds) > 0) {
    $placeholders = implode(',', array_fill(0, count($withdrawnIds), '?'));
    $withdrawStmt = $mmtPdo->prepare("UPDATE Listing SET status = 'EXPIRED', updatedAt = NOW() WHERE source = 'DTC' AND dtcListingId IN ($placeholders)");
    $withdrawStmt->execute(array_values($withdrawnIds));
    echo "[Sync] Withdrawn " . count($withdrawnIds) . " stale listings\n";
}

// ── Report ──
echo "[Sync] Done: synced={$synced}, errors={$errors}, duration=" . (time() - $_SERVER['REQUEST_TIME'] ?? time()) . "s\n";

exit($errors > 0 ? 1 : 0);
