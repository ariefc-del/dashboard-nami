import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js'
import { Bar } from 'react-chartjs-2'

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend)

function formatRpShort(num) {
  if (num >= 1000000) return 'Rp' + (num / 1000000).toFixed(1) + 'jt'
  if (num >= 1000) return 'Rp' + (num / 1000).toFixed(0) + 'rb'
  return 'Rp' + num
}

export default function MonthlyChart({ data }) {
  const chartData = {
    labels: data.map(d => d.label),
    datasets: [
      {
        label: 'Pemasukan',
        data: data.map(d => d.pemasukan),
        backgroundColor: 'rgba(39, 174, 96, 0.8)',
        borderColor: '#27ae60',
        borderWidth: 1,
        borderRadius: 6,
      },
      {
        label: 'Pengeluaran',
        data: data.map(d => d.pengeluaran),
        backgroundColor: 'rgba(231, 76, 60, 0.8)',
        borderColor: '#e74c3c',
        borderWidth: 1,
        borderRadius: 6,
      },
    ],
  }

  const options = {
    responsive: true,
    maintainAspectRatio: true,
    plugins: {
      legend: {
        position: 'top',
        labels: {
          font: { size: 12, family: 'Segoe UI' },
          color: '#1a3a5c',
          padding: 16,
        },
      },
      tooltip: {
        callbacks: {
          label: ctx => ` ${ctx.dataset.label}: Rp${ctx.raw.toLocaleString('id-ID')}`,
        },
      },
    },
    scales: {
      x: {
        grid: { display: false },
        ticks: { font: { size: 11 }, color: '#7a92a8' },
      },
      y: {
        grid: { color: '#eef2f7' },
        ticks: {
          font: { size: 11 },
          color: '#7a92a8',
          callback: v => formatRpShort(v),
        },
      },
    },
  }

  return <Bar data={chartData} options={options} />
}
