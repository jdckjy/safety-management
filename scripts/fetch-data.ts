import axios from 'axios';
import fs from 'fs';
import path from 'path';

const API_KEY = process.env.VITE_KOSIS_API_KEY;
const OUTPUT_DIR = 'src/data';
const OUTPUT_PATH = path.join(OUTPUT_DIR, 'jeju-population-data.json');

async function fetchData() {
  if (!API_KEY) {
    console.error('Error: VITE_KOSIS_API_KEY is not defined in your environment variables.');
    process.exit(1);
  }

  // Create output directory if it doesn't exist
  if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  }

  const apiUrl = `https://kosis.kr/openapi/statisticsData.do`;

  try {
    console.log('Fetching data from KOSIS API...');
    const response = await axios.get(apiUrl, {
      params: {
        method: 'getList',
        apiKey: API_KEY,
        format: 'json',
        jsonVD: 'Y',
        userStatsId: 'jdckjy/101/DT_1B040A3/2/1/20240616142718',
        prdSe: 'M',
        startPrdDe: '202301',
        endPrdDe: '202312',
        orgId: '101',
        tblId: 'DT_1B040A3',
      },
    });

    if (response.data && response.data.length > 0) {
      fs.writeFileSync(OUTPUT_PATH, JSON.stringify(response.data, null, 2));
      console.log(`Successfully fetched and saved data to ${OUTPUT_PATH}`);
    } else if (response.data.errMsg) {
      console.error('Error from KOSIS API:', response.data.errMsg);
    } else {
      console.warn('Warning: No data was returned from the API, but there was no error message.');
      fs.writeFileSync(OUTPUT_PATH, '[]'); // Save an empty array
    }

  } catch (error) {
    console.error('An unexpected error occurred while fetching data:', error);
    process.exit(1);
  }
}

fetchData();
