
import { useState, useEffect, useMemo } from 'react';
import { collection, getDocs, query } from 'firebase/firestore';
import { db } from '@/firebase';

export interface Transaction {
  id?: string;
  date: string;
  category: string;
  description: string;
  client: string;
  amount: number;
  type: 'income' | 'expense';
}

export const useProfitAnalysis = () => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTransactions = async () => {
      setLoading(true);
      setError(null); 
      try {
        console.log('Attempting to fetch transactions from Firestore...');
        const q = query(collection(db, 'transactions'));
        const querySnapshot = await getDocs(q);
        const dataFromDb = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Transaction));
        
        console.log('Successfully fetched transactions:', dataFromDb);
        if (dataFromDb.length === 0) {
          console.warn('Firestore query returned 0 documents from the "transactions" collection. This might be due to security rules.');
        }

        setTransactions(dataFromDb);
      } catch (err: any) { 
        console.error('Error fetching transactions from Firestore:', err);
        setError(`데이터 로딩 실패: ${err.message}`);
      } finally {
        setLoading(false);
        console.log('Finished fetching transactions.');
      }
    };

    fetchTransactions();
  }, []);

  const summary = useMemo(() => {
    if (!transactions || transactions.length === 0) {
      return { totalIncome: 0, totalExpense: 0 };
    }
    return transactions.reduce((acc, curr) => {
      const amount = Number(curr.amount);
      if (isNaN(amount)) {
        console.warn(`Invalid amount found for transaction id ${curr.id}:`, curr.amount);
        return acc;
      }
      
      if (curr.type === 'income') {
        acc.totalIncome += amount;
      } else if (curr.type === 'expense') {
        acc.totalExpense += amount;
      }
      return acc;
    }, { totalIncome: 0, totalExpense: 0 });
  }, [transactions]);

  return { transactions, summary, loading, error };
};
