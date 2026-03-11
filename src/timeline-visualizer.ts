import { Chart, registerables } from 'chart.js';
import { addDays, format } from 'date-fns';
import type { GrowTimeline, GrowPhase } from './timeline.js';

Chart.register(...registerables);

interface TimelineVisualizerOptions {
  responsive?: boolean;
  startDate?: Date;
}

export class TimelineVisualizer {
  private chart: Chart | null = null;
  private phasesWithDates: Array<GrowPhase & { startDate: Date; endDate: Date }> = [];

  constructor(
    private readonly canvas: HTMLCanvasElement,
    private options: TimelineVisualizerOptions = { responsive: true }
  ) {}

  render(timeline: GrowTimeline): void {
    this.destroy();
    const startDate = this.options.startDate ?? new Date();
    this.calculatePhasesWithDates(timeline, startDate);

    this.chart = new Chart(this.canvas, {
      type: 'bar',
      data: {
        labels: this.phasesWithDates.map(p => p.phase),
        datasets: [{
          data: this.phasesWithDates.map(p => [
            p.startDate.getTime(),
            p.endDate.getTime()
          ]),
          backgroundColor: this.phasesWithDates.map(p => 
            p.phase.toLowerCase().includes('fruiting') || 
            p.phase.toLowerCase().includes('primordia') || 
            p.phase.toLowerCase().includes('harvest') ? '#4CAF50' : '#3F51B5'
          ),
          borderWidth: 0,
          barPercentage: 0.8,
          categoryPercentage: 0.8
        }]
      },
      options: {
        responsive: this.options.responsive,
        maintainAspectRatio: false,
        indexAxis: 'y',
        scales: {
          x: {
            type: 'time',
            time: { unit: 'day', tooltipFormat: 'MMM dd' },
            title: { display: true, text: 'Date' },
            min: startDate.getTime(),
            max: this.phasesWithDates[this.phasesWithDates.length - 1].endDate.getTime()
          },
          y: { stacked: false, grid: { display: false } }
        },
        plugins: {
          legend: { display: false },
          title: {
            display: true,
            text: this.getTimelineTitle(timeline, startDate),
            font: { size: 16 }
          },
          tooltip: {
            callbacks: {
              title: (items) => items[0].label,
              label: (context) => {
                const phase = this.phasesWithDates[context.dataIndex];
                return [
                  `Duration: ${phase.durationDays} days`,
                  `${format(phase.startDate, 'MMM dd')} - ${format(phase.endDate, 'MMM dd')}`,
                  `Temp: ${phase.conditions.tempMin}-${phase.conditions.tempMax}°C`,
                  `Humidity: ${phase.conditions.humidityMin}-${phase.conditions.humidityMax}%`,
                  `CO₂: <${phase.conditions.co2Max}ppm`,
                  `FAE: >${phase.conditions.faeMin} exchanges/hr`
                ];
              }
            }
          }
        }
      }
    });
  }

  update(timeline: GrowTimeline): void {
    if (!this.chart) {
      this.render(timeline);
      return;
    }

    const startDate = this.options.startDate ?? new Date();
    this.calculatePhasesWithDates(timeline, startDate);

    this.chart.data.labels = this.phasesWithDates.map(p => p.phase);
    this.chart.data.datasets[0].data = this.phasesWithDates.map(p => [
      p.startDate.getTime(),
      p.endDate.getTime()
    ]);

    if (this.chart.options.plugins?.title) {
      this.chart.options.plugins.title.text = this.getTimelineTitle(timeline, startDate);
    }

    this.chart.update();
  }

  setStartDate(startDate: Date): void {
    this.options.startDate = startDate;
    if (this.chart) {
      this.update(this.chart.data.datasets[0].data ? this.chart.data : null);
    }
  }

  private calculatePhasesWithDates(timeline: GrowTimeline, startDate: Date): void {
    let currentDate = new Date(startDate);
    this.phasesWithDates = timeline.phases.map(phase => {
      const phaseStart = new Date(currentDate);
      const phaseEnd = addDays(phaseStart, phase.durationDays);
      currentDate = phaseEnd;
      return {
        ...phase,
        startDate: phaseStart,
        endDate: phaseEnd
      };
    });
  }

  private getTimelineTitle(timeline: GrowTimeline, startDate: Date): string {
    const harvestDate = this.phasesWithDates[this.phasesWithDates.length - 1].endDate;
    return `${timeline.species} Timeline
` +
      `Start: ${format(startDate, 'MMM dd')} | ` +
      `Harvest: ${format(harvestDate, 'MMM dd')} ` +
      `(Total: ${timeline.totalDays} days)`;
  }

  destroy(): void {
    this.chart?.destroy();
    this.chart = null;
  }
}
