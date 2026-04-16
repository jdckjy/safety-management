
import React from 'react';
import { useProjectData } from '../../providers/ProjectDataProvider';
import { Button } from '../../components/ui/button';
import { FileText, Download, Eye } from 'lucide-react';

interface TenantDocumentsTabProps {
  tenantId: string;
}

const TenantDocumentsTab: React.FC<TenantDocumentsTabProps> = ({ tenantId }) => {
  const { attachments } = useProjectData();
  const tenantAttachments = attachments.filter(doc => doc.tenantId === tenantId);

  if (tenantAttachments.length === 0) {
    return (
      <div className="text-center py-12 text-gray-500">
        <p>업로드된 서류가 없습니다.</p>
        <Button className="mt-4">서류 업로드</Button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
          <Button>서류 업로드</Button>
      </div>
      <div className="border rounded-lg">
        <ul className="divide-y">
          {tenantAttachments.map(doc => (
            <li key={doc.id} className="p-4 flex items-center justify-between hover:bg-gray-50">
              <div className="flex items-center">
                <FileText className="w-6 h-6 mr-4 text-gray-400" />
                <div>
                  <p className="font-semibold">{doc.name}</p>
                  <p className="text-sm text-gray-500">{doc.type} | {doc.uploadDate}</p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <Button variant="outline" size="sm">
                  <Eye className="w-4 h-4 mr-1" />
                  미리보기
                </Button>
                <Button variant="outline" size="sm">
                  <Download className="w-4 h-4 mr-1" />
                  다운로드
                </Button>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default TenantDocumentsTab;
