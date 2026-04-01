
import React, { useState, useCallback } from 'react';
import { useProjectData } from '@/providers/ProjectDataProvider';
import { MonthlyReport } from '@/types';
import { UploadCloud, FileCheck2, AlertTriangle, Loader2, Save } from 'lucide-react';
import { Button } from '@/components/ui/button';

// pdfjs-dist 설정
import * as pdfjsLib from 'pdfjs-dist/build/pdf';
pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;

/**
 * 월간 보고서 PDF를 업로드하고, 특정 페이지를 미리보고,
 * 완전한 데이터 구조로 저장하는 최종 수정된 컴포넌트입니다.
 */
const OmsUploader: React.FC = () => {
  const { addMonthlyReport } = useProjectData();

  const [file, setFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [imageUrls, setImageUrls] = useState<string[]>([]);

  const renderPdfPages = useCallback(async (selectedFile: File) => {
    if (!selectedFile.type.includes('pdf')) {
      setError('PDF 파일만 업로드할 수 있습니다.');
      return;
    }

    setIsProcessing(true);
    setError(null);
    setImageUrls([]);

    try {
      const reader = new FileReader();
      reader.readAsArrayBuffer(selectedFile);
      reader.onload = async (event) => {
        if (!event.target?.result) return;
        
        const pdf = await pdfjsLib.getDocument(event.target.result as ArrayBuffer).promise;
        const urls: string[] = [];
        const startPage = 5;
        const endPage = Math.min(10, pdf.numPages);

        if (pdf.numPages < startPage) {
            setError(`오류: PDF 파일이 ${startPage}페이지 미만입니다. (${pdf.numPages} 페이지)`);
            setIsProcessing(false);
            return;
        }

        for (let i = startPage; i <= endPage; i++) {
          const page = await pdf.getPage(i);
          const viewport = page.getViewport({ scale: 1.5 });
          const canvas = document.createElement('canvas');
          const context = canvas.getContext('2d');
          
          if (!context) continue;

          canvas.height = viewport.height;
          canvas.width = viewport.width;
          
          await page.render({ canvasContext: context, viewport: viewport }).promise;
          urls.push(canvas.toDataURL('image/png'));
        }
        
        setImageUrls(urls);
        setIsProcessing(false);
      };
    } catch (e) {
      console.error(e);
      setError('PDF를 처리하는 중 오류가 발생했습니다.');
      setIsProcessing(false);
    }
  }, []);

  const handleFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      renderPdfPages(selectedFile);
    } else {
      setFile(null);
      setImageUrls([]);
      setError('파일이 선택되지 않았습니다.');
    }
  }, [renderPdfPages]);

  /**
   * '저장' 버튼 클릭 시, 'energyCosts'를 포함한 완전한 임시 데이터를 생성하고 저장합니다.
   */
  const handleSaveData = useCallback(() => {
    if (!file) return;

    const match = file.name.match(/(\d{4}).*(\d{1,2})/);
    const year = match ? parseInt(match[1], 10) : new Date().getFullYear();
    const month = match ? parseInt(match[2], 10) : new Date().getMonth() + 1;

    // [수정] types.ts에 정의된 완벽한 데이터 구조에 맞춰 energyCosts를 포함한 임시 데이터 생성
    const newReport: MonthlyReport = {
        id: `rep_${new Date().getTime()}`,
        year,
        month,
        report_date: new Date().toISOString().split('T')[0],
        raw_data: {
            energyUsage: {
                electricityKwh: { value: Math.floor(Math.random() * 20000) + 50000, unit: 'kWh' },
                waterM3: { value: Math.floor(Math.random() * 500) + 1000, unit: 'm³' },
                gasM3: { value: Math.floor(Math.random() * 300) + 500, unit: 'm³' },
            },
            energyCosts: {
                electricity: {
                    basicCharge: { value: 5000000 },
                    usageCharge: { value: 12000000 },
                    demandCharge: { value: 3000000 },
                    vat: { value: 2000000 },
                    fund: { value: 200000 },
                    finalAmount: { value: 22200000 },
                },
                water: {
                    usageCharge: { value: 3000000 },
                    generalTotal: { value: 3000000 },
                },
                gas: {
                    usageCharge: { value: 1500000 },
                },
                total: { value: 26700000, unit: '원' },
            },
            teamActivities: [
                { id: 'team_dev', teamName: '인프라 개발팀', tasks: ['서버 증설 및 최적화', '데이터 파이프라인 구축'] },
                { id: 'team_safety', teamName: '안전 관리팀', tasks: ['정기 안전 점검', '소방 설비 유지보수'] },
                { id: 'team_facility', teamName: '시설 관리팀', tasks: ['냉난방 시스템 점검', '조경 관리'] }
            ]
        }
    };

    addMonthlyReport(newReport);
    alert(`${year}년 ${month}월 보고서가 성공적으로 저장되었습니다!`);
    
    setFile(null);
    setImageUrls([]);
    setError(null);

  }, [file, addMonthlyReport]);

  return (
    <div className="p-4 bg-white rounded-lg shadow-md space-y-6">
      <div className="max-w-5xl mx-auto text-center py-12">
        {isProcessing ? (
          <div className="flex flex-col items-center justify-center">
            <Loader2 className="h-16 w-16 text-indigo-600 animate-spin" />
            <h2 className="mt-4 text-2xl font-bold text-gray-800">PDF 페이지를 분석 중입니다...</h2>
            <p className="mt-2 text-md text-gray-600">잠시만 기다려주세요.</p>
          </div>
        ) : imageUrls.length > 0 ? (
          <>
            <h2 className="text-2xl font-bold text-gray-800">보고서 미리보기 (5-10 페이지)</h2>
            <p className="mt-2 text-sm text-gray-500">아래 이미지를 확인하고, 문제가 없으면 저장 버튼을 누르세요.</p>
            <div className="mt-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 border p-4 rounded-lg bg-gray-50">
              {imageUrls.map((url, index) => (
                <div key={index} className="border rounded-lg overflow-hidden shadow-sm">
                   <p className="text-sm font-semibold p-2 bg-gray-100">Page {5 + index}</p>
                   <img src={url} alt={`Page ${5 + index}`} className="w-full" />
                </div>
              ))}
            </div>
            <div className="mt-8">
              <Button onClick={handleSaveData} size="lg">
                <Save className="mr-2 h-5 w-5" />
                데이터 저장하기
              </Button>
            </div>
          </>
        ) : (
          <>
            <UploadCloud className="mx-auto h-16 w-16 text-gray-300" />
            <h2 className="mt-4 text-2xl font-bold text-gray-800">월간 보고서 자동화</h2>
            <p className="mt-2 text-sm text-gray-500">PDF 파일을 선택하여 5-10 페이지를 미리보고 데이터를 저장하세요.</p>
            <div className="mt-8">
              <label htmlFor="file-upload" className="cursor-pointer inline-flex items-center px-6 py-3 border border-gray-300 text-base font-medium rounded-full shadow-sm bg-white text-gray-700 hover:bg-gray-50 transition-colors">
                <FileCheck2 className="-ml-1 mr-2 h-5 w-5" />
                보고서 PDF 파일 선택
              </label>
              <input
                id="file-upload"
                type="file"
                className="sr-only"
                accept=".pdf"
                onChange={handleFileChange}
              />
            </div>
          </>
        )}

        {error && (
          <p className="mt-4 text-sm font-semibold text-red-600 flex items-center justify-center">
            <AlertTriangle className="h-5 w-5 mr-2" />
            {error}
          </p>
        )}
      </div>
    </div>
  );
};

export default OmsUploader;
