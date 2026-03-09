import { Chart } from 'chart.js';
import type { GrowTimeline, GrowPhase } from './timeline.js';

export class TimelineVisualizer {
  private chart: Chart | null = null;

  constructor(
    private readonly canvas: HTMLCanvasElement,
    private options: { responsive?: boolean } = { responsive: true }
  ) {}

  /**
   * Renders an interactive timeline visualization of mushroom growth phases
   * @param timeline - Grow timeline data from estimateTimeline()
   */
  render(timeline: GrowTimeline): void {
    this.destroy(); // Clear existing chart

    const phaseData = timeline.phases.map(phase => ({
      label: phase.phase,
      duration: phase.durationDays,
      conditions: phase.conditions,
      notes: phase.notes
    }));

    this.chart = new Chart(this.canvas, {
      type: 'bar',
      data: {
        labels: phaseData.map(p => p.label),
        datasets: [{
          data: phaseData.map(p => p.duration),
          backgroundColor: phaseData.map(p => 
            p.label.toLowerCase().includes('fruiting') ? '#4CAF50' : '#3F51B5'
          ),
          borderWidth: 0
        }]
      },
      options: {
        responsive: this.options.responsive,
        indexAxis: 'y',
        scales: {
          x: {
            title: { display: true, text: 'Days' },
            stacked: true
          },
          y: {
            stacked: true
          }
        },
        plugins: {
          tooltip: {
            callbacks: {
              title: (items) => items[0].label,
              label: (context) => {
                const phase = phaseData[context.dataIndex];
                return [
                  `Duration: ${phase.duration} days`,
                  `Temperature: ${phase.conditions.tempMin}-${phase.conditions.tempMax}°C`,
                  `Humidity: ${phase.conditions.humidityMin}-${phase.conditions.humidityMax}%`,
                  `CO₂: <${phase.conditions.co2Max}ppm`,
                  phase.notes
                ];
              }
            }
          }
        }
      }
    });
  }

  /**
   * Updates the timeline visualization with new data
   * @param timeline - Updated grow timeline data
   */
  update(timeline: GrowTimeline): void {
    if (!this.chart) {
      this.render(timeline);
      return;
    }
    
    const phaseData = timeline.phases.map(phase => ({
      label: phase.phase,
      duration: phase.durationDays,
      conditions: phase.conditions,
      notes: phase.notes
    }));

    this.chart.data.labels = phaseData.map(p => p.label);
    this.chart.data.datasets[0].data = phaseData.map(p => p.duration);
    this.chart.data.datasets[0].backgroundColor = phaseData.map(p =>
      p.label.toLowerCase().includes('fruiting') ? '#4CAF50' : '#3F51B5'
    );
    this.chart.update();
  }

  /** Destroys the chart instance and cleans up resources */
  destroy(): void {
    this.chart?.destroy();
    this.chart = null;
  }
}
