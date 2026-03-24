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
  deleteDoc,
  getDoc // getDoc 추가
} from "firebase/firestore";
import { IncomeItem, ExpenseItem, TenantUnit, IProjectData } from "./types"; // TenantUnit, IProjectData 타입 추가

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
const expenseCollection = collection(db, "expenses");
const projectDataDocRef = doc(db, "project_data", "singleton"); // 프로젝트 데이터 문서 참조

// ======================================================================================
// [세대(TenantUnit) 관련 함수] - 신규
// ======================================================================================

/**
 * 특정 세대(Tenant Unit)의 정보를 업데이트합니다.
 * @param unitId 업데이트할 세대의 ID
 * @param updatedUnit 업데이트할 세대의 새로운 데이터 객체
 */
export const updateTenantUnit = async (unitId: string, updatedUnit: TenantUnit) => {
  try {
    // 1. 현재 프로젝트 데이터 전체를 가져옵니다.
    const docSnap = await getDoc(projectDataDocRef);
    if (!docSnap.exists()) {
      throw new Error("프로젝트 데이터를 찾을 수 없습니다.");
    }
    const projectData = docSnap.data() as IProjectData;

    // 2. tenantUnits 배열에서 해당 ID를 가진 세대를 찾습니다.
    const unitIndex = projectData.tenantUnits.findIndex(unit => unit.id === unitId);
    if (unitIndex === -1) {
      throw new Error(`ID가 ${unitId}인 세대를 찾을 수 없습니다.`);
    }

    // 3. 찾은 세대의 정보를 업데이트합니다.
    const updatedTenantUnits = [...projectData.tenantUnits];
    updatedTenantUnits[unitIndex] = updatedUnit;

    // 4. 수정된 배열로 문서를 업데이트합니다.
    await updateDoc(projectDataDocRef, { tenantUnits: updatedTenantUnits });

  } catch (error) {
    console.error("세대 정보 업데이트 중 오류 발생:", error);
    throw error; // 오류를 상위로 전파하여 처리할 수 있도록 함
  }
};


// ======================================================================================
// [수입 관련 함수]
// ======================================================================================

export const addIncome = async (item: Omit<IncomeItem, 'id'>) => {
  await addDoc(incomeCollection, { ...item, timestamp: serverTimestamp() });
};

export const getIncomes = async (): Promise<IncomeItem[]> => {
  const q = query(incomeCollection, orderBy("date", "desc"));
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as IncomeItem));
};

export const updateIncome = async (id: string, updates: Partial<Omit<IncomeItem, 'id'>>) => {
  const docRef = doc(db, "income", id);
  await updateDoc(docRef, updates);
};

export const deleteIncome = async (id: string) => {
  const docRef = doc(db, "income", id);
  await deleteDoc(docRef);
};

// ======================================================================================
// [지출 관련 함수]
// ======================================================================================

export const addExpense = async (item: Omit<ExpenseItem, 'id'>) => {
  await addDoc(expenseCollection, { ...item, timestamp: serverTimestamp() });
};

export const getExpenses = async (): Promise<ExpenseItem[]> => {
  const q = query(expenseCollection, orderBy("date", "desc"));
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as ExpenseItem));
};

export const updateExpense = async (id: string, updates: Partial<Omit<ExpenseItem, 'id'>>) => {
  const docRef = doc(db, "expenses", id);
  await updateDoc(docRef, updates);
};

export const deleteExpense = async (id: string) => {
  const docRef = doc(db, "expenses", id);
  await deleteDoc(docRef);
};
