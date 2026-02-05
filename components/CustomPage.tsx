
import React from 'react';

interface CustomPageProps {
  title: string;
}

const CustomPage: React.FC<CustomPageProps> = ({ title }) => {
  return (
    <div className="flex flex-col gap-8 pb-10">
      <div className="flex items-center justify-between">
        <h2 className="text-4xl font-bold text-gray-800">{title}</h2>
      </div>
      <div className="bg-white p-10 rounded-5xl shadow-sm border border-gray-50 flex flex-col md:flex-row justify-between gap-10">
        
      </div>
    </div>
  );
};

export default CustomPage;
