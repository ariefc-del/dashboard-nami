import { useState } from 'react'

function formatRp(num) {
  return 'Rp' + (num || 0).toLocaleString('id-ID')
}
function formatTgl(str) {
  return new Date(str).toLocaleString('id-ID', {
    timeZone: 'Asia/Jakarta',
    day: '2-digit', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit'
  })
}

export default function TransactionTable({ transactions }) {
  const [search, setSearch] = useState('')
  const [sortKey, setSortKey] = useState('created_at')
  const [sortDir, setSortDir] = useState('desc')
  const [page, setPage] = useState(1)
  const perPage = 15

  const filtered = transactions
    .filter(t => {
      const q = search.toLowerCase()
      return (
        (t.keterangan || '').toLowerCase().includes(q) ||
        (t.kategori || '').toLowerCase().includes(q) ||
        (t.jenis || '').toLowerCase().includes(q)
      )
    })
    .sort((a, b) => {
      let va = a[sortKey], vb = b[sortKey]
      if (sortKey === 'nominal') { va = Number(va); vb = Number(vb) }
      if (va < vb) return sortDir === 'asc' ? -1 : 1
      if (va > vb) return sortDir === 'asc' ? 1 : -1
      return 0
    })

  const totalPages = Math.ceil(filtered.length / perPage)
  const paged = filtered.slice((page - 1) * perPage, page * perPage)

  function toggleSort(key) {
    if (sortKey === key) setSortDir(d => d === 'asc' ? 'desc' : 'asc')
    else { setSortKey(key); setSortDir('desc') }
    setPage(1)
  }

  function SortIcon({ col }) {
    if (sortKey !== col) return <span style={{ opacity: 0.3 }}>⇅</span>
    return <span>{sortDir === 'asc' ? '↑' : '↓'}</span>
  }

  return (
    <div>
      {/* Search */}
      <div style={{ marginBottom: 16 }}>
        <input
          type="text"
          placeholder="🔍 Cari keterangan, kategori..."
          value={search}
          onChange={e => { setSearch(e.target.value); setPage(1) }}
          style={{
            width: '100%', maxWidth: 360,
            padding: '9px 14px',
            border: '1px solid #d0dce8',
            borderRadius: 8,
            fontSize: 14,
            color: '#1a3a5c',
            outline: 'none',
          }}
        />
      </div>

      {/* Table */}
      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14 }}>
          <thead>
            <tr style={{ background: '#f0f4f8', borderBottom: '2px solid #d0dce8' }}>
              {[
                { key: 'created_at', label: 'Tanggal' },
                { key: 'keterangan', label: 'Keterangan' },
                { key: 'kategori', label: 'Kategori' },
                { key: 'jenis', label: 'Jenis' },
                { key: 'nominal', label: 'Nominal' },
              ].map(col => (
                <th
                  key={col.key}
                  onClick={() => toggleSort(col.key)}
                  style={{
                    padding: '10px 14px',
                    textAlign: 'left',
                    fontWeight: 600,
                    color: '#1a3a5c',
                    cursor: 'pointer',
                    whiteSpace: 'nowrap',
                    userSelect: 'none'
                  }}
                >
                  {col.label} <SortIcon col={col.key} />
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {paged.length === 0 ? (
              <tr>
                <td colSpan={5} style={{ textAlign: 'center', padding: 32, color: '#a0b4c8' }}>
                  Tidak ada transaksi yang cocok
                </td>
              </tr>
            ) : paged.map((t, i) => (
              <tr
                key={t.id}
                style={{
                  borderBottom: '1px solid #eef2f7',
                  background: i % 2 === 0 ? 'white' : '#fafcfe',
                  transition: 'background 0.15s'
                }}
                onMouseOver={e => e.currentTarget.style.background = '#f0f4f8'}
                onMouseOut={e => e.currentTarget.style.background = i % 2 === 0 ? 'white' : '#fafcfe'}
              >
                <td style={tdStyle}>{formatTgl(t.created_at)}</td>
                <td style={tdStyle}>{t.keterangan || t.pesan_asli || '-'}</td>
                <td style={tdStyle}>
                  <span style={{
                    background: '#eef2f7',
                    padding: '3px 8px',
                    borderRadius: 6,
                    fontSize: 12,
                    fontWeight: 500
                  }}>
                    {t.kategori || '-'}
                  </span>
                </td>
                <td style={tdStyle}>
                  <span style={{
                    color: t.jenis === 'pemasukan' ? '#27ae60' : '#e74c3c',
                    fontWeight: 600,
                    fontSize: 12
                  }}>
                    {t.jenis === 'pemasukan' ? '▲ Pemasukan' : '▼ Pengeluaran'}
                  </span>
                </td>
                <td style={{ ...tdStyle, fontWeight: 700, color: t.jenis === 'pemasukan' ? '#27ae60' : '#e74c3c', whiteSpace: 'nowrap' }}>
                  {t.jenis === 'pemasukan' ? '+' : '-'}{formatRp(t.nominal)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 8, marginTop: 20 }}>
          <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} style={pgBtn}>‹ Prev</button>
          {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
            <button
              key={p}
              onClick={() => setPage(p)}
              style={{ ...pgBtn, background: p === page ? '#1a3a5c' : 'white', color: p === page ? 'white' : '#1a3a5c' }}
            >
              {p}
            </button>
          ))}
          <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages} style={pgBtn}>Next ›</button>
        </div>
      )}

      <p style={{ textAlign: 'right', fontSize: 12, color: '#a0b4c8', marginTop: 12 }}>
        {filtered.length} transaksi ditemukan
      </p>
    </div>
  )
}

const tdStyle = {
  padding: '10px 14px',
  color: '#1a3a5c',
  verticalAlign: 'middle'
}

const pgBtn = {
  padding: '6px 12px',
  border: '1px solid #d0dce8',
  borderRadius: 6,
  background: 'white',
  color: '#1a3a5c',
  cursor: 'pointer',
  fontSize: 13,
  fontWeight: 500
}
