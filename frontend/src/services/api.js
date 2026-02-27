import axios from 'axios';

const API_BASE = 'http://127.0.0.1:8000';

const api = axios.create({
    baseURL: API_BASE,
    headers: {
        'Content-Type': 'application/json',
    },
    timeout: 120000, // 2 min timeout for scans
});

export async function startScan(domain) {
    const response = await api.post('/scan', { domain });
    return response.data;
}

export async function getScan(scanId) {
    const response = await api.get(`/scan/${scanId}`);
    return response.data;
}

export async function getSummary(scanId) {
    const response = await api.post('/summary', { scan_id: scanId });
    return response.data;
}

export async function simulateAttack(scanId) {
    const response = await api.post('/simulate', { scan_id: scanId });
    return response.data;
}

export default api;
