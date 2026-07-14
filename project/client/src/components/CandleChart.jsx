import { useEffect, useRef } from 'react';
import { Chart } from 'chart.js/auto';
import {
  CandlestickController,
  CandlestickElement,
  OhlcController,
  OhlcElement,
} from 'chartjs-chart-financial';
import 'chartjs-adapter-date-fns';

Chart.register(CandlestickController, CandlestickElement, OhlcController, OhlcElement);

export default function CandleChart({ candles, height = 340 }) {
  const canvasRef = useRef(null);
  const chartInstanceRef = useRef(null);

  useEffect(() => {
    if (!canvasRef.current) return undefined;

    const data = candles.map((c) => ({
      x: c.time * 1000, // chart.js time scale expects milliseconds
      o: c.open,
      h: c.high,
      l: c.low,
      c: c.close,
    }));

    chartInstanceRef.current = new Chart(canvasRef.current, {
      type: 'candlestick',
      data: {
        datasets: [
          {
            label: 'Price',
            data,
            color: {
              up: '#2FBF71',
              down: '#F0546A',
              unchanged: '#7D8896',
            },
            borderColor: {
              up: '#2FBF71',
              down: '#F0546A',
              unchanged: '#7D8896',
            },
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        animation: false,
        scales: {
          x: {
            type: 'time',
            time: { unit: 'day' },
            ticks: { color: '#7D8896', font: { family: 'IBM Plex Mono', size: 11 }, maxRotation: 0 },
            grid: { color: '#1B242D' },
          },
          y: {
            ticks: { color: '#7D8896', font: { family: 'IBM Plex Mono', size: 11 } },
            grid: { color: '#1B242D' },
          },
        },
        plugins: {
          legend: { display: false },
          tooltip: {
            backgroundColor: '#1B242D',
            borderColor: '#26313B',
            borderWidth: 1,
            titleFont: { family: 'IBM Plex Mono', size: 11 },
            bodyFont: { family: 'IBM Plex Mono', size: 11 },
          },
        },
      },
    });

    return () => {
      chartInstanceRef.current?.destroy();
    };
  }, [candles]);

  return (
    <div style={{ height }}>
      <canvas ref={canvasRef} />
    </div>
  );
}
