"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.proxyKosisApi = void 0;
const functions = require("firebase-functions");
const https = require("https");
exports.proxyKosisApi = functions.https.onRequest((request, response) => {
    const apiUrl = `https://kosis.kr/openapi/Param/statisticsParameterData.do?${request.url.split('?')[1]}`;
    const proxyRequest = https.request(apiUrl, (res) => {
        let data = '';
        res.on('data', (chunk) => {
            data += chunk;
        });
        res.on('end', () => {
            response.set('Access-Control-Allow-Origin', '*');
            response.status(res.statusCode || 500).send(data);
        });
    });
    proxyRequest.on('error', (error) => {
        response.status(500).send(error.message);
    });
    proxyRequest.end();
});
//# sourceMappingURL=index.js.map