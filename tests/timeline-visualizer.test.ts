import { describe, it, expect, beforeEach, afterEach } from 'bun:test';
import { TimelineVisualizer } from '../src/timeline-visualizer';
import { estimateTimeline } from '../src/timeline';
import { Chart, registerables } from 'chart.js';

Chart.register(...registerables);

class MockCanvas {
  getContext() {
    return {
      clearRect: () => {},
      createLinearGradient: () => ({}),
      fillRect: () => {},
      measureText: () => ({ width: 10 }),
      fillText: () => {},
      strokeRect: () => {},
      beginPath: () => {},
      moveTo: () => {},
      lineTo: () => {},
      stroke: () => {},
      save: () => {},
      restore: () => {},
      translate: () => {},
      rotate: () => {},
      font: '',
      fillStyle: '',
      strokeStyle: '',
      lineWidth: 1,
    };
  }
}

describe('TimelineVisualizer', () => {
  let canvas: HTMLCanvasElement;
  let visualizer: TimelineVisualizer;
  
  beforeEach(() => {
    canvas = new MockCanvas() as unknown as HTMLCanvasElement;
    visualizer = new TimelineVisualizer(canvas);
  });

  afterEach(() => {
    visualizer.destroy();
  });

  function createTestTimeline() {
    return estimateTimeline('shiitake');
  }

  it('should initialize chart on render', () => {
    const timeline = createTestTimeline();
    visualizer.render(timeline);
    expect(visualizer['chart']).toBeInstanceOf(Chart);
    expect(visualizer['chart']?.data.labels?.length).toBe(timeline.phases.length);
    expect(visualizer['chart']?.data.datasets[0].data.length).toBe(timeline.phases.length);
  });

  it('should update chart data when timeline changes', () => {
    const timeline = createTestTimeline();
    visualizer.render(timeline);
    
    const newTimeline = {
      ...timeline,
      phases: timeline.phases.map(p => ({ ...p, durationDays: p.durationDays + 1 }))
    };
    
    visualizer.update(newTimeline);
    const chartData = visualizer['chart']?.data.datasets[0].data;
    expect(chartData).toEqual(newTimeline.phases.map(p => p.durationDays));
    expect(visualizer['chart']?.options?.plugins?.title?.text).toContain(`Total: ${newTimeline.totalDays + newTimeline.phases.length} days`);
  });

  it('should destroy chart instance on destroy', () => {
    const timeline = createTestTimeline();
    visualizer.render(timeline);
    const chartInstance = visualizer['chart'];
    expect(chartInstance).not.toBeNull();
    visualizer.destroy();
    expect(visualizer['chart']).toBeNull();
  });

  it('should handle phase condition tooltips correctly', () => {
    const timeline = createTestTimeline();
    visualizer.render(timeline);
    
    const tooltipCallbacks = visualizer['chart']?.options?.plugins?.tooltip?.callbacks;
    expect(tooltipCallbacks).toBeDefined();
    
    const testPhase = timeline.phases[0];
    const context = { dataIndex: 0, dataset: { data: [testPhase.durationDays] } } as any;
    
    if (tooltipCallbacks?.label) {
      const labels = tooltipCallbacks.label(context);
      expect(labels).toContain(`Duration: ${testPhase.durationDays} days`);
      expect(labels).toContain(`Temp: ${testPhase.conditions.tempMin}-${testPhase.conditions.tempMax}°C`);
    }
  });

  it('should apply correct background colors based on phase type', () => {
    const timeline = createTestTimeline();
    visualizer.render(timeline);

    const backgroundColors = visualizer['chart']?.data.datasets[0].backgroundColor as string[];
    expect(backgroundColors[0]).toBe('#3F51B5');
    expect(backgroundColors[2]).toBe('#4CAF50');
  });

  it('should respect responsive configuration option', () => {
    const nonResponsiveVisualizer = new TimelineVisualizer(canvas, { responsive: false });
    const timeline = createTestTimeline();
    nonResponsiveVisualizer.render(timeline);
    expect(nonResponsiveVisualizer['chart']?.options.responsive).toBe(false);
  });

  it('should maintain chart aspect ratio when configured', () => {
    const aspectRatioVisualizer = new TimelineVisualizer(canvas, { responsive: true });
    const timeline = createTestTimeline();
    aspectRatioVisualizer.render(timeline);
    expect(aspectRatioVisualizer['chart']?.options.maintainAspectRatio).toBe(false);
  });
});