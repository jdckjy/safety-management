
// Fix: Use standard React imports and ensure ErrorBoundary correctly extends React.Component to resolve member visibility issues.
import React, { Component, ErrorInfo, ReactNode, StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';

console.log('[SafeLink] Entry point index.tsx initialized.');

/**
 * 부팅 성공 처리 및 로딩 화면 제거
 */
const finalizeBoot = () => {
  console.log('[SafeLink] Triggering finalizeBoot routine.');
  
  if (typeof (window as any).__BOOT_SUCCESS__ === 'function') {
    (window as any).__BOOT_SUCCESS__();
  }

  const overlay = document.getElementById('loading-overlay');
  if (overlay) {
    overlay.style.opacity = '0';
    overlay.style.pointerEvents = 'none';
    setTimeout(() => {
      if (overlay && overlay.parentNode) {
        overlay.parentNode.removeChild(overlay);
        console.log('[SafeLink] Loading overlay removed from DOM.');
      }
    }, 600);
  }
};

interface EBProps {
  children?: ReactNode;
}

interface EBState {
  hasError: boolean;
  error?: Error;
}

/**
 * ErrorBoundary 클래스 컴포넌트
 */
// Fix: Explicitly extending Component (imported from 'react') with proper generics to ensure 'props' is inherited correctly.
class ErrorBoundary extends Component<EBProps, EBState> {
  // state 초기화
  public state: EBState = {
    hasError: false
  };

  constructor(props: EBProps) {
    super(props);
  }

  static getDerivedStateFromError(error: Error): EBState {
    return { hasError: true, error };
  }
  
  public componentDidCatch(error: Error, info: ErrorInfo) {
    console.error("[SafeLink] ErrorBoundary caught a crash:", error, info);
    finalizeBoot(); 
  }
  
  public render() {
    // 에러 발생 시 폴백 UI 렌더링
    if (this.state.hasError) {
      return (
        <div className="flex items-center justify-center min-h-screen bg-slate-50 p-6 font-sans">
          <div className="max-w-md w-full bg-white p-10 rounded-[2.5rem] shadow-2xl border border-slate-100">
            <h1 className="text-2xl font-black text-slate-900 mb-2 tracking-tight">System Halted</h1>
            <p className="text-sm text-slate-500 mb-8 leading-relaxed">
              인터페이스 로딩 중 치명적인 런타임 오류가 발생했습니다.
            </p>
            <div className="bg-red-50 p-4 rounded-2xl border border-red-100 mb-8 max-h-40 overflow-auto">
              <code className="text-[10px] text-red-600 font-mono break-all">
                {this.state.error?.message || "Unknown error details"}
              </code>
            </div>
            <button 
              onClick={() => window.location.reload()} 
              className="w-full py-4 bg-slate-900 text-white rounded-2xl font-bold transition-transform active:scale-95"
            >
              Force Restart
            </button>
          </div>
        </div>
      );
    }
    
    // 정상 시 자식 컴포넌트 반환
    // Fix: Accessing children through this.props which is now correctly inherited from Component.
    return this.props.children;
  }
}

const container = document.getElementById('root');
if (container) {
  try {
    console.log('[SafeLink] Mounting React root...');
    const root = createRoot(container);
    root.render(
      <StrictMode>
        <ErrorBoundary>
          <App />
        </ErrorBoundary>
      </StrictMode>
    );
    
    // 렌더링 스케줄링이 완료된 후 부팅 성공 처리
    requestAnimationFrame(() => {
      console.log('[SafeLink] Initial render frame detected.');
      setTimeout(finalizeBoot, 300);
    });
  } catch (err) {
    console.error("[SafeLink] Failed to mount React app:", err);
    finalizeBoot();
  }
} else {
  console.error("[SafeLink] FATAL: DOM target #root not found.");
}
