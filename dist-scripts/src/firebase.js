"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteExpense = exports.updateExpense = exports.getExpenses = exports.addExpense = exports.deleteIncome = exports.updateIncome = exports.getIncomes = exports.addIncome = exports.auth = exports.db = void 0;
const app_1 = require("firebase/app");
const auth_1 = require("firebase/auth");
const firestore_1 = require("firebase/firestore");
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
const app = (0, app_1.initializeApp)(firebaseConfig);
exports.db = (0, firestore_1.getFirestore)(app);
exports.auth = (0, auth_1.getAuth)(app);
// 컬렉션 참조
const incomeCollection = (0, firestore_1.collection)(exports.db, "income");
const expenseCollection = (0, firestore_1.collection)(exports.db, "expense"); // "expenses" -> "expense"
// ======================================================================================
// [수입 관련 함수]
// ======================================================================================
const addIncome = async (item) => {
    await (0, firestore_1.addDoc)(incomeCollection, { ...item, timestamp: (0, firestore_1.serverTimestamp)() });
};
exports.addIncome = addIncome;
const getIncomes = async () => {
    const q = (0, firestore_1.query)(incomeCollection, (0, firestore_1.orderBy)("date", "desc"));
    const querySnapshot = await (0, firestore_1.getDocs)(q);
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
};
exports.getIncomes = getIncomes;
const updateIncome = async (id, updates) => {
    const docRef = (0, firestore_1.doc)(exports.db, "income", id);
    await (0, firestore_1.updateDoc)(docRef, updates);
};
exports.updateIncome = updateIncome;
const deleteIncome = async (id) => {
    const docRef = (0, firestore_1.doc)(exports.db, "income", id);
    await (0, firestore_1.deleteDoc)(docRef);
};
exports.deleteIncome = deleteIncome;
// ======================================================================================
// [지출 관련 함수]
// =====================================================================================
const addExpense = async (item) => {
    await (0, firestore_1.addDoc)(expenseCollection, { ...item, timestamp: (0, firestore_1.serverTimestamp)() });
};
exports.addExpense = addExpense;
const getExpenses = async () => {
    const q = (0, firestore_1.query)(expenseCollection, (0, firestore_1.orderBy)("date", "desc"));
    const querySnapshot = await (0, firestore_1.getDocs)(q);
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
};
exports.getExpenses = getExpenses;
const updateExpense = async (id, updates) => {
    const docRef = (0, firestore_1.doc)(exports.db, "expense", id); // "expenses" -> "expense"
    await (0, firestore_1.updateDoc)(docRef, updates);
};
exports.updateExpense = updateExpense;
const deleteExpense = async (id) => {
    const docRef = (0, firestore_1.doc)(exports.db, "expense", id); // "expenses" -> "expense"
    await (0, firestore_1.deleteDoc)(docRef);
};
exports.deleteExpense = deleteExpense;
