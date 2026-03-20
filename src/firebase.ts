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
import { IncomeItem, ExpenseItem } from "./types";

// [보안] 중요: 아래 Firebase 구성 정보는 실제 프로젝트 정보로 채워져야 합니다.
// 이 정보는 Firebase 콘솔의 프로젝트 설정에서 확인할 수 있습니다.
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

// Firestore 데이터베이스 및 Auth 서비스 초기화
export const db = getFirestore(app);
export const auth = getAuth(app);

// 컬렉션 참조
const incomeCollection = collection(db, "income");
const expenseCollection = collection(db, "expenses");

// ======================================================================================
// [수입 관련 함수]
// ======================================================================================

// 수입 내역 추가
export const addIncome = async (item: Omit<IncomeItem, 'id'>) => {
  await addDoc(incomeCollection, {
    ...item,
    timestamp: serverTimestamp(),
  });
};

// 수입 내역 조회
export const getIncomes = async (): Promise<IncomeItem[]> => {
  const q = query(incomeCollection, orderBy("date", "desc"));
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as IncomeItem));
};

// 수입 내역 수정
export const updateIncome = async (id: string, updates: Partial<Omit<IncomeItem, 'id'>>) => {
  const docRef = doc(db, "income", id);
  await updateDoc(docRef, updates);
};

// 수입 내역 삭제
export const deleteIncome = async (id: string) => {
  const docRef = doc(db, "income", id);
  await deleteDoc(docRef);
};

// ======================================================================================
// [지출 관련 함수]
// ======================================================================================

// 지출 내역 추가
export const addExpense = async (item: Omit<ExpenseItem, 'id'>) => {
  await addDoc(expenseCollection, {
    ...item,
    timestamp: serverTimestamp(),
  });
};

// 지출 내역 조회
export const getExpenses = async (): Promise<ExpenseItem[]> => {
  const q = query(expenseCollection, orderBy("date", "desc"));
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as ExpenseItem));
};

// 지출 내역 수정
export const updateExpense = async (id: string, updates: Partial<Omit<ExpenseItem, 'id'>>) => {
  const docRef = doc(db, "expenses", id);
  await updateDoc(docRef, updates);
};

// 지출 내역 삭제
export const deleteExpense = async (id: string) => {
  const docRef = doc(db, "expenses", id);
  await deleteDoc(docRef);
};
