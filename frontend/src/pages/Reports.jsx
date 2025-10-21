import { exportContribsPdf, exportLoansExcel, exportContribsCsv, exportSavingsSummaryPdf } from '../lib/api.js'

export default function Reports(){
  const today = new Date().toISOString().slice(0,10)
  const monthStart = new Date(); monthStart.setDate(1)
  const [range, setRange] = React.useState({ start: monthStart.toISOString().slice(0,10), end: today })
  async function downloadBlob(blob, filename){
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = filename
    a.click()
    URL.revokeObjectURL(url)
  }

  async function downloadContribs(){
    const blob = await exportContribsPdf()
    downloadBlob(blob, 'contributions.pdf')
  }
  async function downloadContribsCsv(){
    const blob = await exportContribsCsv(range)
    downloadBlob(blob, 'contributions.csv')
  }
  async function downloadLoans(){
    const blob = await exportLoansExcel()
    downloadBlob(blob, 'loans.xlsx')
  }
  async function downloadSavingsSummary(){
    const blob = await exportSavingsSummaryPdf(range)
    downloadBlob(blob, 'savings_summary.pdf')
  }

  return (
    <div>
      <h3>Reports & Exports</h3>
      <div className="card" style={{margin:'12px 0'}}>
        <h4>Contributions (by date range)</h4>
        <div className="row" style={{gap:8, marginTop:8}}>
          <label className="row" style={{gap:6}}>Start <input className="input" type="date" value={range.start} onChange={e=>setRange({...range, start:e.target.value})} /></label>
          <label className="row" style={{gap:6}}>End <input className="input" type="date" value={range.end} onChange={e=>setRange({...range, end:e.target.value})} /></label>
          <button className="button" onClick={downloadContribsCsv}>Download CSV</button>
          <button className="button" onClick={downloadContribs}>Download PDF</button>
        </div>
      </div>
      <div className="row" style={{gap:12, marginTop:12}}>
        <button className="button" onClick={downloadContribs}>Download Contributions PDF</button>
        <button className="button" onClick={downloadLoans}>Download Loans Excel</button>
        <button className="button" onClick={downloadSavingsSummary}>Download Savings Summary (PDF)</button>
      </div>
    </div>
  )
}





