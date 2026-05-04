
import React, { useState, useCallback } from 'react';
import * as XLSX from 'xlsx';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Upload, Plus } from 'lucide-react';

interface ExcelDataImporterProps {
  onImport: (data: any[]) => void;
}

const ExcelDataImporter: React.FC<ExcelDataImporterProps> = ({ onImport }) => {
  const [jsonData, setJsonData] = useState<any[]>([]);
  const [fileName, setFileName] = useState<string>('');

  const handleFileChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setFileName(file.name);
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: 'array', cellDates: true });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const json = XLSX.utils.sheet_to_json(worksheet);
        setJsonData(json);
      } catch (error) {
        console.error("Error processing Excel file:", error);
        alert("엑셀 파일을 처리하는 중 오류가 발생했습니다.");
      }
    };
    reader.readAsArrayBuffer(file);
  }, []);

  const handleImportClick = useCallback(() => {
    if (jsonData.length === 0) {
      alert("먼저 파일을 선택하고 데이터를 변환해주세요.");
      return;
    }
    onImport(jsonData);
    setJsonData([]);
    setFileName('');
  }, [jsonData, onImport]);

  const tableHeaders = jsonData.length > 0 ? Object.keys(jsonData[0]) : [];

  return (
    <Card>
      <CardHeader>
        <CardTitle>엑셀로 대량 등록</CardTitle>
        <CardDescription>수익/지출 내역 엑셀 파일을 업로드하여 한 번에 등록합니다.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center space-x-2">
          <Input type="file" onChange={handleFileChange} accept=".xlsx, .xls" className="flex-grow" />
        </div>
        {fileName && <p className="text-sm text-muted-foreground">선택된 파일: {fileName}</p>}
        
        {jsonData.length > 0 && (
          <div className="space-y-4">
            <div className="text-lg font-semibold">미리보기</div>
            <div className="overflow-auto max-h-60 border rounded-md">
              <Table>
                <TableHeader>
                  <TableRow>
                    {tableHeaders.map(header => <TableHead key={header}>{header}</TableHead>)}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {jsonData.map((row, rowIndex) => (
                    <TableRow key={rowIndex}>
                      {tableHeaders.map(header => <TableCell key={header}>{String(row[header])}</TableCell>)}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
            <Button onClick={handleImportClick} className="w-full">
              <Plus className="mr-2 h-4 w-4" />
              {jsonData.length}개 항목 등록하기
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ExcelDataImporter;
