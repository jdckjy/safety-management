"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.kosisProxy = void 0;
const functions = require("firebase-functions");
const axios_1 = require("axios");
const cors = require("cors");
const params_1 = require("firebase-functions/params");
const kosisApiKey = (0, params_1.defineString)("KOSIS_API_KEY");
const corsHandler = cors({ origin: true });
exports.kosisProxy = functions.https.onRequest((request, response) => {
    corsHandler(request, response, async () => {
        var _a, _b;
        functions.logger.info("KOSIS Proxy Request Received", {
            query: request.query,
            method: request.method,
            headers: request.headers,
        });
        let KOSIS_API_KEY;
        try {
            KOSIS_API_KEY = kosisApiKey.value();
        }
        catch (e) {
            functions.logger.error("Failed to read KOSIS_API_KEY param:", e);
            response.status(500).send("KOSIS_API_KEY is not configured correctly in Firebase Functions parameters.");
            return;
        }
        if (!KOSIS_API_KEY) {
            functions.logger.error("KOSIS_API_KEY parameter is defined but has no value.");
            response.status(500).send("KOSIS_API_KEY environment variable is not set.");
            return;
        }
        try {
            const { startPrdDe, endPrdDe } = request.query;
            if (!startPrdDe || !endPrdDe) {
                functions.logger.warn("Missing date range parameters", { startPrdDe, endPrdDe });
                response.status(400).send("Date range parameters (startPrdDe, endPrdDe) are required.");
                return;
            }
            const kosisUrl = `https://kosis.kr/openapi/statisticsData.do`;
            const params = {
                method: "getList",
                apiKey: KOSIS_API_KEY,
                format: "json",
                jsonVD: "Y",
                orgId: "101",
                tblId: "DT_1B040A3",
                objL1: "50",
                itmId: "T20",
                prdSe: "M",
                startPrdDe: startPrdDe,
                endPrdDe: endPrdDe,
            };
            const headers = {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                'Accept': 'application/json',
            };
            functions.logger.info("Calling KOSIS API", { url: kosisUrl, params });
            const kosisResponse = await axios_1.default.get(kosisUrl, { headers, params, timeout: 10000 });
            functions.logger.info("KOSIS API Response Received", {
                status: kosisResponse.status,
                dataLength: Array.isArray(kosisResponse.data) ? kosisResponse.data.length : 'N/A'
            });
            if (Array.isArray(kosisResponse.data)) {
                response.status(200).json(kosisResponse.data);
            }
            else if (kosisResponse.data && (kosisResponse.data.errMsg || kosisResponse.data.RESULT)) {
                functions.logger.warn("KOSIS API returned a non-array response:", kosisResponse.data);
                response.status(200).json(kosisResponse.data);
            }
            else {
                functions.logger.warn("KOSIS API returned an unexpected data format, defaulting to empty array.", kosisResponse.data);
                response.status(200).json([]);
            }
        }
        catch (error) {
            if (axios_1.default.isAxiosError(error)) {
                const axiosError = error;
                functions.logger.error("Axios Error during KOSIS request", {
                    message: axiosError.message,
                    code: axiosError.code,
                    response: axiosError.response ? {
                        status: axiosError.response.status,
                        headers: axiosError.response.headers,
                        data: axiosError.response.data,
                    } : "No response body",
                });
                if (axiosError.code === 'ECONNRESET') {
                    response.status(502).send(`Connection reset by KOSIS server (ECONNRESET). This often indicates that the KOSIS server is blocking the Cloud Function's IP address. Please check if the KOSIS API has IP restrictions or if the service is temporarily unavailable for automated requests from cloud providers.`);
                }
                else if (axiosError.code === 'ETIMEDOUT') {
                    response.status(504).send(`Connection to KOSIS server timed out.`);
                }
                else {
                    const status = ((_a = axiosError.response) === null || _a === void 0 ? void 0 : _a.status) || 500;
                    const data = ((_b = axiosError.response) === null || _b === void 0 ? void 0 : _b.data) || axiosError.message || "An unexpected error occurred while communicating with the KOSIS API.";
                    response.status(status).json({
                        error: "KOSIS API Error",
                        details: data,
                        status: status
                    });
                }
            }
            else {
                functions.logger.error("Non-Axios Error in KOSIS proxy", error);
                response.status(500).send("An internal server error occurred in the proxy function.");
            }
        }
    });
});
//# sourceMappingURL=index.js.map