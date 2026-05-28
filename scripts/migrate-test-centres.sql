-- Migrate test centres from DTC to MoveMyTest
-- Maps DTC fields to MoveMyTest schema

INSERT INTO movemytest.TestCentre (
  id,
  slug,
  name,
  addressLine1,
  town,
  postcode,
  region,
  passRate,
  latitude,
  longitude,
  createdAt,
  updatedAt
)
SELECT
  id,
  slug,
  displayName AS name,
  JSON_UNQUOTE(JSON_EXTRACT(addressLines, '$[0]')) AS addressLine1,
  NULL AS town,
  postcode,
  region,
  NULL AS passRate,
  CAST(latitude AS DOUBLE) AS latitude,
  CAST(longitude AS DOUBLE) AS longitude,
  createdAt,
  updatedAt
FROM dtc_dev.TestCentre
WHERE active = 1;
