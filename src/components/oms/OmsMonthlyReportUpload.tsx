
import React, { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import * as pdfjsLib from 'pdfjs-dist';
import { db } from '@/firebase';
import { collection, addDoc, query, where, getDocs, updateDoc, DocumentData } from 'firebase/firestore';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Table, TableBody, TableCell, TableRow } from "@/components/ui/table";
import { UploadCloud, File, CheckCircle2, XCircle, Loader2 } from 'lucide-react';

// PDF.js 워커 설정
pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.mjs`;

interface ExtractedData {
  billingMonth: string | null;
  environmental: { [key: string]: number | null };
  electricity: { [key: string]: any };
  water: { [key: string]: any };
  gas: { [key: string]: any };
  grand_total: number | null;
}

const parseNumber = (value: string | undefined): number | null => {
  if (!value) return null;
  const num = parseInt(value.replace(/[^0-9-]/g, ''), 10);
  return isNaN(num) ? null : num;
};

const OmsMonthlyReportUpload: React.FC = () => {
  const [file, setFile] = useState<File | null>(null);
  const [status, setStatus] = useState<'idle' | 'parsing' | 'saving' | 'success' | 'error'>('idle');
  const [error, setError] = useState<string | null>(null);
  const [extractedData, setExtractedData] = useState<ExtractedData | null>(null);

  const resetState = () => {
    setFile(null);
    setStatus('idle');
    setError(null);
    setExtractedData(null);
  };

  const parsePdf = useCallback(async (fileToParse: File) => {
    setStatus('parsing');
    setError(null);
    setExtractedData(null);
    try {
      const reader = new FileReader();
      reader.onload = async (event) => {
        if (!event.target?.result) return;
        const typedArray = new Uint8Array(event.target.result as ArrayBuffer);
        const pdf = await pdfjsLib.getDocument({ data: typedArray }).promise;
        let allText = '';
        for (let i = 1; i <= pdf.numPages; i++) {
          const page = await pdf.getPage(i);
          const textContent = await page.getTextContent();
          allText += textContent.items.map(item => (item as any).str).join(' ') + ' \n';
        }

        console.log("--- PDF 원본 텍스트 ---");
        console.log(allText);
        console.log("---------------------");

        const billingMonthMatch = allText.match(/청구년월:\s*(\d{4}년\s*\d{2}월)/);
        const billingMonth = billingMonthMatch ? `${billingMonthMatch[1].substring(0, 4)}-${billingMonthMatch[1].substring(6, 8)}` : null;

        // --- 환경 데이터 파싱 결과 추적 ---
        const solarMatch = allText.match(/태양광 발전량\s*([0-9,.]+\s*kWh)/);
        const waterReuseMatch = allText.match(/중수 사용량\s*([0-9,.]+\s*m³)/);
        const tempMatch = allText.match(/월평균 기온\s*([0-9,.]+\s*°C)/);

        console.log("--- 파싱 결과 ---");
        console.log("태양광 발전량 매치:", solarMatch);
        console.log("중수 사용량 매치:", waterReuseMatch);
        console.log("월평균 기온 매치:", tempMatch);
        console.log("------------------");

        const data: ExtractedData = {
          billingMonth,
          environmental: {
            solar_power_generation_kwh: parseNumber(solarMatch?.[1]),
            gray_water_usage_m3: parseNumber(waterReuseMatch?.[1]),
            avg_monthly_temperature_celsius: parseNumber(tempMatch?.[1]),
          },
          electricity: { total_billed_amount: parseNumber(allText.match(/전기요금\s*([0-9,]+) 원/)?.[1]) },
          water: { general: { total_charge: parseNumber(allText.match(/수도요금\s*([0-9,]+) 원/)?.[1]) } },
          gas: { usage_charge: parseNumber(allText.match(/가스요금\s*([0-9,]+) 원/)?.[1]) },
          grand_total: parseNumber(allText.match(/합계\s*([0-9,]+)원/)?.[1]),
        };
        
        console.log("--- 추출된 데이터 객체 ---");
        console.log(JSON.stringify(data, null, 2));
        console.log("-------------------------");

        setExtractedData(data);
        setStatus('success');
      };
      reader.readAsArrayBuffer(fileToParse);
    } catch (e) {
      console.error(e);
      setError('PDF 파싱 중 오류가 발생했습니다.');
      setStatus('error');
    }
  }, []);

  const handleSave = async () => {
    if (!extractedData || !extractedData.billingMonth) {
      setError("저장할 데이터가 없거나 청구년월이 누락되었습니다.");
      return;
    }
    setStatus('saving');
    setError(null);
    try {
      const { billingMonth } = extractedData;
      const utilityBillsRef = collection(db, "utility-bills");
      const q = query(utilityBillsRef, where("billingMonth", "==", billingMonth));
      const querySnapshot = await getDocs(q);
      
      const dataToSave: DocumentData = { ...extractedData };

      if (!querySnapshot.empty) {
        const docRef = querySnapshot.docs[0].ref;
        await updateDoc(docRef, dataToSave);
      } else {
        await addDoc(utilityBillsRef, dataToSave);
      }
      setStatus('success');
      setTimeout(resetState, 2000);
    } catch (e) {
      console.error("Error saving document: ", e);
      setError("데이터베이스 저장 중 오류가 발생했습니다.");
      setStatus('error');
    } 
  };

  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      resetState();
      setFile(acceptedFiles[0]);
      parsePdf(acceptedFiles[0]);
    }
  }, [parsePdf]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop, accept: { 'application/pdf': ['.pdf'] }, multiple: false });

  const isProcessing = status === 'parsing' || status === 'saving';

  return (
    <div className="w-full max-w-4xl mx-auto p-4 space-y-6">
      <h1 className="text-2xl font-bold">새 월간 보고서 업로드</h1>
      {!file ? (
        <div {...getRootProps()} className={`p-10 border-2 border-dashed rounded-lg text-center cursor-pointer transition-colors ${isDragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-gray-400'}`}>
          <input {...getInputProps()} />
          <UploadCloud className="mx-auto h-12 w-12 text-gray-400" />
          <p className="mt-4 text-sm text-gray-600">PDF 파일을 여기로 드래그하거나 클릭하여 업로드하세요.</p>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="flex items-center p-4 border rounded-lg">
            <File className="h-8 w-8 text-gray-500 mr-4" />
            <div className="flex-grow"><p className="font-semibold">{file.name}</p></div>
            {isProcessing && <Loader2 className="h-6 w-6 animate-spin" />}
            {status === 'success' && !isProcessing && <CheckCircle2 className="h-6 w-6 text-green-500" />}
            {status === 'error' && <XCircle className="h-6 w-6 text-red-500" />}
          </div>

          {error && (
            <Alert variant="destructive">
              <XCircle className="h-4 w-4" />
              <AlertTitle>오류 발생</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          
          {extractedData && status === 'success' && (
            <div>
              <h2 className="text-xl font-bold mb-2">추출된 데이터 확인</h2>
              <div className="p-4 border rounded-md bg-gray-50">
                <Table>
                  <TableBody>
                    <TableRow><TableCell>청구년월</TableCell><TableCell>{extractedData.billingMonth}</TableCell></TableRow>
                    <TableRow><TableCell>총 합계</TableCell><TableCell>{extractedData.grand_total?.toLocaleString()}원</TableCell></TableRow>
                  </TableBody>
                </Table>
              </div>
            </div>
          )}
          
          <div className="flex justify-end space-x-4">
            <Button variant="outline" onClick={resetState} disabled={isProcessing}>취소</Button>
            <Button onClick={handleSave} disabled={status !== 'success' || isProcessing}>
              {status === 'saving' ? '저장 중...' : '데이터 저장'}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default OmsMonthlyReportUpload;
