import { db } from './firebase';
import {
  collection,
  doc,
  getDoc,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  QueryDocumentSnapshot,
} from 'firebase/firestore';
import { Bounty } from '../domain/types';

// Collection name
const BOUNTIES_COLLECTION = 'bounties';

/**
 * Converts a Firestore document to a Bounty object.
 * @param docRef Firestore document snapshot
 * @returns Bounty object
 */
const bountyFromDoc = (docRef: QueryDocumentSnapshot): Bounty => {
  const data = docRef.data();
  return {
    id: docRef.id,
    title: data.title,
    organizationId: data.organizationId,
    organizationName: data.organizationName,
    organizationTrustScore: data.organizationTrustScore,
    severity: data.severity,
    rewardAmount: data.rewardAmount,
    rewardCurrency: data.rewardCurrency,
    scope: data.scope,
    rules: data.rules,
    deadline: data.deadline,
    verificationRequirements: data.verificationRequirements,
    status: data.status,
    escrowId: data.escrowId,
    escrowStatus: data.escrowStatus ?? '',
    fundingTxHash: data.fundingTxHash ?? '',
    escrowAmountEth: data.escrowAmountEth ?? 0,
    escrowDemoRate: data.escrowDemoRate ?? 0,
    description: data.description,
  };
};

/**
 * Converts a Bounty object to a Firestore-compatible object.
 * We remove the id because it will be the document ID.
 * We also handle any Firestore-specific types (like Timestamp) if needed.
 * For now, we assume all fields are basic types.
 * @param bounty Bounty object
 * @returns Object suitable for Firestore (without id field)
 */
const bountyToFirestore = (bounty: Omit<Bounty, 'id'>) => {
  return {
    title: bounty.title,
    organizationId: bounty.organizationId,
    organizationName: bounty.organizationName,
    organizationTrustScore: bounty.organizationTrustScore,
    severity: bounty.severity,
    rewardAmount: bounty.rewardAmount,
    rewardCurrency: bounty.rewardCurrency,
    scope: bounty.scope,
    rules: bounty.rules,
    deadline: bounty.deadline,
    verificationRequirements: bounty.verificationRequirements,
    status: bounty.status,
    escrowId: bounty.escrowId,
    escrowStatus: bounty.escrowStatus,
    fundingTxHash: bounty.fundingTxHash,
    escrowAmountEth: bounty.escrowAmountEth,
    escrowDemoRate: bounty.escrowDemoRate,
    description: bounty.description,
  };
};

/**
 * Get all bounties from Firestore.
 * @returns Array of Bounty objects
 */
export const getBounties = async (): Promise<Bounty[]> => {
  if (!db) {
    throw new Error('Firestore is not initialized. Check Firebase configuration.');
  }

  const bountyCol = collection(db, BOUNTIES_COLLECTION);
  const bountySnapshot = await getDocs(bountyCol);
  console.log('[getBounties] Fetched bounty docs:', bountySnapshot.docs.map(doc => doc.id));
  return bountySnapshot.docs.map(bountyFromDoc);
};

/**
 * Get a bounty by its ID.
 * @param bountyId The ID of the bounty to retrieve
 * @returns Bounty object if found, otherwise null
 */
export const getBountyById = async (bountyId: string): Promise<Bounty | null> => {
  if (!db) {
    throw new Error('Firestore is not initialized. Check Firebase configuration.');
  }

  const bountyDoc = doc(db, BOUNTIES_COLLECTION, bountyId);
  const bountySnap = await getDoc(bountyDoc);

  if (bountySnap.exists()) {
    return bountyFromDoc(bountySnap);
  }

  return null;
};

/**
 * Create a new bounty in Firestore.
 * @param bounty The bounty object to create (without id)
 * @returns The ID of the created bounty
 */
export const createBounty = async (bounty: Omit<Bounty, 'id'>): Promise<string> => {
  if (!db) {
    throw new Error('Firestore is not initialized. Check Firebase configuration.');
  }

  const bountyCol = collection(db, BOUNTIES_COLLECTION);
  const docRef = await addDoc(bountyCol, bountyToFirestore(bounty));
  return docRef.id;
};

/**
 * Update an existing bounty.
 * @param bountyId The ID of the bounty to update
 * @param data The partial bounty data to update
 */
export const updateBounty = async (
  bountyId: string,
  data: Partial<Omit<Bounty, 'id'>>
): Promise<void> => {
  if (!db) {
    throw new Error('Firestore is not initialized. Check Firebase configuration.');
  }

  const bountyDoc = doc(db, BOUNTIES_COLLECTION, bountyId);
  await updateDoc(bountyDoc, data);
};

/**
 * Delete a bounty by its ID.
 * @param bountyId The ID of the bounty to delete
 */
export const deleteBounty = async (bountyId: string): Promise<void> => {
  if (!db) {
    throw new Error('Firestore is not initialized. Check Firebase configuration.');
  }

  const bountyDoc = doc(db, BOUNTIES_COLLECTION, bountyId);
  await deleteDoc(bountyDoc);
};