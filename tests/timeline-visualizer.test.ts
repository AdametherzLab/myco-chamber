import { describe, it, expect, beforeEach, afterEach } from 'bun:test';
import { TimelineVisualizer } from '../src/timeline-visualizer.ts';
import { estimateTimeline } from '../src/timeline.ts';
import { Chart, registerables } from 'chart.js';
import { addDays, format } from 'date-fns';

Chart.register(...registerables);

class MockCanvas {
  getContext() {
    return {
      clearRect: () => {},
      createLinearGradient: () => ({ addColorStop: () => {} }),
      fillRect: () => {},
      measureText: () => ({ width: 10, actualBoundingBoxAscent: 10, actualBoundingBoxDescent: 2 }),
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
      scale: () => {},
      arc: () => {},
      closePath: () => {},
      fill: () => {},
      clip: () => {},
      font: '',
      fillStyle: '',
      strokeStyle: '',
      lineWidth: 1,
      textAlign: 'left',
      textBaseline: 'alphabetic',
      globalAlpha: 1,
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
    expect(title).toContain(timeline.species);
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

  it('should handle date calculations for all phases', () => {
    const timeline = createTestTimeline();
    visualizer.render(timeline);
    
    const phases = visualizer['phasesWithDates'];
    expect(phases.length).toBe(timeline.phases.length);
    expect(phases[0].startDate).toEqual(fixedDate);
    expect(phases[0].endDate).toEqual(addDays(fixedDate, timeline.phases[0].durationDays));
    
    for (let i = 1; i < phases.length; i++) {
      expect(phases[i].startDate).toEqual(phases[i-1].endDate);
    }
    
    const lastPhase = phases[phases.length - 1];
    expect(lastPhase.endDate.getTime()).toBeGreaterThan(phases[0].startDate.getTime());
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

  it('should update existing chart when update is called', () => {
    const timeline = createTestTimeline();
    visualizer.render(timeline);
    
    const newTimeline = estimateTimeline('oyster_blue');
    visualizer.update(newTimeline);
    
    const title = visualizer['chart']?.options?.plugins?.title?.text;
    expect(title).toContain(newTimeline.species);
    expect(title).not.toContain(timeline.species);
  });

  it('should maintain phase colors distinguishing fruiting from incubation', () => {
    const timeline = createTestTimeline();
    visualizer.render(timeline);
    
    const colors = visualizer['chart']?.data.datasets[0].backgroundColor as string[];
    expect(colors.length).toBe(timeline.phases.length);
    
    expect(colors[0]).toBe('#3F51B5');
    expect(colors[1]).toBe('#3F51B5');
    expect(colors[2]).toBe('#4CAF50');
    expect(colors[3]).toBe('#4CAF50');
    expect(colors[4]).toBe('#4CAF50');
  });

  it('should destroy chart instance without errors', () => {
    const timeline = createTestTimeline();
    visualizer.render(timeline);
    expect(visualizer['chart']).not.toBeNull();
    
    visualizer.destroy();
    expect(visualizer['chart']).toBeNull();
  });
});