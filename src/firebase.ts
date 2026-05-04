import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { 
  getFirestore, 
  collection, 
  addDoc, 
  getDocs, 
  query, 
  orderBy, 
  serverTimestamp,
  doc,
  updateDoc,
  deleteDoc
} from "firebase/firestore";
import { Income, Expense } from "./types";

// Firebase 구성 정보
const firebaseConfig = {
  apiKey: "AIzaSyAUTOe5pSNVuoMzar7kvxKnPXCSK57yf8o",
  authDomain: "safety-management-233137-77a49.firebaseapp.com",
  projectId: "safety-management-233137-77a49",
  storageBucket: "safety-management-233137-77a49.firebasestorage.app",
  messagingSenderId: "103752595169",
  appId: "1:103752595169:web:093d773ade73b21d3c29a0"
};

// Firebase 앱 초기화
const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);

// 컬렉션 참조
const incomeCollection = collection(db, "income");
const expenseCollection = collection(db, "expense"); // "expenses" -> "expense"

// ======================================================================================
// [수입 관련 함수]
// ======================================================================================

export const addIncome = async (item: Omit<Income, 'id'>) => {
  await addDoc(incomeCollection, { ...item, timestamp: serverTimestamp() });
};

export const getIncomes = async (): Promise<Income[]> => {
  const q = query(incomeCollection, orderBy("date", "desc"));
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Income));
};

export const updateIncome = async (id: string, updates: Partial<Omit<Income, 'id'>>) => {
  const docRef = doc(db, "income", id);
  await updateDoc(docRef, updates);
};

export const deleteIncome = async (id: string) => {
  const docRef = doc(db, "income", id);
  await deleteDoc(docRef);
};

// ======================================================================================
// [지출 관련 함수]
// =====================================================================================

export const addExpense = async (item: Omit<Expense, 'id'>) => {
  await addDoc(expenseCollection, { ...item, timestamp: serverTimestamp() });
};

export const getExpenses = async (): Promise<Expense[]> => {
  const q = query(expenseCollection, orderBy("date", "desc"));
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Expense));
};

export const updateExpense = async (id: string, updates: Partial<Omit<Expense, 'id'>>) => {
  const docRef = doc(db, "expense", id); // "expenses" -> "expense"
  await updateDoc(docRef, updates);
};

export const deleteExpense = async (id: string) => {
  const docRef = doc(db, "expense", id); // "expenses" -> "expense"
  await deleteDoc(docRef);
};
