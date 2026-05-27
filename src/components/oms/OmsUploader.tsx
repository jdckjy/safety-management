
import React, { useState, useCallback } from 'react';
import { db } from '../../firebase'; // Firebase 'db' 인스턴스 가져오기
import { collection, query, where, getDocs, addDoc, updateDoc, serverTimestamp } from 'firebase/firestore'; // Firestore 함수 가져오기
import { UploadCloud, FileCheck2, AlertTriangle, Loader2, Save } from 'lucide-react';
import { Button } from '@/components/ui/button';
import * as pdfjsLib from 'pdfjs-dist';
import type { PDFDocumentProxy, RenderParameters, TextItem } from 'pdfjs-dist/types/src/display/api';
import workerSrc from 'pdfjs-dist/build/pdf.worker.min.mjs?url';

pdfjsLib.GlobalWorkerOptions.workerSrc = workerSrc;

// ... (ExtractedData, PdfItem 인터페이스는 이전과 동일) ...

interface ExtractedData {
  electricity: {
    usage: {
      light_load: number | null;
      medium_load: number | null;
      max_load: number | null;
      total_usage: number | null;
    };
    charges: {
      base_charge: number | null;
      usage_charge: number | null;
      climate_environment_charge: number | null;
      fuel_cost_adjustment: number | null;
      power_factor_charge: number | null;
      subtotal: number | null;
      vat: number | null;
      power_industry_fund: number | null;
      round_off: number | null;
    };
    total_billed_amount: number | null;
  };
  water: {
    general: {
      usage_m3: number | null;
      base_charge: number | null;
      water_supply_charge: number | null;
      sewerage_charge: number | null;
      sewage_reduction: number | null;
      total_charge: number | null;
    };
    fire_hydrant: {
      usage_m3: number | null;
      base_charge: number | null;
      water_supply_charge: number | null;
      sewerage_charge: number | null;
      total_charge: number | null;
    };
  };
  gas: {
    meter_reading_m3: number | null;
    usage_m3: number | null;
    unit_price: number | null;
    usage_charge: number | null;
  };
  grand_total: number | null;
}

interface PdfItem extends TextItem {
  str: string;
  transform: number[];
  text: string;
  x: number;
  y: number;
  textUnspaced: string;
}

const findBillingMonth = async (pdf: PDFDocumentProxy): Promise<string> => {
  const page = await pdf.getPage(1);
  const textContent = await page.getTextContent();
  const pageText = textContent.items.map((item: any) => item.str).join(' ');
  const regex = /과업수행\s*보고서.*\[\s*(\d{4})\s*년\s*(\d{1,2})\s*월\s*\]/;
  const match = pageText.match(regex);

  if (match && match[1] && match[2]) {
    const year = match[1];
    const month = match[2];
    return `${year}-${month.padStart(2, '0')}`;
  }

  const pageTextUnspaced = textContent.items.map((item: any) => item.str.replace(/\s/g, '')).join('');
  const regexUnspaced = /과업수행보고서.*\[(\d{4})년(\d{1,2})월\]/;
  const matchUnspaced = pageTextUnspaced.match(regexUnspaced);

  if (matchUnspaced && matchUnspaced[1] && matchUnspaced[2]) {
    const year = matchUnspaced[1];
    const month = matchUnspaced[2];
    return `${year}-${month.padStart(2, '0')}`;
  }

  throw new Error("1페이지의 '과업수행 보고서 [...] '에서 'YYYY년 MM월' 형식의 날짜를 찾을 수 없습니다.");
};


