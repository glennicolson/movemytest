-- Create MoveMyTest admin staff account
-- Run this in phpMyAdmin SQL tab for database u385361430_movedata

INSERT INTO `StaffAccount` (
  `id`,
  `email`,
  `passwordHash`,
  `name`,
  `role`,
  `lastLoginAt`,
  `createdAt`,
  `updatedAt`
) VALUES (
  CONCAT('staff_', REPLACE(HEX(RANDOM_BYTES(12)), '00', '')),
  'support@movemytest.co.uk',
  'c63b797d930a76d8a8fb865b5cbd6892.a933b143d5602ec0bcf0391340020b987751024beb46b5490391d2a32c910082a79917d12516436f8aa340111c236455183ba384fc2d0bd163f35dc830b54a88',
  'MoveMyTest Support',
  'ADMIN',
  NULL,
  NOW(3),
  NOW(3)
);
