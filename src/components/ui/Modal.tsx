
import React, { useEffect, ReactNode } from 'react';
import { X } from 'lucide-react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
}

const sizeClasses = {
  sm: 'max-w-sm',
  md: 'max-w-md',
  lg: 'max-w-lg',
  xl: 'max-w-4xl',
  full: 'max-w-full h-full',
};

const Modal: React.FC<ModalProps> = ({ isOpen, onClose, children, size = 'xl' }) => {
  useEffect(() => {
    // 모달이 열리면 body 스크롤을 막습니다.
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    }
    // 컴포넌트가 언마운트되거나 모달이 닫힐 때 body 스크롤을 복원합니다.
    return () => {
      document.body.style.overflow = 'auto';
    };
  }, [isOpen]);

  if (!isOpen) {
    return null;
  }

  // 배경 클릭 시 닫기
  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    // 최상위 컨테이너: 배경 오버레이
    <div
      className="fixed inset-0 bg-black bg-opacity-60 flex justify-center items-center z-50 animate-fade-in"
      onClick={handleBackdropClick}
    >
      {/* 모달 콘텐츠 컨테이너 */}
      <div className={`bg-[#F4F1EC] rounded-3xl shadow-2xl w-full h-[95vh] flex flex-col animate-slide-up-fade-in ${sizeClasses[size]}`}>
        {/*
          닫기 버튼은 children 내부에서 구현하거나,
          여기에 고정적으로 배치할 수 있습니다.
          우선 children이 모든 것을 제어하도록 열어두겠습니다.
        */}
        {children}
      </div>
    </div>
  );
};

export default Modal;
