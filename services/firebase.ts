

import { initializeApp } from 'firebase/app';
import { 
  getAuth, 
  signInWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged, 
  User 
} from 'firebase/auth';
import { 
  getFirestore, 
  collection, 
  getDocs, 
  setDoc, 
  addDoc, 
  doc, 
  query, 
  where,
  orderBy,
  Timestamp,
  updateDoc,
  deleteDoc,
  writeBatch,
  getDoc
} from 'firebase/firestore';
import { IeltsTest, CompletedTest, StaticDrillModule } from '../types';
import { IELTS_TESTS, TESTS_VERSION } from '../constants';
import { STATIC_DRILLS } from '../data/staticDrills';

const firebaseConfig = {
  apiKey: "AIzaSyAv-3kC8233vDiun0Fd_OpV816Dv9sRfzk",
  authDomain: "lexis-ai-35976.firebaseapp.com",
  projectId: "lexis-ai-35976",
  storageBucket: "lexis-ai-35976.firebasestorage.app",
  messagingSenderId: "551119122386",
  appId: "1:551119122386:web:d5542c13639274560f220b",
  measurementId: "G-W3WG9CT9TC"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);

// --- Auth Services ---

export const loginUser = async (email: string, password: string) => {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    return userCredential.user;
  } catch (error: any) {
    throw new Error(error.message);
  }
};

export const logoutUser = async () => {
  try {
    await signOut(auth);
  } catch (error) {
    console.error("Error signing out", error);
  }
};

// --- Database Services ---

// 1. Tests (Admin managed, Public read)
export const fetchTests = async (): Promise<IeltsTest[]> => {
  const metadataRef = doc(db, 'metadata', 'tests');
  const testsCol = collection(db, 'tests');

  try {
    const metadataSnap = await getDoc(metadataRef);
    const dbVersion = metadataSnap.exists() ? metadataSnap.data().version : 0;

    if (TESTS_VERSION > dbVersion) {
      console.log(`Code version (${TESTS_VERSION}) is newer than DB version (${dbVersion}). Syncing...`);
      const batch = writeBatch(db);
      
      // Overwrite all tests from constants
      for (const test of IELTS_TESTS) {
        const testRef = doc(db, 'tests', test.id.toString());
        batch.set(testRef, test);
      }
      
      // Update the version in metadata
      batch.set(metadataRef, { version: TESTS_VERSION });
      
      await batch.commit();
      console.log('Sync complete. All tests are now up-to-date in Firestore.');

      // Return the data directly from code as it's the freshest
      return IELTS_TESTS.sort((a, b) => a.id - b.id);
    }
    
    // If versions match, just fetch from DB
    console.log(`Versions match (${TESTS_VERSION}). Fetching tests from Firestore.`);
    const testSnapshot = await getDocs(testsCol);
    const testList = testSnapshot.docs.map(doc => doc.data() as IeltsTest);
    return testList.sort((a, b) => a.id - b.id);

  } catch (error) {
      console.error("Error during test fetch/sync, falling back to local constants:", error);
      // Fallback: If there's any error with Firestore (e.g., permissions), return the local array.
      return IELTS_TESTS.sort((a, b) => a.id - b.id);
  }
};

export const saveNewTest = async (test: IeltsTest) => {
  // Use the ID as the document ID for easy retrieval/updates
  await setDoc(doc(db, 'tests', test.id.toString()), test);
};

export const updateExistingTest = async (test: IeltsTest) => {
  await updateDoc(doc(db, 'tests', test.id.toString()), { ...test });
};

// 2. Drills (Admin managed, Public read)
export const fetchDrills = async (): Promise<StaticDrillModule[]> => {
    const drillsCol = collection(db, 'drills');
    const drillSnapshot = await getDocs(drillsCol);
    
    const drillList = drillSnapshot.docs.map(doc => {
        const data = doc.data() as any;
        // Safety check: ensure 'groups' exists. 
        // This handles legacy data that might lack the 'groups' field.
        if (!data.groups || !Array.isArray(data.groups)) {
            data.groups = [];
        }
        return data as StaticDrillModule;
    });

    // AUTO-SEED: If the DB is empty, populate it.
    if (drillList.length === 0) {
        console.log("No drills found in DB. Seeding defaults...");
        await resetDrillsDatabase();
        return STATIC_DRILLS;
    }

    return drillList;
};

export const saveDrill = async (drill: StaticDrillModule) => {
    await setDoc(doc(db, 'drills', drill.id), drill);
};

export const deleteDrill = async (drillId: string) => {
    await deleteDoc(doc(db, 'drills', drillId));
};

/**
 * Completely resets the Drills database to match the code (staticDrills.ts).
 * It DELETES all existing drills first, then uploads the code version.
 */
export const resetDrillsDatabase = async (): Promise<number> => {
    console.log("Resetting drills database...");
    
    try {
      // 1. Delete all existing drills
      const drillsCol = collection(db, 'drills');
      const snapshot = await getDocs(drillsCol);
      
      if (!snapshot.empty) {
        const batch = writeBatch(db);
        snapshot.docs.forEach((doc) => {
            batch.delete(doc.ref);
        });
        await batch.commit();
        console.log(`Deleted ${snapshot.size} existing drills.`);
      }

      // 2. Upload all drills from code
      let count = 0;
      for (const drill of STATIC_DRILLS) {
          // We use setDoc without batching to avoid batch limits if list grows > 500
          await setDoc(doc(db, 'drills', drill.id), drill);
          count++;
      }
      console.log(`Uploaded ${count} drills from code.`);
      return count;
    } catch (error) {
      console.error("Error resetting database:", error);
      throw error;
    }
};

// 3. User History (Private per user)
export const fetchUserHistory = async (userId: string): Promise<CompletedTest[]> => {
  const historyRef = collection(db, 'users', userId, 'completed_tests');
  // Order by completionDate string (ISO) descending
  const q = query(historyRef); 
  
  const snapshot = await getDocs(q);
  const history = snapshot.docs.map(doc => doc.data() as CompletedTest);
  
  return history.sort((a, b) => new Date(b.completionDate).getTime() - new Date(a.completionDate).getTime());
};

export const saveTestResult = async (userId: string, result: CompletedTest) => {
  const historyRef = collection(db, 'users', userId, 'completed_tests');
  // Use the result ID (timestamp based) as the doc ID
  await setDoc(doc(historyRef, result.id), result);
};