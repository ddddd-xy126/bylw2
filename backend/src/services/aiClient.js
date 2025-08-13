import axios from 'axios';
import { config } from '../config/index.js';

export const analyzeAnswers = async ({ answers, analysisTypes }) => {
	const url = `${config.ai.baseUrl}/analyze`;
	const headers = { 'Authorization': `Bearer ${config.ai.apiKey}` };
	const payload = {
		answers,
		analysis_types: analysisTypes
	};
	const { data } = await axios.post(url, payload, { headers, timeout: 5000 });
	return data;
};
