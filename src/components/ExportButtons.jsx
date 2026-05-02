import * as XLSX from 'xlsx'
import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'

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

export default function ExportButtons({ transactions, month, year }) {
  function exportExcel() {
    const rows = transactions.map(t => ({
      'Tanggal': formatTgl(t.created_at),
      'Keterangan': t.keterangan || t.pesan_asli || '-',
      'Kategori': t.kategori || '-',
      'Jenis': t.jenis,
      'Nominal': t.nominal || 0,
    }))

    // Summary
    const pemasukan = transactions.filter(t => t.jenis === 'pemasukan').reduce((s, t) => s + (t.nominal || 0), 0)
    const pengeluaran = transactions.filter(t => t.jenis === 'pengeluaran').reduce((s, t) => s + (t.nominal || 0), 0)

    const ws = XLSX.utils.json_to_sheet(rows)
    // Lebar kolom
    ws['!cols'] = [
      { wch: 22 }, { wch: 35 }, { wch: 25 }, { wch: 14 }, { wch: 18 }
    ]
    // Tambah summary di bawah
    const startRow = rows.length + 3
    XLSX.utils.sheet_add_aoa(ws, [
      [''],
      ['RINGKASAN'],
      ['Total Pemasukan', '', '', '', pemasukan],
      ['Total Pengeluaran', '', '', '', pengeluaran],
      ['Saldo', '', '', '', pemasukan - pengeluaran],
    ], { origin: { r: startRow, c: 0 } })

    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, ws, `${month} ${year}`)
    XLSX.writeFile(wb, `Keuangan_Nami_${month}_${year}.xlsx`)
  }

  function exportPDF() {
    const doc = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' })

    // Header
    doc.setFillColor(26, 58, 92)
    doc.rect(0, 0, 297, 22, 'F')
    doc.setTextColor(255, 255, 255)
    doc.setFontSize(16)
    doc.setFont('helvetica', 'bold')
    doc.text('Dashboard Keuangan Nami', 14, 14)
    doc.setFontSize(10)
    doc.setFont('helvetica', 'normal')
    doc.text(`Laporan ${month} ${year}`, 200, 14)

    // Summary
    const pemasukan = transactions.filter(t => t.jenis === 'pemasukan').reduce((s, t) => s + (t.nominal || 0), 0)
    const pengeluaran = transactions.filter(t => t.jenis === 'pengeluaran').reduce((s, t) => s + (t.nominal || 0), 0)
    const saldo = pemasukan - pengeluaran

    doc.setTextColor(26, 58, 92)
    doc.setFontSize(10)
    doc.setFont('helvetica', 'bold')
    doc.text(`Pemasukan: ${formatRp(pemasukan)}`, 14, 32)
    doc.text(`Pengeluaran: ${formatRp(pengeluaran)}`, 90, 32)
    doc.text(`Saldo: ${formatRp(saldo)}`, 190, 32)

    // Tabel
    autoTable(doc, {
      startY: 38,
      head: [['Tanggal', 'Keterangan', 'Kategori', 'Jenis', 'Nominal']],
      body: transactions.map(t => [
        formatTgl(t.created_at),
        t.keterangan || t.pesan_asli || '-',
        t.kategori || '-',
        t.jenis,
        formatRp(t.nominal),
      ]),
      styles: { fontSize: 9, cellPadding: 3, font: 'helvetica' },
      headStyles: { fillColor: [26, 58, 92], textColor: 255, fontStyle: 'bold' },
      alternateRowStyles: { fillColor: [240, 244, 248] },
      columnStyles: {
        0: { cellWidth: 40 },
        1: { cellWidth: 80 },
        2: { cellWidth: 50 },
        3: { cellWidth: 25 },
        4: { cellWidth: 35, halign: 'right' },
      },
      didParseCell: data => {
        if (data.column.index === 3 && data.section === 'body') {
          data.cell.styles.textColor = data.cell.text[0] === 'pemasukan' ? [39, 174, 96] : [231, 76, 60]
          data.cell.styles.fontStyle = 'bold'
        }
        if (data.column.index === 4 && data.section === 'body') {
          const row = transactions[data.row.index]
          data.cell.styles.textColor = row?.jenis === 'pemasukan' ? [39, 174, 96] : [231, 76, 60]
          data.cell.styles.fontStyle = 'bold'
        }
      }
    })

    doc.save(`Keuangan_Nami_${month}_${year}.pdf`)
  }

  return (
    <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
      <button
        onClick={exportExcel}
        disabled={transactions.length === 0}
        style={{
          ...btnStyle,
          background: '#1d6f42',
          opacity: transactions.length === 0 ? 0.5 : 1,
          cursor: transactions.length === 0 ? 'not-allowed' : 'pointer'
        }}
        onMouseOver={e => { if (transactions.length > 0) e.target.style.background = '#155232' }}
        onMouseOut={e => { if (transactions.length > 0) e.target.style.background = '#1d6f42' }}
      >
        📥 Export Excel (.xlsx)
      </button>
      <button
        onClick={exportPDF}
        disabled={transactions.length === 0}
        style={{
          ...btnStyle,
          background: '#c0392b',
          opacity: transactions.length === 0 ? 0.5 : 1,
          cursor: transactions.length === 0 ? 'not-allowed' : 'pointer'
        }}
        onMouseOver={e => { if (transactions.length > 0) e.target.style.background = '#962d22' }}
        onMouseOut={e => { if (transactions.length > 0) e.target.style.background = '#c0392b' }}
      >
        📄 Export PDF
      </button>
    </div>
  )
}

const btnStyle = {
  color: 'white',
  border: 'none',
  padding: '10px 20px',
  borderRadius: 8,
  fontSize: 14,
  fontWeight: 600,
  display: 'flex',
  alignItems: 'center',
  gap: 8,
  transition: 'background 0.2s',
  boxShadow: '0 2px 6px rgba(0,0,0,0.15)'
}
