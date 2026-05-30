<?php
// DTC -> MMT Sync — Production Version
// Run: php /home/u385361430/scripts/sync.php
// Cron: */5 * * * * php /home/u385361430/scripts/sync.php >> /home/u385361430/logs/sync.log 2>&1

// ── Load .env ──
$envFile = '/home/u385361430/domains/movemytest.co.uk/public_html/.builds/config/.env';
if (file_exists($envFile)) {
    $lines = file($envFile, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES);
    foreach ($lines as $line) {
        if (strpos($line, '=') !== false && strpos($line, '#') !== 0) {
            list($key, $value) = explode('=', $line, 2);
            putenv(trim($key) . '=' . trim($value, " \t\n\r\0\x0B\"'"));
        }
    }
}

$dtcUrl = getenv('DTC_DATABASE_URL');
$mmtUrl = getenv('DATABASE_URL');
if (!$dtcUrl || !$mmtUrl) { echo "Missing DB URLs\n"; exit(1); }

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

try {
    $dtcPdo = new PDO("mysql:host={$dtc['host']};port={$dtc['port']};dbname={$dtc['db']}", $dtc['user'], $dtc['pass'], [PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION]);
    $mmtPdo = new PDO("mysql:host={$mmt['host']};port={$mmt['port']};dbname={$mmt['db']}", $mmt['user'], $mmt['pass'], [PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION]);
} catch (PDOException $e) {
    echo "[Sync] ERROR: " . $e->getMessage() . "\n";
    exit(1);
}

$listings = $dtcPdo->query("SELECT id, currentCentreId, originalCentreId, currentDateTime, testType, hasRemainingChange, desiredDateFrom, desiredDateTo, desiredTimePreference, desiredCentreIds, desiredDirection, status, jurisdiction, expiresAt, createdAt FROM TestSwapListing WHERE status='ACTIVE' AND expiresAt > NOW() LIMIT 500")->fetchAll(PDO::FETCH_ASSOC);

if (count($listings) === 0) { exit(0); }

$existing = $mmtPdo->query("SELECT dtcListingId FROM Listing WHERE source='DTC'")->fetchAll(PDO::FETCH_COLUMN);
$existingIds = array_flip($existing);

$synced = 0;
foreach ($listings as $row) {
    $data = [$row['id'], $row['currentCentreId'], $row['originalCentreId'] ?: null, $row['currentDateTime'], $row['testType'], $row['hasRemainingChange'] ? 1 : 0, $row['desiredDateFrom'], $row['desiredDateTo'], $row['desiredTimePreference'] ?: 'ANY', $row['desiredCentreIds'], $row['desiredDirection'], $row['status'], $row['jurisdiction'], $row['expiresAt'], $row['createdAt']];
    if (isset($existingIds[$row['id']])) {
        $mmtPdo->prepare("UPDATE Listing SET currentCentreId=?, originalCentreId=?, currentDateTime=?, testType=?, hasRemainingChange=?, desiredDateFrom=?, desiredDateTo=?, desiredTimePreference=?, desiredCentreIds=?, desiredDirection=?, status=?, jurisdiction=?, expiresAt=?, updatedAt=NOW() WHERE dtcListingId=? AND source='DTC'")->execute([$data[1], $data[2], $data[3], $data[4], $data[5], $data[6], $data[7], $data[8], $data[9], $data[10], $data[11], $data[12], $data[13], $data[0]]);
    } else {
        $mmtPdo->prepare("INSERT INTO Listing (id, source, dtcListingId, accountId, currentCentreId, originalCentreId, currentDateTime, testType, hasRemainingChange, desiredDateFrom, desiredDateTo, desiredTimePreference, desiredCentreIds, desiredDirection, status, jurisdiction, expiresAt, createdAt, updatedAt) VALUES (UUID(), 'DTC', ?, NULL, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())")->execute($data);
    }
    $synced++;
}

$currentIds = array_flip(array_column($listings, 'id'));
$withdrawnIds = array_diff(array_keys($existingIds), array_keys($currentIds));
if (count($withdrawnIds) > 0) {
    $placeholders = implode(',', array_fill(0, count($withdrawnIds), '?'));
    $mmtPdo->prepare("UPDATE Listing SET status='EXPIRED', updatedAt=NOW() WHERE source='DTC' AND dtcListingId IN ($placeholders)")->execute(array_values($withdrawnIds));
}

echo "[Sync] " . date('Y-m-d H:i:s') . " | synced={$synced}, withdrawn=" . count($withdrawnIds) . "\n";
