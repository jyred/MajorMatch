import { Radar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  RadialLinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
  Legend,
} from 'chart.js';

ChartJS.register(
  RadialLinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
  Legend
);

interface RIASECChartProps {
  riasecScores: {
    realistic: number;
    investigative: number;
    artistic: number;
    social: number;
    enterprising: number;
    conventional: number;
  };
  className?: string;
}

export default function RIASECChart({ riasecScores, className = "" }: RIASECChartProps) {
  const data = {
    labels: [
      'Realistic (실용적)',
      'Investigative (탐구적)',
      'Artistic (예술적)',
      'Social (사회적)',
      'Enterprising (진취적)',
      'Conventional (관습적)'
    ],
    datasets: [
      {
        label: 'RIASEC 성향',
        data: [
          riasecScores.realistic,
          riasecScores.investigative,
          riasecScores.artistic,
          riasecScores.social,
          riasecScores.enterprising,
          riasecScores.conventional
        ],
        backgroundColor: 'rgba(59, 130, 246, 0.2)',
        borderColor: 'rgba(59, 130, 246, 1)',
        borderWidth: 6,
        pointBackgroundColor: 'rgba(59, 130, 246, 1)',
        pointBorderColor: '#fff',
        pointHoverBackgroundColor: '#fff',
        pointHoverBorderColor: 'rgba(59, 130, 246, 1)',
        pointRadius: 16,
        pointHoverRadius: 20,
        pointBorderWidth: 4

      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    layout: {
      padding: {
        top: 50,
        bottom: 50,
        left: 50,
        right: 50
      }
    },
    scales: {
      r: {
        beginAtZero: true,
        max: 100,
        min: 0,
        pointLabels: {
          font: {
            size: 20,
            weight: 'bold' as const
          },
          color: '#374151',
          padding: 30
        },
        ticks: {
          stepSize: 20,
          font: {
            size: 18
          },
          color: '#6B7280',
          display: true,
          backdropColor: 'rgba(255, 255, 255, 0.9)',
          backdropPadding: 8
        },
        grid: {
          color: '#D1D5DB',
          lineWidth: 3
        },
        angleLines: {
          color: '#D1D5DB',
          lineWidth: 3
        }
      }
    },
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        callbacks: {
          label: function(context: any) {
            return `${context.label}: ${context.raw}점`;
          }
        }
      }
    }
  };

  return (
    <div className={`relative w-full h-full ${className}`}>
      <Radar data={data} options={options} />
    </div>
  );
}