const OmsUploader: React.FC = () => {
  const [file, setFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [imageUrls, setImageUrls] = useState<string[]>([]);
  const [extractedData, setExtractedData] = useState<ExtractedData | null>(null);
  const [pdfDoc, setPdfDoc] = useState<PDFDocumentProxy | null>(null);


  const resetState = useCallback(() => {
    setFile(null);
    setError(null);
    setExtractedData(null);
    setImageUrls([]);
    setPdfDoc(null);
    setIsProcessing(false);
    setIsSaving(false);
  }, []);

  const renderPdfPages = useCallback(async (selectedFile: File) => {
    resetState();
    setIsProcessing(true);

    try {
      const arrayBuffer = await selectedFile.arrayBuffer();
      const pdf = await pdfjsLib.getDocument(arrayBuffer).promise;
      setPdfDoc(pdf);

      const dataPage = await pdf.getPage(6);
      const textContent = await dataPage.getTextContent();
      
      const items: PdfItem[] = textContent.items.map((item: any) => ({
        ...item,
        text: item.str.replace(/\s+/g, ' ').trim(),
        x: item.transform[4],
        y: item.transform[5],
        textUnspaced: item.str.replace(/\s/g, ''),
      }));

      const CURRENT_MONTH_X_START = 340;
      const CURRENT_MONTH_X_END = 450;

      const parseNumericValue = (text: string | null | undefined): number | null => {
        if (!text || text.trim() === '-' || text.trim() === '') return null;
        const num = parseFloat(text.replace(/,/g, ''));
        return isNaN(num) ? null : num;
      };
      
      const findValue = (
        block: PdfItem[],
        labelKeyword: RegExp,
        options: { yTolerance?: number, xConstraint?: boolean, closestToLabel?: boolean, useUnspaced?: boolean } = {}
      ) => {
        const { yTolerance = 5, xConstraint = true, closestToLabel = false, useUnspaced = false } = options;

        const labelItem = block.find(item => labelKeyword.test(useUnspaced ? item.textUnspaced : item.text));
        if (!labelItem) return null;

        let potentialValues = block.filter(it => 
            Math.abs(it.y - labelItem.y) < yTolerance &&
            /^[\d,.-]+$/.test(it.text) &&
            it.text !== labelItem.text
        );
        
        if (xConstraint) {
            potentialValues = potentialValues.filter(it => it.x >= CURRENT_MONTH_X_START && it.x < CURRENT_MONTH_X_END);
        }

        if (closestToLabel) {
            potentialValues = potentialValues.filter(it => it.x > labelItem.x);
        }

        if (potentialValues.length === 0) return null;

        potentialValues.sort((a,b) => a.x - b.x);
        
        return potentialValues[0]?.text || null;
      };

      const elecTotalRow = items.find(it => /^청구금액$/.test(it.textUnspaced));
      const waterGeneralTotalRow = items.find(it => /일반용.*합계/.test(it.textUnspaced));
      const waterHydrantTotalRow = items.find(it => /소화전.*합계/.test(it.textUnspaced));
      const grandTotalRow = items.find(it => /^총합계$/.test(it.textUnspaced));

      const y1 = elecTotalRow?.y ?? 0;
      const y2 = waterGeneralTotalRow?.y ?? 0;
      const y3 = waterHydrantTotalRow?.y ?? 0;
      const y4 = grandTotalRow?.y ?? 0;

      const electricityBlock = items.filter(it => it.y > y1);
      const waterGeneralBlock = items.filter(it => it.y < y1 && it.y > y2);
      const waterFireHydrantBlock = items.filter(it => it.y < y2 && it.y > y3);
      const gasBlock = items.filter(it => it.y < y3 && it.y > y4);

      const data: ExtractedData = {
        electricity: {
          usage: {
            light_load: parseNumericValue(findValue(electricityBlock, /^경부하$/)),
            medium_load: parseNumericValue(findValue(electricityBlock, /^중간부하$/)),
            max_load: parseNumericValue(findValue(electricityBlock, /^최대부하$/)),
            total_usage: parseNumericValue(findValue(electricityBlock, /^총사용량$/)),
          },
          charges: {
            base_charge: parseNumericValue(findValue(electricityBlock, /^기본요금$/)),
            usage_charge: parseNumericValue(findValue(electricityBlock, /^전력량요금$/)),
            climate_environment_charge: parseNumericValue(findValue(electricityBlock, /^기후환경요금$/)),
            fuel_cost_adjustment: parseNumericValue(findValue(electricityBlock, /^연료비조정액$/)),
            power_factor_charge: parseNumericValue(findValue(electricityBlock, /^역률요금$/)),
            subtotal: parseNumericValue(findValue(items, /^전기요금계$/, { xConstraint: false, closestToLabel: true, yTolerance: 10, useUnspaced: true })),
            vat: parseNumericValue(findValue(electricityBlock, /^부가가치세$/)),
            power_industry_fund: parseNumericValue(findValue(electricityBlock, /^전력기금$/)),
            round_off: parseNumericValue(findValue(electricityBlock, /^원단위절사$/)),
          },
          total_billed_amount: parseNumericValue(findValue(items, /^청구금액$/, { xConstraint: false, closestToLabel: true, yTolerance: 5, useUnspaced: true })),
        },
        water: {
          general: {
            usage_m3: parseNumericValue(findValue(waterGeneralBlock, /^사용량\(m/, { useUnspaced: true })),
            base_charge: parseNumericValue(findValue(waterGeneralBlock, /^기본요금$/)),
            water_supply_charge: parseNumericValue(findValue(waterGeneralBlock, /^상수도요금$/)),
            sewerage_charge: parseNumericValue(findValue(waterGeneralBlock, /^하수도요금$/)),
            sewage_reduction: parseNumericValue(findValue(waterGeneralBlock, /^중수도감면$/)),
            total_charge: parseNumericValue(findValue(items, /일반용.*합계/, { xConstraint: false, closestToLabel: true, yTolerance: 10, useUnspaced: true })),
          },
          fire_hydrant: {
            usage_m3: parseNumericValue(findValue(waterFireHydrantBlock, /^사용량\(m/, { useUnspaced: true })),
            base_charge: parseNumericValue(findValue(waterFireHydrantBlock, /^기본요금$/, { useUnspaced: true })),
            water_supply_charge: parseNumericValue(findValue(waterFireHydrantBlock, /^상수도요금$/, { useUnspaced: true })),
            sewerage_charge: parseNumericValue(findValue(waterFireHydrantBlock, /^하수도요금$/, { useUnspaced: true })),
            total_charge: parseNumericValue(findValue(items, /소화전.*합계/, { xConstraint: false, closestToLabel: true, yTolerance: 10, useUnspaced: true })),
          }
        },
        gas: {
          meter_reading_m3: parseNumericValue(findValue(gasBlock, /^검침\(m/, { useUnspaced: true })),
          usage_m3: parseNumericValue(findValue(gasBlock, /^사용량\(m/, { useUnspaced: true })),
          unit_price: parseNumericValue(findValue(gasBlock, /당단가/, { useUnspaced: true })),
          usage_charge: parseNumericValue(findValue(gasBlock, /^사용량요금$/, { useUnspaced: true })),
        },
        grand_total: parseNumericValue(findValue(items, /^총합계$/, { xConstraint: false, closestToLabel: true, yTolerance: 15, useUnspaced: true })),
      };

      setExtractedData(data);
      
      const urls: string[] = [];
      const canvas = document.createElement('canvas');
      const context = canvas.getContext('2d');
      if (context) {
        for (let i = 1; i <= Math.min(pdf.numPages, 10); i++) {
          const page = await pdf.getPage(i);
          const viewport = page.getViewport({ scale: 1.5 });
          canvas.height = viewport.height;
          canvas.width = viewport.width;
          
          const renderContext: RenderParameters = {
            canvasContext: context,
            viewport: viewport,
            canvas: canvas,
          };

          await page.render(renderContext).promise;
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
  }, [resetState]);

  const handleFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      renderPdfPages(selectedFile);
    }
  }, [renderPdfPages]);
  
  const handleSaveData = useCallback(async () => {
    if (!extractedData || !pdfDoc) return;

    setIsSaving(true);
    setError(null);
    try {
      const billingMonth = await findBillingMonth(pdfDoc);
      
      const utilityBillsRef = collection(db, "utility-bills");
      const q = query(utilityBillsRef, where("billingMonth", "==", billingMonth));
      
      const querySnapshot = await getDocs(q);

      if (querySnapshot.empty) {
        // Add new document
        const payload = {
          billingMonth,
          ...extractedData,
          createdAt: serverTimestamp(),
        };
        await addDoc(utilityBillsRef, payload);
        alert('데이터가 성공적으로 저장되었습니다.');
      } else {
        // Update existing document
        const docToUpdate = querySnapshot.docs[0];
        const payload = {
          billingMonth,
          ...extractedData,
          updatedAt: serverTimestamp(),
        };
        await updateDoc(docToUpdate.ref, payload);
        alert(`기존 ${billingMonth}월의 데이터를 성공적으로 업데이트했습니다.`);
      }

      resetState();

    } catch (e: any) {
      console.error(e);
      setError(e.message || '데이터 저장/업데이트 중 오류가 발생했습니다.');
    } finally {
      setIsSaving(false);
    }
  }, [extractedData, pdfDoc, resetState]);

  return (
    <div className="p-4 bg-white rounded-lg shadow-md space-y-6">
      <div className="max-w-5xl mx-auto text-center py-12">
        {isProcessing ? (
          <div className="flex flex-col items-center justify-center">
            <Loader2 className="h-16 w-16 text-indigo-600 animate-spin" />
            <h2 className="mt-4 text-2xl font-bold text-gray-800">데이터를 추출하고 있습니다...</h2>
            <p className="mt-2 text-md text-gray-600">블록 단위로 PDF 구조를 분석하고 있습니다.</p>
          </div>
        ) : extractedData ? (
          <>
            <h2 className="text-2xl font-bold text-gray-800">최종 추출 결과</h2>
            <p className="mt-2 text-sm text-gray-500">추출된 데이터를 확인 후 저장하세요.</p>
            <div className="my-4 p-4 bg-gray-800 text-white rounded-lg text-left font-mono text-sm">
              <pre className="whitespace-pre-wrap">{JSON.stringify(extractedData, null, 2)}</pre>
            </div>

            <div className="mt-8">
              <Button onClick={handleSaveData} size="lg" disabled={isSaving}>
                {isSaving ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    저장 중...
                  </>
                ) : (
                  <>
                    <Save className="mr-2 h-5 w-5" />
                    데이터 저장하기
                  </>
                )}
              </Button>
            </div>
             <div className="mt-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 border p-4 rounded-lg bg-gray-50">
              {imageUrls.map((url, index) => (
                <div key={index} className="border rounded-lg overflow-hidden shadow-sm">
                   <p className="text-sm font-semibold p-2 bg-gray-100">Page {index + 1}</p>
                   <img src={url} alt={`Page ${index + 1}`} className="w-full" />
                </div>
              ))}
            </div>
          </>
        ) : (
          <>
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <UploadCloud className="mx-auto h-16 w-16 text-gray-300" />
                <h2 className="mt-4 text-2xl font-bold text-gray-800">월간 보고서 자동화</h2>
                <p className="mt-2 text-sm text-gray-500">PDF 파일을 선택하여 데이터를 자동으로 추출하세요.</p>
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
              </div>
            </div>
          </>
        )}

        {error && (
          <div className="mt-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg">
            <div className="flex">
              <div className="py-1"><AlertTriangle className="h-5 w-5 mr-3" /></div>
              <div>
                <p className="font-bold">오류 발생</p>
                <p className="text-sm">{error}</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default OmsUploader;
