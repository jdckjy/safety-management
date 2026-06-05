"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const axios_1 = __importDefault(require("axios"));
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const API_KEY = process.env.VITE_KOSIS_API_KEY;
const OUTPUT_DIR = 'src/data';
const OUTPUT_PATH = path_1.default.join(OUTPUT_DIR, 'jeju-population-data.json');
async function fetchData() {
    if (!API_KEY) {
        console.error('Error: VITE_KOSIS_API_KEY is not defined in your environment variables.');
        process.exit(1);
    }
    // Create output directory if it doesn't exist
    if (!fs_1.default.existsSync(OUTPUT_DIR)) {
        fs_1.default.mkdirSync(OUTPUT_DIR, { recursive: true });
    }
    const apiUrl = `https://kosis.kr/openapi/statisticsData.do`;
    try {
        console.log('Fetching data from KOSIS API...');
        const response = await axios_1.default.get(apiUrl, {
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
            fs_1.default.writeFileSync(OUTPUT_PATH, JSON.stringify(response.data, null, 2));
            console.log(`Successfully fetched and saved data to ${OUTPUT_PATH}`);
        }
        else if (response.data.errMsg) {
            console.error('Error from KOSIS API:', response.data.errMsg);
        }
        else {
            console.warn('Warning: No data was returned from the API, but there was no error message.');
            fs_1.default.writeFileSync(OUTPUT_PATH, '[]'); // Save an empty array
        }
    }
    catch (error) {
        console.error('An unexpected error occurred while fetching data:', error);
        process.exit(1);
    }
}
fetchData();
