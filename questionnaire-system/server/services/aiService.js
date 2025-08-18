import axios from 'axios'
import config from '../config/config.default.js'

export async function generateAnalysis(payload) {
  if (!config.ai.apiKey) {
    return { summary: '开发环境占位：请在配置中设置 AI_API_KEY', sections: [] }
  }
  const client = axios.create({ baseURL: config.ai.baseURL, headers: { 'Authorization': `Bearer ${config.ai.apiKey}` } })
  const { data } = await client.post('/v1/analysis', payload)
  return data
}


