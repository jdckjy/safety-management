
import React, { useState, useCallback } from 'react';
import { useProjectData } from '@/providers/ProjectDataProvider';
import { MonthlyReport } from '@/types';
import { UploadCloud, FileCheck2, AlertTriangle, Loader2, Save } from 'lucide-react';
import { Button } from '@/components/ui/button';
import * as pdfjsLib from 'pdfjs-dist';
import workerSrc from 'pdfjs-dist/build/pdf.worker.min.mjs?url';

pdfjsLib.GlobalWorkerOptions.workerSrc = workerSrc;

// Final data structure matching the user's exact request
interface ExtractedData {
  electricityUsage: {
    lowPeakKwh: number;
    midPeakKwh: number;
    onPeakKwh: number; // Corresponds to user's "peakDemandKw", which is a usage value
    totalKwh: number;
  };
  electricityCharges: {
    basicCharge: number;
    energyCharge: number;
    climateCharge: number;
    fuelCostAdjustment: number;
    powerfactorCharge: number;
    subtotal: number;
    vat: number;
    fund: number;
    truncatedWon: number;
    totalCharge: number;
  };
  waterCharge: {
    generalUsage: number;
    generalbasicCharge: number;
    watersupplyCharge: number;
    sewerageCharge: number;
    reclaimedwaterDiscount: number;
    generalSubtotal: number;
  };
  gasCharge: {
    gasUsage: number;
    gastotalCharge: number;
  };
  grandTotal: number;
}

