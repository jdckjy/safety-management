
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

// Firebase 구성 정보
// 실제 애플리케이션에서는 환경 변수를 사용하여 Firebase 구성과 같은 민감한 데이터를 저장해야 합니다.
const firebaseConfig = {
  apiKey: "AIzaSyAUTOe5pSNVuoMzar7kvxKnPXCSK57yf8o",
  authDomain: "safety-management-233137-77a49.firebaseapp.com",
  projectId: "safety-management-233137-77a49",
  storageBucket: "safety-management-233137-77a49.appspot.com",
  messagingSenderId: "103752595169",
  appId: "1:103752595169:web:093d773ade73b21d3c29a0"
};

// Firebase 앱 초기화
const app = initializeApp(firebaseConfig);

// Firebase 서비스 내보내기
export const db = getFirestore(app);
export const auth = getAuth(app);
export const storage = getStorage(app);
export { app };
