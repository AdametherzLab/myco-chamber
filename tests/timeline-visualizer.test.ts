import { describe, it, expect, beforeEach, afterEach } from 'bun:test';
import { TimelineVisualizer } from '../src/timeline-visualizer';
import { estimateTimeline } from '../src/timeline';
import { Chart } from 'chart.js';

// Mock canvas element
class MockCanvas {
  getContext() {
    return {
      clearRect: () => {},
      createLinearGradient: () => ({}),
      fillRect: () => {}
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
  });

  it('should destroy chart instance on destroy', () => {
    const timeline = createTestTimeline();
    visualizer.render(timeline);
    visualizer.destroy();
    expect(visualizer['chart']).toBeNull();
  });

  it('should handle phase condition tooltips', () => {
    const timeline = createTestTimeline();
    visualizer.render(timeline);
    
    const tooltipCallback = visualizer['chart']?.options?.plugins?.tooltip?.callbacks;
    const testPhase = timeline.phases[0];
    const context = { dataIndex: 0 } as any;
    
    if (tooltipCallback?.label) {
      const labels = tooltipCallback.label(context);
      expect(labels).toContain(`Temperature: ${testPhase.conditions.tempMin}-${testPhase.conditions.tempMax}°C`);
      expect(labels).toContain(testPhase.notes);
    }
  });
});
