
// scripts/migration-v2.ts

import { getFirestore, collection, getDocs, writeBatch, DocumentData } from 'firebase/firestore';
import { IProjectData, TenantInfo, Contract } from '../src/types'; // Assuming types can be imported

// NOTE: This script is intended to be run in a Firebase-aware environment (e.g., using ts-node).
// You must have Firebase configured in your project for this script to work.

// =====================================================================================
// !! IMPORTANT !!
// **BACKUP YOUR DATA** before running this script. This operation is irreversible.
// =====================================================================================

// Initialize Firestore. Replace with your actual Firebase initialization.
// const db = getFirestore();

/**
 * An array of hardcoded mock tenant IDs that were part of the initial seed data.
 * These are the tenants that we want to remove from user documents.
 */
const MOCK_TENANT_IDS: string[] = [
  'tenant-kmi',
  'tenant-jdc',
  'tenant-dental',
  'tenant-peace-village',
  'tenant-kohubi'
];

/**
 * Migrates all user documents in the 'users' collection to remove mock data.
 * 
 * @async
 * @function migrateUsers
 * @param {any} db - The Firestore database instance.
 */
async function migrateUsers(db: any) {
  if (!db) {
    console.error('Firestore instance is not available. Please initialize Firebase first.');
    return;
  }

  const usersRef = collection(db, 'users');
  const userDocsSnap = await getDocs(usersRef);
  const batch = writeBatch(db);
  let modifiedUserCount = 0;

  console.log(`Found ${userDocsSnap.docs.length} user document(s). Starting migration...`);

  for (const userDoc of userDocsSnap.docs) {
    const userData = userDoc.data() as IProjectData;
    let isModified = false;

    // 1. Clean up tenantInfo array
    const originalTenantCount = userData.tenantInfo?.length || 0;
    const cleanedTenants = (userData.tenantInfo || []).filter(
      (tenant: TenantInfo) => !MOCK_TENANT_IDS.includes(tenant.id)
    );

    if (cleanedTenants.length < originalTenantCount) {
      console.log(`  [User: ${userDoc.id}] Found and removed ${originalTenantCount - cleanedTenants.length} mock tenant(s).`);
      userData.tenantInfo = cleanedTenants;
      isModified = true;
    }

    // 2. Clean up contracts array (by checking the tenantId)
    const originalContractCount = userData.contracts?.length || 0;
    const cleanedContracts = (userData.contracts || []).filter(
      (contract: Contract) => !MOCK_TENANT_IDS.includes(contract.tenantId)
    );

    if (cleanedContracts.length < originalContractCount) {
      console.log(`  [User: ${userDoc.id}] Found and removed ${originalContractCount - cleanedContracts.length} contract(s) linked to mock tenants.`);
      userData.contracts = cleanedContracts;
      isModified = true;
    }

    // If any modifications were made, add the update operation to the batch
    if (isModified) {
      batch.set(userDoc.ref, userData);
      modifiedUserCount++;
    }
  }

  if (modifiedUserCount > 0) {
    console.log(`\nCommitting batch update for ${modifiedUserCount} user(s)...`);
    await batch.commit();
    console.log('Migration successful. All affected users have been updated.');
  } else {
    console.log('\nNo mock data found in any user documents. Your database is already clean.');
  }
}

// Example of how to run the migration.
// You would typically call this from a main execution function.
/*
const db = getFirestore(); // Get your DB instance
migrateUsers(db).catch(error => {
  console.error('An error occurred during migration:', error);
});
*/

console.log('Migration script loaded. Define your Firestore instance and call migrateUsers(db) to start.');
