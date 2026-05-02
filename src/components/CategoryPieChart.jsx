import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js'
import { Doughnut } from 'react-chartjs-2'

ChartJS.register(ArcElement, Tooltip, Legend)

const COLORS = [
  '#1a3a5c', '#f4a623', '#27ae60', '#e74c3c', '#8e44ad',
  '#2980b9', '#e67e22', '#16a085', '#d35400', '#2c3e50',
  '#c0392b', '#7f8c8d'
]

export default function CategoryPieChart({ data }) {
  const labels = Object.keys(data)
  const values = Object.values(data)
  const total = values.reduce((s, v) => s + v, 0)

  const chartData = {
    labels,
    datasets: [{
      data: values,
      backgroundColor: COLORS.slice(0, labels.length),
      borderColor: 'white',
      borderWidth: 2,
      hoverOffset: 8,
    }],
  }

  const options = {
    responsive: true,
    maintainAspectRatio: true,
    cutout: '55%',
    plugins: {
      legend: {
        position: 'right',
        labels: {
          font: { size: 11, family: 'Segoe UI' },
          color: '#1a3a5c',
          padding: 10,
          boxWidth: 14,
          generateLabels: chart => {
            const datasets = chart.data.datasets
            return chart.data.labels.map((label, i) => ({
              text: `${label} (${Math.round((datasets[0].data[i] / total) * 100)}%)`,
              fillStyle: datasets[0].backgroundColor[i],
              strokeStyle: 'white',
              lineWidth: 2,
              index: i,
              hidden: false,
            }))
          }
        },
      },
      tooltip: {
        callbacks: {
          label: ctx => ` Rp${ctx.raw.toLocaleString('id-ID')} (${Math.round((ctx.raw / total) * 100)}%)`,
        },
      },
    },
  }

  return <Doughnut data={chartData} options={options} />
}
