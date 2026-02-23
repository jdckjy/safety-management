
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { getStorage } from "firebase/storage";
import { firebaseConfig } from "./firebaseConfig"; // default import -> named import로 수정

// Firebase 앱을 초기화합니다.
const app = initializeApp(firebaseConfig);

// Firestore, Auth, Storage 인스턴스를 가져옵니다.
const db = getFirestore(app);
const auth = getAuth(app);
const storage = getStorage(app);

// 다른 파일에서 사용할 수 있도록 인스턴스를 내보냅니다.
export { db, auth, storage };
