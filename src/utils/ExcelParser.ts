
import * as XLSX from 'xlsx';

export interface ProfitAnalysisData {
  date: string;
  category: string;
  description: string;
  client: string;
  amount: number;
  type: 'income' | 'expense';
}

export const parseExcelFile = (file: File): Promise<ProfitAnalysisData[]> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (event) => {
      try {
        const data = event.target?.result;
        if (!data) {
          reject(new Error("Failed to read file."));
          return;
        }

        const workbook = XLSX.read(data, { type: 'array', cellDates: true });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        
        const json = XLSX.utils.sheet_to_json<any>(worksheet);

        const processedData: ProfitAnalysisData[] = json.map((row) => {
          const category = row['계정과목명'] || '';
          const amountStr = String(row['당기실적'] || '0');
          let amount = parseFloat(amountStr.replace(/,/g, ''));
          
          let type: 'income' | 'expense';

          if (category === '잡이익') {
            type = 'income';
            amount = Math.abs(amount); // 잡이익은 항상 양수로 처리하여 수입으로
          } else {
            const budgetBalanceStr = String(row['운영예산잔액'] || '0');
            const budgetBalance = parseFloat(budgetBalanceStr.replace(/,/g, ''));
            type = budgetBalance > 0 ? 'expense' : 'income';
          }

          const dateValue = row['일자'];
          let isoDate = '';
          if (dateValue instanceof Date) {
            isoDate = dateValue.toISOString();
          } else if (typeof dateValue === 'string') {
            isoDate = new Date(dateValue).toISOString();
          } else {
             try {
              // Handle Excel's numeric date format
              isoDate = new Date(Date.UTC(0, 0, dateValue - 1)).toISOString();
            } catch (e) {
                console.error("Could not parse date:", dateValue);
                isoDate = new Date().toISOString();
            }
          }

          return {
            date: isoDate,
            category: category,
            description: row['적요'] || '',
            client: row['거래처명'] || '',
            amount: isNaN(amount) ? 0 : amount,
            type: type,
          };
        });

        resolve(processedData);
      } catch (error) {
        reject(error);
      }
    };

    reader.onerror = (error) => {
      reject(error);
    };

    reader.readAsArrayBuffer(file);
  });
};
