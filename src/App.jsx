import { useState, useEffect } from 'react'
import { createClient } from '@supabase/supabase-js'
import MonthlyChart from './components/MonthlyChart.jsx'
import CategoryPieChart from './components/CategoryPieChart.jsx'
import TransactionTable from './components/TransactionTable.jsx'
import ExportButtons from './components/ExportButtons.jsx'

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_KEY
)

const MONTHS_ID = ['Jan','Feb','Mar','Apr','Mei','Jun','Jul','Agu','Sep','Okt','Nov','Des']

function formatRp(num) {
  return 'Rp' + (num || 0).toLocaleString('id-ID')
}

export default function App() {
  const [allTransactions, setAllTransactions] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth())
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear())

  useEffect(() => {
    fetchAll()
  }, [])

  async function fetchAll() {
    setLoading(true)
    setError(null)
    try {
      const { data, error } = await supabase
        .from('transaksi')
        .select('*')
        .order('created_at', { ascending: false })
      if (error) throw error
      setAllTransactions(data || [])
    } catch (e) {
      setError('Gagal memuat data: ' + e.message)
    } finally {
      setLoading(false)
    }
  }

  // Filter transaksi bulan & tahun yang dipilih
  const filteredTransactions = allTransactions.filter(t => {
    const d = new Date(t.created_at)
    return d.getMonth() === selectedMonth && d.getFullYear() === selectedYear
  })

  // Summary bulan ini
  const totalPemasukan = filteredTransactions
    .filter(t => t.jenis === 'pemasukan')
    .reduce((s, t) => s + (t.nominal || 0), 0)
  const totalPengeluaran = filteredTransactions
    .filter(t => t.jenis === 'pengeluaran')
    .reduce((s, t) => s + (t.nominal || 0), 0)
  const saldo = totalPemasukan - totalPengeluaran

  // Data 6 bulan terakhir untuk bar chart
  const last6Months = []
  for (let i = 5; i >= 0; i--) {
    let m = selectedMonth - i
    let y = selectedYear
    if (m < 0) { m += 12; y -= 1 }
    const txs = allTransactions.filter(t => {
      const d = new Date(t.created_at)
      return d.getMonth() === m && d.getFullYear() === y
    })
    last6Months.push({
      label: MONTHS_ID[m] + ' ' + y,
      pemasukan: txs.filter(t => t.jenis === 'pemasukan').reduce((s, t) => s + (t.nominal || 0), 0),
      pengeluaran: txs.filter(t => t.jenis === 'pengeluaran').reduce((s, t) => s + (t.nominal || 0), 0),
    })
  }

  // Data per kategori untuk pie chart
  const perKategori = {}
  filteredTransactions
    .filter(t => t.jenis === 'pengeluaran')
    .forEach(t => {
      if (!perKategori[t.kategori]) perKategori[t.kategori] = 0
      perKategori[t.kategori] += t.nominal || 0
    })

  // Tahun yang tersedia
  const availableYears = [...new Set(allTransactions.map(t => new Date(t.created_at).getFullYear()))].sort((a,b) => b-a)
  if (!availableYears.includes(selectedYear)) availableYears.unshift(selectedYear)

  return (
    <div style={{ minHeight: '100vh', background: '#f0f4f8' }}>
      {/* HEADER */}
      <header style={{
        background: 'linear-gradient(135deg, #1a3a5c 0%, #0d2540 100%)',
        color: 'white',
        padding: '20px 32px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        boxShadow: '0 4px 20px rgba(26,58,92,0.3)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <span style={{ fontSize: 36 }}>🗺️</span>
          <div>
            <h1 style={{ fontSize: 22, fontWeight: 700, letterSpacing: 0.5 }}>Dashboard Keuangan Nami</h1>
            <p style={{ fontSize: 13, opacity: 0.75, marginTop: 2 }}>
              "Nami catat semua, tidak ada yang lolos dari pengawasanku!"
            </p>
          </div>
        </div>
        <button
          onClick={fetchAll}
          style={{
            background: 'rgba(255,255,255,0.15)',
            border: '1px solid rgba(255,255,255,0.3)',
            color: 'white',
            padding: '8px 18px',
            borderRadius: 8,
            cursor: 'pointer',
            fontSize: 13,
            fontWeight: 600,
            transition: 'background 0.2s'
          }}
          onMouseOver={e => e.target.style.background = 'rgba(255,255,255,0.25)'}
          onMouseOut={e => e.target.style.background = 'rgba(255,255,255,0.15)'}
        >
          🔄 Refresh
        </button>
      </header>

      <main style={{ maxWidth: 1200, margin: '0 auto', padding: '28px 24px' }}>
        {/* FILTER BULAN */}
        <div style={{
          background: 'white',
          borderRadius: 12,
          padding: '16px 24px',
          marginBottom: 24,
          display: 'flex',
          alignItems: 'center',
          gap: 16,
          boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
          flexWrap: 'wrap'
        }}>
          <span style={{ fontWeight: 600, color: '#1a3a5c' }}>📅 Filter Periode:</span>
          <select
            value={selectedMonth}
            onChange={e => setSelectedMonth(parseInt(e.target.value))}
            style={selectStyle}
          >
            {MONTHS_ID.map((m, i) => (
              <option key={i} value={i}>{m}</option>
            ))}
          </select>
          <select
            value={selectedYear}
            onChange={e => setSelectedYear(parseInt(e.target.value))}
            style={selectStyle}
          >
            {availableYears.map(y => (
              <option key={y} value={y}>{y}</option>
            ))}
          </select>
          <span style={{ fontSize: 13, color: '#7a92a8', marginLeft: 4 }}>
            {filteredTransactions.length} transaksi
          </span>
        </div>

        {loading && (
          <div style={{ textAlign: 'center', padding: 60, color: '#7a92a8' }}>
            <div style={{ fontSize: 48, marginBottom: 16 }}>🗺️</div>
            <p style={{ fontSize: 16 }}>Nami sedang menghitung keuanganmu...</p>
          </div>
        )}

        {error && (
          <div style={{
            background: '#fff0f0', border: '1px solid #ffcdd2',
            borderRadius: 12, padding: 20, color: '#c0392b', marginBottom: 24
          }}>
            ❌ {error}
          </div>
        )}

        {!loading && !error && (
          <>
            {/* SUMMARY CARDS */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 16, marginBottom: 24 }}>
              <SummaryCard
                label="Total Pemasukan"
                value={formatRp(totalPemasukan)}
                icon="💚"
                color="#27ae60"
                bg="#f0fff4"
              />
              <SummaryCard
                label="Total Pengeluaran"
                value={formatRp(totalPengeluaran)}
                icon="❤️"
                color="#e74c3c"
                bg="#fff5f5"
              />
              <SummaryCard
                label="Saldo Bersih"
                value={formatRp(saldo)}
                icon={saldo >= 0 ? '💰' : '⚠️'}
                color={saldo >= 0 ? '#1a3a5c' : '#e67e22'}
                bg={saldo >= 0 ? '#f0f4ff' : '#fff8f0'}
              />
              <SummaryCard
                label="Sisa Bayar KK"
                value="Rp18.000.000"
                icon="💳"
                color="#8e44ad"
                bg="#fdf0ff"
                sub="Target lunas agresif!"
              />
            </div>

            {/* CHARTS ROW */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 24 }}>
              <div style={cardStyle}>
                <h3 style={cardTitleStyle}>📊 Pemasukan vs Pengeluaran (6 Bulan)</h3>
                <MonthlyChart data={last6Months} />
              </div>
              <div style={cardStyle}>
                <h3 style={cardTitleStyle}>🥧 Pengeluaran per Kategori</h3>
                {Object.keys(perKategori).length > 0
                  ? <CategoryPieChart data={perKategori} />
                  : <EmptyState text="Belum ada pengeluaran bulan ini" />
                }
              </div>
            </div>

            {/* EXPORT BUTTONS */}
            <div style={{ marginBottom: 16 }}>
              <ExportButtons
                transactions={filteredTransactions}
                month={MONTHS_ID[selectedMonth]}
                year={selectedYear}
              />
            </div>

            {/* TABEL TRANSAKSI */}
            <div style={cardStyle}>
              <h3 style={cardTitleStyle}>📋 Riwayat Transaksi</h3>
              {filteredTransactions.length > 0
                ? <TransactionTable transactions={filteredTransactions} />
                : <EmptyState text="Belum ada transaksi di periode ini" />
              }
            </div>
          </>
        )}
      </main>

      {/* FOOTER */}
      <footer style={{ textAlign: 'center', padding: '20px', color: '#a0b4c8', fontSize: 13 }}>
        🏴‍☠️ Dashboard Keuangan Nami — "Setiap rupiah harus dipertanggungjawabkan, nakama!"
      </footer>
    </div>
  )
}