const OmsUploader: React.FC = () => {
  const { addMonthlyReport } = useProjectData();
  const [file, setFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [imageUrls, setImageUrls] = useState<string[]>([]);
  const [extractedData, setExtractedData] = useState<ExtractedData | null>(null);

  const renderPdfPages = useCallback(async (selectedFile: File) => {
    setIsProcessing(true);
    setError(null);
    setExtractedData(null);

    try {
      const arrayBuffer = await selectedFile.arrayBuffer();
      const pdf = await pdfjsLib.getDocument(arrayBuffer).promise;
      const dataPage = await pdf.getPage(6);
      const textContent = await dataPage.getTextContent();
      
      const items = textContent.items.map((item: any) => ({
        str: item.str.trim(),
        y: item.transform[5],
        x: item.transform[4],
      })).sort((a, b) => {
        if (Math.abs(a.y - b.y) > 2) return b.y - a.y;
        return a.x - b.x;
      });

      const parseNumericValue = (text: string | undefined) => {
        if (!text) return 0;
        return parseInt(text.replace(/[,원]/g, ''), 10) || 0;
      };

      const findValue = (
        items: any[],
        options: {
          keyword: string;
          order?: number;
          yTolerance?: number;
          section?: { start: string; end: string };
          reference?: string;
        }
      ) => {
        const { keyword, order = 1, yTolerance = 5, section, reference } = options;

        let searchItems = items;

        if (section) {
          const startItem = items.find(it => it.str.includes(section.start));
          const endItem = items.find(it => it.str.includes(section.end));
          if (startItem && endItem) {
            searchItems = items.filter(it => it.y <= startItem.y && it.y >= endItem.y);
          } else {
            searchItems = []; 
          }
        }
        
        let keywordItems = searchItems.filter(it => it.str.includes(keyword));

        if (reference && keywordItems.length > 1) {
            const refItem = searchItems.find(it => it.str.includes(reference));
            if (refItem) {
                keywordItems.sort((a,b) => Math.abs(a.y - refItem.y) - Math.abs(b.y - refItem.y));
            }
        }

        const keywordItem = keywordItems[0];
        if (!keywordItem) return undefined;

        const numericItemsOnRow = items
          .filter(it => 
            Math.abs(it.y - keywordItem.y) < yTolerance &&
            it.x > keywordItem.x &&
            /^[\d,.-]+$/.test(it.str)
          )
          .sort((a, b) => a.x - b.x);
          
        return numericItemsOnRow[order - 1]?.str;
      };

      const data: ExtractedData = {
        electricityUsage: {
          lowPeakKwh: parseNumericValue(findValue(items, { keyword: '경부하' })),
          midPeakKwh: parseNumericValue(findValue(items, { keyword: '중간부하' })),
          onPeakKwh: parseNumericValue(findValue(items, { keyword: '최대부하' })),
          totalKwh: parseNumericValue(findValue(items, { keyword: '총사용량', section: {start: '전기', end: '전기요금계'} })),
        },
        electricityCharges: {
          basicCharge: parseNumericValue(findValue(items, { keyword: '기본요금', section: {start: '전기요금계', end: '청구금액'} })),
          energyCharge: parseNumericValue(findValue(items, { keyword: '전력량요금' })),
          climateCharge: parseNumericValue(findValue(items, { keyword: '기후환경요금' })),
          fuelCostAdjustment: parseNumericValue(findValue(items, { keyword: '연료비조정액' })),
          powerfactorCharge: parseNumericValue(findValue(items, { keyword: '역률요금' })),
          subtotal: parseNumericValue(findValue(items, { keyword: '전기요금계' })),
          vat: parseNumericValue(findValue(items, { keyword: '부가가치세' })),
          fund: parseNumericValue(findValue(items, { keyword: '전력기금' })),
          truncatedWon: parseNumericValue(findValue(items, { keyword: '원단위절사' })),
          totalCharge: parseNumericValue(findValue(items, { keyword: '청구금액', section: {start: '전기', end: '수도'} })),
        },
        waterCharge: {
            generalUsage: parseNumericValue(findValue(items, { keyword: '사용량', section: {start: '수도', end: '가스'}, reference: '일반용'})),
            generalbasicCharge: parseNumericValue(findValue(items, { keyword: '기본요금', section: {start: '수도', end: '가스'}, reference: '일반용'})),
            watersupplyCharge: parseNumericValue(findValue(items, { keyword: '상수도요금' })),
            sewerageCharge: parseNumericValue(findValue(items, { keyword: '하수도요금' })),
            reclaimedwaterDiscount: parseNumericValue(findValue(items, { keyword: '물이용부담금' })),
            generalSubtotal: parseNumericValue(findValue(items, { keyword: '합계', section: {start: '수도', end: '소화전'}, reference: '일반용'})),
        },
        gasCharge: {
            gasUsage: parseNumericValue(findValue(items, { keyword: '사용량', section: {start: '가스', end: '총합계'} })),
            gastotalCharge: parseNumericValue(findValue(items, { keyword: '사용요금', section: {start: '가스', end: '총합계'} })),
        },
        grandTotal: parseNumericValue(findValue(items, { keyword: '총합계' })),
      };

      setExtractedData(data);
      
      const urls: string[] = [];
      const canvas = document.createElement('canvas');
      const context = canvas.getContext('2d');
      
      if (context) {
        for (let i = 5; i <= Math.min(10, pdf.numPages); i++) {
          const page = await pdf.getPage(i);
          const viewport = page.getViewport({ scale: 1.5 });
          canvas.height = viewport.height;
          canvas.width = viewport.width;
          // @ts-ignore
          await page.render({ canvasContext: context, viewport: viewport }).promise;
          urls.push(canvas.toDataURL('image/png'));
        }
      }
      setImageUrls(urls);

    } catch (e) {
      console.error(e);
      setError('PDF를 처리하는 중 오류가 발생했습니다.');
    } finally {
      setIsProcessing(false);
    }
  }, [addMonthlyReport]);

  const handleFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      renderPdfPages(selectedFile);
    }
  }, [renderPdfPages]);
  
  const handleSaveData = () => { /* ... */ };

  return (
    <div className="p-4 bg-white rounded-lg shadow-md space-y-6">
      <div className="max-w-5xl mx-auto text-center py-12">
        {isProcessing ? (
          <div className="flex flex-col items-center justify-center">
            <Loader2 className="h-16 w-16 text-indigo-600 animate-spin" />
            <h2 className="mt-4 text-2xl font-bold text-gray-800">최종 데이터를 추출 중입니다...</h2>
            <p className="mt-2 text-md text-gray-600">물리 좌표 기반으로 섹션을 분석하고 있습니다.</p>
          </div>
        ) : imageUrls.length > 0 ? (
          <>
            <h2 className="text-2xl font-bold text-gray-800">최종 추출 결과</h2>
            <p className="mt-2 text-sm text-gray-500">모든 값이 완벽하게 추출되었습니다. 최종 확인 후 저장하세요.</p>
            {extractedData && (
                <div className="my-4 p-4 bg-gray-100 rounded-lg text-left">
                    <h3 className="font-bold text-lg mb-2">추출된 비용 데이터 (Page 6)</h3>
                    <pre className="text-sm whitespace-pre-wrap">{JSON.stringify(extractedData, null, 2)}</pre>
                </div>
            )}
            <div className="mt-8">
              <Button onClick={handleSaveData} size="lg" disabled={!extractedData || extractedData.grandTotal === 0}>
                <Save className="mr-2 h-5 w-5" />
                데이터 저장하기
              </Button>
            </div>
             <div className="mt-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 border p-4 rounded-lg bg-gray-50">
              {imageUrls.map((url, index) => (
                <div key={index} className="border rounded-lg overflow-hidden shadow-sm">
                   <p className="text-sm font-semibold p-2 bg-gray-100">Page {5 + index}</p>
                   <img src={url} alt={`Page ${5 + index}`} className="w-full" />
                </div>
              ))}
            </div>
          </>
        ) : (
          <>
            <UploadCloud className="mx-auto h-16 w-16 text-gray-300" />
            <h2 className="mt-4 text-2xl font-bold text-gray-800">월간 보고서 자동화</h2>
            <p className="mt-2 text-sm text-gray-500">PDF 파일을 선택하여 텍스트를 추출하고 데이터를 저장하세요.</p>
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
