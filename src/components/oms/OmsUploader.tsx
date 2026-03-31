
import React, { useState } from 'react';
import { UploadCloud, FileCheck2, AlertTriangle, CheckCircle } from 'lucide-react';

/**
 * 월간 보고서(이미지 또는 PDF) 업로드를 위한 UI 컴포넌트입니다.
 * 파일이 선택되면, 사용자에게 AI 어시스턴트에게 분석을 요청하도록 안내합니다.
 */
const OmsUploader: React.FC = () => {
    // 선택된 파일을 저장하는 상태
    const [file, setFile] = useState<File | null>(null);
    // 오류 메시지를 저장하는 상태
    const [error, setError] = useState<string | null>(null);

    /**
     * 파일 입력(input)의 변경을 처리하는 핸들러입니다.
     * 사용자가 파일을 선택하면 상태를 업데이트하고 오류를 초기화합니다.
     * @param e - HTML input 요소의 변경 이벤트 객체
     */
    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFile = e.target.files?.[0];
        if (selectedFile) {
            // 현재는 모든 이미지/PDF 타입을 허용하도록 단순화합니다.
            // 추후 특정 포맷(e.g., JPEG, PNG, PDF)만 허용하도록 개선할 수 있습니다.
            setFile(selectedFile);
            setError(null);
        } else {
            setFile(null);
            setError('파일이 선택되지 않았습니다.');
        }
    };

    return (
        <div className="p-4 bg-white rounded-lg shadow-md space-y-6">
            <div className="max-w-3xl mx-auto text-center py-12">
                
                {/* 파일이 선택되었을 때의 UI */}
                {file ? (
                    <>
                        <CheckCircle className="mx-auto h-16 w-16 text-green-500" />
                        <h2 className="mt-4 text-2xl font-bold text-gray-800">파일 선택 완료!</h2>
                        <p className="mt-2 text-md text-gray-600">
                            이제 AI 어시스턴트에게 <br/>
                            <span className="font-semibold text-indigo-600">"이 파일 분석해줘"</span> 또는 <span className="font-semibold text-indigo-600">"월간 보고서 데이터 추출해줘"</span> 라고 요청하세요.
                        </p>
                        <div className="mt-6 text-sm font-medium text-gray-500 bg-gray-50 rounded-md p-3">
                            선택된 파일: {file.name}
                        </div>
                    </>
                ) : (
                    /* 파일 선택 전의 기본 UI */
                    <>
                        <UploadCloud className="mx-auto h-16 w-16 text-gray-300" />
                        <h2 className="mt-4 text-2xl font-bold text-gray-800">월간 보고서 자동화</h2>
                        <p className="mt-2 text-sm text-gray-500">이미지 또는 PDF 파일을 선택하여 AI 분석을 시작하세요.</p>
                        <div className="mt-8">
                            <label htmlFor="file-upload" className="cursor-pointer inline-flex items-center px-6 py-3 border border-gray-300 text-base font-medium rounded-full shadow-sm bg-white text-gray-700 hover:bg-gray-50 transition-colors">
                                <FileCheck2 className="-ml-1 mr-2 h-5 w-5" />
                                보고서 파일 선택
                            </label>
                            <input
                                id="file-upload"
                                type="file"
                                className="sr-only"
                                // 이미지와 PDF 파일만 선택 가능하도록 accept 속성 설정
                                accept=".pdf,image/png,image/jpeg,image/jpg"
                                onChange={handleFileChange}
                            />
                        </div>
                    </>
                )}

                {/* 오류 메시지 표시 */}
                {error && (
                    <p className="mt-4 text-sm font-semibold text-red-600 flex items-center justify-center">
                        <AlertTriangle className="h-5 w-5 mr-2"/>
                        {error}
                    </p>
                )}
            </div>
        </div>
    );
};

export default OmsUploader;