function SummaryCard({ label, value, icon, color, bg, sub }) {
  return (
    <div style={{
      background: bg,
      border: `1px solid ${color}22`,
      borderRadius: 12,
      padding: '20px 22px',
      boxShadow: '0 2px 8px rgba(0,0,0,0.05)'
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <p style={{ fontSize: 13, color: '#7a92a8', fontWeight: 500, marginBottom: 6 }}>{label}</p>
          <p style={{ fontSize: 22, fontWeight: 700, color }}>{value}</p>
          {sub && <p style={{ fontSize: 12, color: '#e67e22', marginTop: 4 }}>{sub}</p>}
        </div>
        <span style={{ fontSize: 28 }}>{icon}</span>
      </div>
    </div>
  )
}

function EmptyState({ text }) {
  return (
    <div style={{ textAlign: 'center', padding: '40px 20px', color: '#a0b4c8' }}>
      <div style={{ fontSize: 40, marginBottom: 10 }}>📭</div>
      <p>{text}</p>
    </div>
  )
}

const selectStyle = {
  padding: '8px 14px',
  borderRadius: 8,
  border: '1px solid #d0dce8',
  background: 'white',
  color: '#1a3a5c',
  fontSize: 14,
  fontWeight: 500,
  cursor: 'pointer',
  outline: 'none'
}

const cardStyle = {
  background: 'white',
  borderRadius: 12,
  padding: '20px 24px',
  boxShadow: '0 2px 8px rgba(0,0,0,0.06)'
}

const cardTitleStyle = {
  fontSize: 15,
  fontWeight: 700,
  color: '#1a3a5c',
  marginBottom: 16,
  paddingBottom: 12,
  borderBottom: '1px solid #eef2f7'
}
