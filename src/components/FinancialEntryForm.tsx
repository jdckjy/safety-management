
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { IncomeItem, ExpenseItem, IncomeCategory, ExpenseCategory } from '@/types';

interface FinancialEntryFormProps {
  onSubmit: (item: Omit<IncomeItem, 'id'> | Omit<ExpenseItem, 'id'>, type: 'income' | 'expense') => void;
}

// [수정] 지출 카테고리 배열에 '용역비'를 추가합니다.
const incomeCategories: IncomeCategory[] = ['관리비', '주차비', '기타'];
const expenseCategories: ExpenseCategory[] = ['공과금', '수리비', '인건비', '마케팅', '용역비', '기타'];

export const FinancialEntryForm: React.FC<FinancialEntryFormProps> = ({ onSubmit }) => {
  const [entryType, setEntryType] = useState<'income' | 'expense'>('income');
  const [category, setCategory] = useState<IncomeCategory | ExpenseCategory>('관리비');
  const [amount, setAmount] = useState<number>(0);
  const [description, setDescription] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);

  const handleTypeChange = (type: 'income' | 'expense') => {
    setEntryType(type);
    setCategory(type === 'income' ? '관리비' : '공과금');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!category || !amount || !description || !date) {
      // 간단한 유효성 검사
      alert('모든 필드를 입력해주세요.');
      return;
    }
    onSubmit({ date, category, description, amount } as any, entryType);
    // 폼 초기화
    setAmount(0);
    setDescription('');
  };

  const categories = entryType === 'income' ? incomeCategories : expenseCategories;

  return (
    <Card>
      <CardHeader>
        <CardTitle>수입/지출 내역 추가</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="flex space-x-2">
            <Button type="button" onClick={() => handleTypeChange('income')} variant={entryType === 'income' ? 'secondary' : 'outline'} className="w-full">수입</Button>
            <Button type="button" onClick={() => handleTypeChange('expense')} variant={entryType === 'expense' ? 'secondary' : 'outline'} className="w-full">지출</Button>
          </div>

          <Input type="date" value={date} onChange={e => setDate(e.target.value)} />

          <Select onValueChange={(value) => setCategory(value as any)} value={category}>
            <SelectTrigger>
              <SelectValue placeholder="카테고리 선택" />
            </SelectTrigger>
            <SelectContent>
              {categories.map(cat => (
                <SelectItem key={cat} value={cat}>{cat}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Input
            type="text"
            placeholder="내용"
            value={description}
            onChange={e => setDescription(e.target.value)}
          />

          <Input
            type="number"
            placeholder="금액"
            value={amount}
            onChange={e => setAmount(Number(e.target.value))}
          />

          <Button type="submit" className="w-full">추가하기</Button>
        </form>
      </CardContent>
    </Card>
  );
};
