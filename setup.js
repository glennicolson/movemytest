#!/usr/bin/env node
/**
 * MoveMyTest Setup Script
 * Copies Test Swap code from DTC workspace, renames it to MoveMyTest,
 * and creates a clean standalone project.
 */

const fs = require('fs');
const path = require('path');

const SRC_ROOT = '/Users/glennicolson/.openclaw/workspace';
const DST_ROOT = '/Users/glennicolson/.openclaw/workspace/movemytest';

// Directories to copy (relative to src/)
const COPY_DIRS = [
  // Routes
  'app/(marketing)/test-swap',
  'app/(auth)/test-swap',
  'app/(staff)/dashboard/test-swap',
  'app/api/test-swap',

  // Components
  'components/test-swap',
  'components/learner',
  'components/marketing',

  // Features
  'features/test-swap',

  // Shared infrastructure
  'lib',
  'hooks',
  'types',
  'constants',
  'utils',
  'formatters',
  'components/ui',
  'components/layout',
];

// Files to copy from src root
const COPY_FILES = [
  'middleware.ts',
  'globals.css',
  'favicon.ico',
];

function ensureDir(dir) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

function copyFile(src, dst) {
  ensureDir(path.dirname(dst));
  fs.copyFileSync(src, dst);
}

function copyDir(src, dst) {
  ensureDir(dst);
  const entries = fs.readdirSync(src, { withFileTypes: true });
  for (const entry of entries) {
    const srcPath = path.join(src, entry.name);
    const dstPath = path.join(dst, entry.name);
    if (entry.isDirectory()) {
      copyDir(srcPath, dstPath);
    } else {
      copyFile(srcPath, dstPath);
    }
  }
}

function renameInFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');

  // Rename all test-swap references
  content = content.replace(/test-swap/g, 'movemytest');
  content = content.replace(/testSwap/g, 'movemytest');
  content = content.replace(/TestSwap/g, 'MoveMyTest');
  content = content.replace(/Test Swap/g, 'MoveMyTest');
  content = content.replace(/the DTC Test Swap/g, 'MoveMyTest');
  content = content.replace(/DTC Test Swap/g, 'MoveMyTest');
  content = content.replace(/testswap/g, 'movemytest');

  // But fix any double-renamed paths (e.g., movemytest/movemytest)
  content = content.replace(/movemytest\/movemytest/g, 'movemytest');
  content = content.replace(/movemytest-movemytest/g, 'movemytest');

  fs.writeFileSync(filePath, content, 'utf8');
}

function renameFileOrDir(oldPath) {
  const basename = path.basename(oldPath);
  const newBasename = basename
    .replace(/test-swap/g, 'movemytest')
    .replace(/test_swap/g, 'movemytest')
    .replace(/testswap/g, 'movemytest');

  if (newBasename !== basename) {
    const newPath = path.join(path.dirname(oldPath), newBasename);
    fs.renameSync(oldPath, newPath);
    return newPath;
  }
  return oldPath;
}

function walkAndRename(dir) {
  // Rename files first (depth-first)
  const entries = fs.readdirSync(dir, { withFileTypes: true });

  // Process files
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      walkAndRename(fullPath);
      renameFileOrDir(fullPath);
    } else {
      const newPath = renameFileOrDir(fullPath);
      if (newPath.match(/\.(ts|tsx|js|jsx|json|css|md)$/)) {
        renameInFile(newPath);
      }
    }
  }
}

// ─── Main ───
console.log('=== MoveMyTest Setup ===\n');

// 1. Create src directory
const srcDst = path.join(DST_ROOT, 'src');
ensureDir(srcDst);

// 2. Copy all source directories
for (const dir of COPY_DIRS) {
  const srcPath = path.join(SRC_ROOT, 'src', dir);
  const dstPath = path.join(srcDst, dir);
  if (fs.existsSync(srcPath)) {
    copyDir(srcPath, dstPath);
    console.log(`✓ Copied ${dir}`);
  } else {
    console.log(`⚠ Skipped ${dir} (not found)`);
  }
}

// 3. Copy root files
for (const file of COPY_FILES) {
  const srcPath = path.join(SRC_ROOT, 'src', file);
  const dstPath = path.join(srcDst, file);
  if (fs.existsSync(srcPath)) {
    copyFile(srcPath, dstPath);
    console.log(`✓ Copied ${file}`);
  }
}

// 4. Rename all test-swap references
console.log('\n=== Renaming Test Swap → MoveMyTest ===\n');
walkAndRename(srcDst);

// 5. Flatten any remaining test-swap directories
function flattenRemaining(dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (entry.name.includes('test-swap') || entry.name.includes('test_swap')) {
        // Move contents up
        const parent = path.dirname(fullPath);
        const subEntries = fs.readdirSync(fullPath);
        for (const sub of subEntries) {
          const subPath = path.join(fullPath, sub);
          const destPath = path.join(parent, sub);
          fs.renameSync(subPath, destPath);
        }
        fs.rmdirSync(fullPath);
        // Recheck parent
        flattenRemaining(parent);
      } else {
        flattenRemaining(fullPath);
      }
    }
  }
}

flattenRemaining(srcDst);

console.log('\n=== Setup Complete ===');
console.log('Next: run `cd movemytest && npm install && npm run dev`');
