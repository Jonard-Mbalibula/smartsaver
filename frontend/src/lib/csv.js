export function toCsv(rows){
  if (!rows || rows.length === 0) return ''
  const keys = Object.keys(rows[0])
  const esc = v => {
    if (v == null) return ''
    const s = String(v)
    return /[",\n]/.test(s) ? '"' + s.replace(/"/g,'""') + '"' : s
  }
  const header = keys.map(esc).join(',')
  const body = rows.map(r => keys.map(k => esc(r[k])).join(',')).join('\n')
  return header + '\n' + body
}

export function downloadCsv(filename, rows){
  const csv = toCsv(rows)
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
}


