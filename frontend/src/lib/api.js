import axios from 'axios'

export const api = axios.create({ baseURL: '/api' })

export async function getSummary() {
  const { data } = await api.get('/reports/summary')
  return data
}

export async function listMembers() {
  const { data } = await api.get('/members')
  return data
}

export async function createMember(payload) {
  const { data } = await api.post('/members', payload)
  return data
}

export async function listContributions(query) {
  const { data } = await api.get('/contributions', { params: query })
  return data
}

export async function createContribution(payload) {
  const { data } = await api.post('/contributions', payload)
  return data
}

export async function listLoans() {
  const { data } = await api.get('/loans')
  return data
}

export async function createLoan(payload) {
  const { data } = await api.post('/loans', payload)
  return data
}

export async function decideLoan(id, action) {
  const { data } = await api.post(`/loans/${id}/decision`, { action })
  return data
}

export async function getLoan(id) {
  const { data } = await api.get(`/loans/${id}`)
  return data
}

export async function exportLoansExcel() {
  const res = await api.get('/reports/loans/excel', { responseType: 'blob' })
  return res.data
}

export async function exportContribsPdf() {
  const res = await api.get('/reports/contributions/pdf', { responseType: 'blob' })
  return res.data
}

export async function exportContribsCsv(params) {
  const res = await api.get('/reports/contributions.csv', { params, responseType: 'blob' })
  return res.data
}

export async function getMemberProfile(id) {
  const { data } = await api.get(`/members/${id}`)
  return data
}

export async function listRepayments(query) {
  const { data } = await api.get('/repayments', { params: query })
  return data
}

export async function createRepayment(payload) {
  const { data } = await api.post('/repayments', payload)
  return data
}

export async function getSettings() {
  const { data } = await api.get('/settings')
  return data
}

export async function updateSettings(payload) {
  const { data } = await api.put('/settings', payload)
  return data
}

export async function getMonthlySavings() {
  const { data } = await api.get('/reports/savings/monthly')
  return data
}

export async function exportMonthlySavingsCsv() {
  const res = await api.get('/reports/savings/monthly.csv', { responseType: 'blob' })
  return res.data
}

export async function exportMemberStatementPdf(id) {
  const res = await api.get(`/reports/members/${id}/statement.pdf`, { responseType: 'blob' })
  return res.data
}

export async function exportMemberSavingsCsv(id, params) {
  const res = await api.get(`/reports/members/${id}/savings.csv`, { params, responseType: 'blob' })
  return res.data
}

export async function exportSavingsSummaryPdf(params) {
  const res = await api.get('/reports/savings/summary.pdf', { params, responseType: 'blob' })
  return res.data
}





