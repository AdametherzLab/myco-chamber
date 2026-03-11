import { describe, it, expect, beforeEach, afterEach } from 'bun:test';
import { TimelineVisualizer } from '../src/timeline-visualizer';
import { estimateTimeline } from '../src/timeline';
import { Chart, registerables } from 'chart.js';
import { addDays, format } from 'date-fns';

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
  const fixedDate = new Date('2024-01-01');
  
  beforeEach(() => {
    canvas = new MockCanvas() as unknown as HTMLCanvasElement;
    visualizer = new TimelineVisualizer(canvas, { startDate: fixedDate });
  });

  afterEach(() => {
    visualizer.destroy();
  });

  function createTestTimeline() {
    return estimateTimeline('shiitake');
  }

  it('should initialize chart with correct date ranges', () => {
    const timeline = createTestTimeline();
    visualizer.render(timeline);
    
    const expectedEndDate = addDays(fixedDate, timeline.totalDays);
    const title = visualizer['chart']?.options?.plugins?.title?.text;
    expect(title).toContain(format(fixedDate, 'MMM dd'));
    expect(title).toContain(format(expectedEndDate, 'MMM dd'));
  });

  it('should update phases when start date changes', () => {
    const timeline = createTestTimeline();
    visualizer.render(timeline);
    
    const newStartDate = new Date('2024-02-01');
    visualizer.setStartDate(newStartDate);
    
    const expectedEndDate = addDays(newStartDate, timeline.totalDays);
    const title = visualizer['chart']?.options?.plugins?.title?.text;
    expect(title).toContain(format(newStartDate, 'MMM dd'));
    expect(title).toContain(format(expectedEndDate, 'MMM dd'));
  });

  it('should handle date calculations for phases', () => {
    const timeline = createTestTimeline();
    visualizer.render(timeline);
    
    const phases = visualizer['phasesWithDates'];
    expect(phases[0].startDate).toEqual(fixedDate);
    expect(phases[0].endDate).toEqual(addDays(fixedDate, 1));
    
    const lastPhase = phases[phases.length - 1];
    expect(lastPhase.endDate.getTime())
      .toBeGreaterThan(phases[0].startDate.getTime());
  });

  it('should display correct tooltip dates', () => {
    const timeline = createTestTimeline();
    visualizer.render(timeline);
    
    const tooltipCallbacks = visualizer['chart']?.options?.plugins?.tooltip?.callbacks;
    const context = { dataIndex: 0, dataset: { data: [] } } as any;
    
    if (tooltipCallbacks?.label) {
      const labels = tooltipCallbacks.label(context);
      expect(labels[1]).toBe('Jan 01 - Jan 02');
    }
  });

  it('should maintain phase colors during updates', () => {
    const timeline = createTestTimeline();
    visualizer.render(timeline);
    
    const originalColors = visualizer['chart']?.data.datasets[0].backgroundColor;
    const newTimeline = { ...timeline, phases: timeline.phases.map(p => p) };
    visualizer.update(newTimeline);
    
    expect(visualizer['chart']?.data.datasets[0].backgroundColor)
      .toEqual(originalColors);
  });
});
