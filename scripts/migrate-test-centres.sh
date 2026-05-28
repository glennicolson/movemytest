#!/bin/bash
# Migrate test centres from DTC to MoveMyTest using MySQL dump/load

set -e

DTC_HOST="localhost"
DTC_PORT="3307"
DTC_USER="dtc_dev"
DTC_PASS="dtc_dev_pw"
DTC_DB="dtc_dev"

MMT_HOST="localhost"
MMT_PORT="3309"
MMT_USER="root"
MMT_PASS="mmt_root_2026"
MMT_DB="movemytest"

echo "Exporting test centres from DTC..."
mysql --protocol=tcp -h $DTC_HOST -P $DTC_PORT -u $DTC_USER -p$DTC_PASS -e "
SELECT 
  id,
  slug,
  displayName AS name,
  COALESCE(JSON_UNQUOTE(JSON_EXTRACT(addressLines, '\$[0]')), '') AS addressLine1,
  '' AS town,
  postcode,
  region,
  NULL AS passRate,
  CAST(latitude AS DOUBLE) AS latitude,
  CAST(longitude AS DOUBLE) AS longitude,
  createdAt,
  updatedAt
FROM TestCentre 
WHERE active = 1;
" $DTC_DB > /tmp/dtc_test_centres.tsv

echo "Found $(wc -l < /tmp/dtc_test_centres.tsv) test centres"

echo "Importing to MoveMyTest..."
docker exec -i movemytest-mysql mysql -u $MMT_USER -p$MMT_PASS $MMT_DB << 'EOF'
-- Clear existing data
TRUNCATE TABLE TestCentre;

-- Import data
LOAD DATA LOCAL INFILE '/tmp/dtc_test_centres.tsv'
INTO TABLE TestCentre
FIELDS TERMINATED BY '\t'
LINES TERMINATED BY '\n'
IGNORE 1 LINES
(id, slug, name, addressLine1, town, postcode, region, @passRate, @latitude, @longitude, createdAt, updatedAt)
SET 
  passRate = NULLIF(@passRate, ''),
  latitude = NULLIF(@latitude, ''),
  longitude = NULLIF(@longitude, '');
EOF

echo "Migration complete!"
