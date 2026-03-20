import { useState } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "./ui/table";
import { IncomeItem, ExpenseItem } from "../types";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";

// ======================================================================================
// [props 인터페이스] onUpdate와 onDelete 함수를 추가로 받도록 확장
// ======================================================================================
interface FinancialDataTableProps {
  incomeItems: IncomeItem[];
  expenseItems: ExpenseItem[];
  onUpdate: (id: string, updates: Partial<Omit<IncomeItem, 'id'>> | Partial<Omit<ExpenseItem, 'id'>>, type: 'income' | 'expense') => void;
  onDelete: (id: string, type: 'income' | 'expense') => void;
}

// ======================================================================================
// [핵심] CRUD 기능이 통합된 데이터 테이블 컴포넌트
// ======================================================================================
export const FinancialDataTable = ({ incomeItems, expenseItems, onUpdate, onDelete }: FinancialDataTableProps) => {
  
  // ------------------------------------------------------------------------------------
  // [상태 관리] 인라인 수정을 위한 상태
  // ------------------------------------------------------------------------------------
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editData, setEditData] = useState<Partial<IncomeItem | ExpenseItem>>({});

  // ------------------------------------------------------------------------------------
  // [데이터 병합 및 정렬]
  // ------------------------------------------------------------------------------------
  const combinedData = [
    ...incomeItems.map(item => ({ ...item, type: 'income' as const })),
    ...expenseItems.map(item => ({ ...item, type: 'expense' as const }))
  ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  // ------------------------------------------------------------------------------------
  // [핸들러] 수정, 저장, 취소, 삭제 로직
  // ------------------------------------------------------------------------------------
  const handleEdit = (item: IncomeItem | ExpenseItem) => {
    setEditingId(item.id);
    setEditData(item);
  };

  const handleCancel = () => {
    setEditingId(null);
    setEditData({});
  };

  const handleSave = (id: string, type: 'income' | 'expense') => {
    const { id: itemId, type: itemType, ...updates } = editData;
    onUpdate(id, updates, type);
    setEditingId(null);
    setEditData({});
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setEditData(prev => ({ ...prev, [name]: name === 'amount' ? Number(value) : value }));
  };

  const handleCategoryChange = (value: string) => {
    setEditData(prev => ({ ...prev, category: value }));
  }

  // ------------------------------------------------------------------------------------
  // [렌더링]
  // ------------------------------------------------------------------------------------
  const formatCurrency = (amount: number) => new Intl.NumberFormat('ko-KR').format(amount) + '원';

  const incomeCategories = ['월급', '보너스', '용돈', '기타'];
  const expenseCategories = ['식비', '교통비', '관리비', '용역비', '기타'];

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead className="w-[80px]">유형</TableHead>
          <TableHead className="w-[120px]">날짜</TableHead>
          <TableHead className="w-[120px]">항목</TableHead>
          <TableHead>내용</TableHead>
          <TableHead className="w-[120px] text-right">금액</TableHead>
          <TableHead className="w-[180px] text-center">작업</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {combinedData.length > 0 ? (
          combinedData.map((item) => (
            <TableRow key={item.id}>
              {editingId === item.id ? (
                // ------------------ [수정 모드] ------------------
                <>
                  <TableCell><Badge variant={item.type === 'income' ? 'default' : 'destructive'}>{item.type === 'income' ? '수입' : '지출'}</Badge></TableCell>
                  <TableCell><Input type="date" name="date" value={editData.date} onChange={handleInputChange} /></TableCell>
                  <TableCell>
                    <Select name="category" value={editData.category} onValueChange={handleCategoryChange}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {(item.type === 'income' ? incomeCategories : expenseCategories).map(cat => 
                          <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                        )}
                      </SelectContent>
                    </Select>
                  </TableCell>
                  <TableCell><Input name="description" value={editData.description} onChange={handleInputChange} /></TableCell>
                  <TableCell><Input type="number" name="amount" value={editData.amount} onChange={handleInputChange} className="text-right" /></TableCell>
                  <TableCell className="text-center space-x-2">
                    <Button size="sm" onClick={() => handleSave(item.id, item.type)}>저장</Button>
                    <Button size="sm" variant="outline" onClick={handleCancel}>취소</Button>
                  </TableCell>
                </>
              ) : (
                // ------------------ [일반 모드] ------------------
                <>
                  <TableCell><Badge variant={item.type === 'income' ? 'default' : 'destructive'}>{item.type === 'income' ? '수입' : '지출'}</Badge></TableCell>
                  <TableCell>{item.date}</TableCell>
                  <TableCell>{item.category}</TableCell>
                  <TableCell>{item.description}</TableCell>
                  <TableCell className="text-right">{formatCurrency(item.amount)}</TableCell>
                  <TableCell className="text-center space-x-2">
                    <Button size="sm" variant="outline" onClick={() => handleEdit(item)}>수정</Button>
                    <Button size="sm" variant="destructive" onClick={() => onDelete(item.id, item.type)}>삭제</Button>
                  </TableCell>
                </>
              )}
            </TableRow>
          ))
        ) : (
          <TableRow>
            <TableCell colSpan={6} className="h-24 text-center">아직 등록된 내역이 없습니다.</TableCell>
          </TableRow>
        )}
      </TableBody>
    </Table>
  );
};