#!/usr/bin/env node

import { readFileSync, writeFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const packageJsonPath = join(__dirname, '..', 'package.json');
const serverJsonPath = join(__dirname, '..', 'server.json');

const args = process.argv.slice(2);
const versionType = args[0]; // patch, minor, major, or specific version like "1.2.3"

if (!versionType) {
  console.error('Usage: node scripts/version.js [patch|minor|major|1.2.3]');
  process.exit(1);
}

try {
  // Read and update package.json
  const packageJson = JSON.parse(readFileSync(packageJsonPath, 'utf-8'));
  const currentVersion = packageJson.version;
  
  let newVersion;
  
  if (versionType === 'patch' || versionType === 'minor' || versionType === 'major') {
    const [major, minor, patch] = currentVersion.split('.').map(Number);
    
    switch (versionType) {
      case 'patch':
        newVersion = `${major}.${minor}.${patch + 1}`;
        break;
      case 'minor':
        newVersion = `${major}.${minor + 1}.0`;
        break;
      case 'major':
        newVersion = `${major + 1}.0.0`;
        break;
    }
  } else {
    // Direct version string
    newVersion = versionType;
  }
  
  // Update package.json
  packageJson.version = newVersion;
  writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2) + '\n', 'utf-8');
  console.log(`✅ package.json version updated: ${currentVersion} → ${newVersion}`);
  
  // Update server.json if it exists
  try {
    const serverJson = JSON.parse(readFileSync(serverJsonPath, 'utf-8'));
    const oldServerVersion = serverJson.version;
    
    // Update both version fields in server.json
    serverJson.version = newVersion;
    if (serverJson.packages && serverJson.packages.length > 0 && serverJson.packages[0].version) {
      serverJson.packages[0].version = newVersion;
    }
    
    writeFileSync(serverJsonPath, JSON.stringify(serverJson, null, 2) + '\n', 'utf-8');
    console.log(`✅ server.json version updated: ${oldServerVersion} → ${newVersion}`);
  } catch (serverError) {
    // server.json might not exist, that's okay
    if (serverError && typeof serverError === 'object' && 'code' in serverError && serverError.code !== 'ENOENT') {
      console.warn(`⚠️  Warning: Could not update server.json: ${serverError.message || String(serverError)}`);
    }
  }
  
  console.log(`\n🎉 All version numbers updated to: ${newVersion}`);
} catch (error) {
  console.error('❌ Error updating version:', error instanceof Error ? error.message : String(error));
  process.exit(1);
}

