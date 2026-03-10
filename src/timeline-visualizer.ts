import { Chart, registerables } from 'chart.js';
import type { GrowTimeline, GrowPhase } from './timeline.js';

// Register all Chart.js components
Chart.register(...registerables);

/**
 * Manages the visualization of a mushroom grow timeline using Chart.js.
 */
export class TimelineVisualizer {
  private chart: Chart | null = null;

  /**
   * Creates an instance of TimelineVisualizer.
   * @param canvas - The HTMLCanvasElement to render the chart on.
   * @param options - Configuration options for the visualizer.
   * @param options.responsive - Whether the chart should be responsive (default: true).
   */
  constructor(
    private readonly canvas: HTMLCanvasElement,
    private options: { responsive?: boolean } = { responsive: true }
  ) {}

  /**
   * Renders an interactive timeline visualization of mushroom growth phases.
   * If a chart already exists, it will be destroyed and re-rendered.
   * @param timeline - Grow timeline data from estimateTimeline().
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
            p.label.toLowerCase().includes('fruiting') || p.label.toLowerCase().includes('primordia') || p.label.toLowerCase().includes('harvest') ? '#4CAF50' : '#3F51B5'
          ),
          borderWidth: 0,
          barPercentage: 0.8, // Adjust bar width
          categoryPercentage: 0.8 // Adjust space between bars
        }]
      },
      options: {
        responsive: this.options.responsive,
        maintainAspectRatio: false, // Allow canvas to resize freely
        indexAxis: 'y', // Horizontal bars
        scales: {
          x: {
            title: { display: true, text: 'Days' },
            stacked: false, // Not stacked for individual phase durations
            beginAtZero: true,
            ticks: { stepSize: 1 }
          },
          y: {
            stacked: false,
            grid: { display: false } // Hide y-axis grid lines
          }
        },
        plugins: {
          legend: { display: false }, // No legend needed for single dataset
          title: {
            display: true,
            text: `${timeline.species} Grow Timeline (Total: ${timeline.totalDays} days)`,
            font: { size: 16 }
          },
          tooltip: {
            callbacks: {
              title: (items) => items[0].label,
              label: (context) => {
                const phase = phaseData[context.dataIndex];
                const labels = [
                  `Duration: ${phase.duration} days`,
                  `Temp: ${phase.conditions.tempMin}-${phase.conditions.tempMax}°C`,
                  `Humidity: ${phase.conditions.humidityMin}-${phase.conditions.humidityMax}%`,
                  `CO₂: <${phase.conditions.co2Max}ppm`,
                  `FAE: >${phase.conditions.faeMin} exchanges/hr`,
                ];
                if (phase.notes) {
                  labels.push(`Notes: ${phase.notes}`);
                }
                return labels;
              }
            }
          }
        }
      }
    });
  }

  /**
   * Updates the timeline visualization with new data.
   * If no chart exists, it will call render() to create one.
   * @param timeline - Updated grow timeline data.
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
      p.label.toLowerCase().includes('fruiting') || p.label.toLowerCase().includes('primordia') || p.label.toLowerCase().includes('harvest') ? '#4CAF50' : '#3F51B5'
    );
    
    if (this.chart.options.plugins?.title) {
      this.chart.options.plugins.title.text = `${timeline.species} Grow Timeline (Total: ${timeline.totalDays} days)`;
    }

    this.chart.update();
  }

  /** Destroys the chart instance and cleans up resources. */
  destroy(): void {
    this.chart?.destroy();
    this.chart = null;
  }
}
