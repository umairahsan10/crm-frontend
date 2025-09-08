import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import './Chart.css';

// Types
export type ChartType = 'line' | 'bar' | 'pie' | 'doughnut' | 'area' | 'scatter' | 'radar' | 'polar';

export interface ChartDataPoint {
  label: string;
  value: number;
  color?: string;
  metadata?: Record<string, unknown>;
  [key: string]: unknown;
}

export interface ChartDataset {
  label: string;
  data: ChartDataPoint[];
  color?: string;
  backgroundColor?: string;
  borderColor?: string;
  fill?: boolean;
  tension?: number;
  metadata?: Record<string, unknown>;
  [key: string]: unknown;
}

export interface ChartAxis {
  title?: string;
  min?: number;
  max?: number;
  step?: number;
  format?: (value: number) => string;
  gridLines?: boolean;
  ticks?: boolean;
  [key: string]: unknown;
}

export interface ChartConfig {
  type: ChartType;
  data: ChartDataset[];
  options?: {
    responsive?: boolean;
    maintainAspectRatio?: boolean;
    animation?: boolean;
    interaction?: boolean;
    plugins?: {
      legend?: boolean;
      tooltip?: boolean;
      title?: boolean;
    };
    scales?: {
      x?: ChartAxis;
      y?: ChartAxis;
    };
    [key: string]: unknown;
  };
  [key: string]: unknown;
}

// Size variants
export type ChartSize = 'sm' | 'md' | 'lg';

// Theme variants
export type ChartTheme = 'default' | 'minimal' | 'dark';

// Event types
export interface ChartEvent {
  type: 'click' | 'hover' | 'legend-click';
  datasetIndex?: number;
  dataIndex?: number;
  value?: number;
  label?: string;
  metadata?: Record<string, unknown>;
}

// Props interface
export interface ChartProps {
  // Core props
  config: ChartConfig;
  
  // Display props
  title?: string;
  subtitle?: string;
  size?: ChartSize;
  theme?: ChartTheme;
  loading?: boolean;
  error?: string | null;
  emptyMessage?: string;
  emptyIcon?: React.ReactNode;
  
  // Functionality props
  interactive?: boolean;
  showLegend?: boolean;
  showTooltip?: boolean;
  showActions?: boolean;
  autoRefresh?: boolean;
  refreshInterval?: number;
  
  // Customization props
  className?: string;
  style?: React.CSSProperties;
  height?: string | number;
  width?: string | number;
  
  // Custom render props
  renderTooltip?: (data: ChartDataPoint, dataset: ChartDataset) => React.ReactNode;
  renderLegend?: (dataset: ChartDataset, index: number) => React.ReactNode;
  renderActions?: () => React.ReactNode;
  renderEmpty?: () => React.ReactNode;
  renderLoading?: () => React.ReactNode;
  renderError?: (error: string) => React.ReactNode;
  
  // Event handlers
  onClick?: (event: ChartEvent) => void;
  onHover?: (event: ChartEvent) => void;
  onLegendClick?: (event: ChartEvent) => void;
  onDataUpdate?: (data: ChartDataset[]) => void;
  
  // Accessibility
  'aria-label'?: string;
  'aria-describedby'?: string;
  
  // Custom props
  [key: string]: unknown;
}

// Default color palette
const DEFAULT_COLORS = [
  '#3b82f6', '#ef4444', '#10b981', '#f59e0b', '#8b5cf6',
  '#06b6d4', '#84cc16', '#f97316', '#ec4899', '#6366f1'
];

// Helper functions
const getRandomColor = () => {
  return DEFAULT_COLORS[Math.floor(Math.random() * DEFAULT_COLORS.length)];
};

const formatValue = (value: number, format?: (value: number) => string) => {
  if (format) return format(value);
  return value.toLocaleString();
};

const Chart: React.FC<ChartProps> = ({
  config,
  title,
  subtitle,
  size = 'md',
  theme = 'default',
  loading = false,
  error = null,
  emptyMessage = 'No data available',
  emptyIcon = '📊',
  interactive = true,
  showLegend = true,
  showTooltip = true,
  showActions = true,
  autoRefresh = false,
  refreshInterval = 5000,
  className = '',
  style = {},
  height = '400px',
  width = '100%',
  renderTooltip,
  renderLegend,
  renderActions,
  renderEmpty,
  renderLoading,
  renderError,
  onClick,
  onHover,
  onLegendClick,
  onDataUpdate,
  'aria-label': ariaLabel,
  'aria-describedby': ariaDescribedBy,
  ...restProps
}) => {
  // State management
  const [tooltip, setTooltip] = useState<{
    visible: boolean;
    x: number;
    y: number;
    data: ChartDataPoint | null;
    dataset: ChartDataset | null;
  }>({
    visible: false,
    x: 0,
    y: 0,
    data: null,
    dataset: null
  });
  
  const [hiddenDatasets, setHiddenDatasets] = useState<Set<number>>(new Set());
  const [currentData, setCurrentData] = useState<ChartDataset[]>(config.data);
  
  // Refs
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const containerRef = useRef<HTMLDivElement>(null);
  
  // Memoized values
  const visibleDatasets = useMemo(() => {
    return currentData.filter((_, index) => !hiddenDatasets.has(index));
  }, [currentData, hiddenDatasets]);
  
  const chartColors = useMemo(() => {
    return currentData.map((dataset) => 
      dataset.color || dataset.backgroundColor || getRandomColor()
    );
  }, [currentData]);
  
  // Chart rendering logic
  const renderChart = useCallback(() => {
    if (!canvasRef.current || !visibleDatasets.length) return;
    
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Set canvas size
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * window.devicePixelRatio;
    canvas.height = rect.height * window.devicePixelRatio;
    ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
    
    // Calculate dimensions
    const padding = 40;
    const chartWidth = rect.width - padding * 2;
    const chartHeight = rect.height - padding * 2;
    
    // Find data ranges
    const allValues = visibleDatasets.flatMap(dataset => 
      dataset.data.map(point => point.value)
    );
    const minValue = Math.min(...allValues, 0);
    const maxValue = Math.max(...allValues);
    const valueRange = maxValue - minValue;
    
    // Render based on chart type
    switch (config.type) {
      case 'line':
        renderLineChart(ctx, visibleDatasets, chartWidth, chartHeight, padding, minValue, valueRange);
        break;
      case 'bar':
        renderBarChart(ctx, visibleDatasets, chartWidth, chartHeight, padding, minValue, valueRange);
        break;
      case 'pie':
        renderPieChart(ctx, visibleDatasets, chartWidth, chartHeight, padding);
        break;
      case 'doughnut':
        renderDoughnutChart(ctx, visibleDatasets, chartWidth, chartHeight, padding);
        break;
      case 'area':
        renderAreaChart(ctx, visibleDatasets, chartWidth, chartHeight, padding, minValue, valueRange);
        break;
      default:
        renderLineChart(ctx, visibleDatasets, chartWidth, chartHeight, padding, minValue, valueRange);
    }
  }, [config.type, visibleDatasets, chartColors]);
  
  // Chart type renderers
  const renderLineChart = useCallback((
    ctx: CanvasRenderingContext2D,
    datasets: ChartDataset[],
    width: number,
    height: number,
    padding: number,
    minValue: number,
    valueRange: number
  ) => {
    const labels = datasets[0]?.data.map(point => point.label) || [];
    const stepX = width / (labels.length - 1);
    
    datasets.forEach((dataset, datasetIndex) => {
      const color = chartColors[datasetIndex];
      ctx.strokeStyle = color;
      ctx.lineWidth = 2;
      ctx.beginPath();
      
      dataset.data.forEach((point, index) => {
        const x = padding + index * stepX;
        const y = padding + height - ((point.value - minValue) / valueRange) * height;
        
        if (index === 0) {
          ctx.moveTo(x, y);
        } else {
          ctx.lineTo(x, y);
        }
      });
      
      ctx.stroke();
      
      // Draw points
      ctx.fillStyle = color;
      dataset.data.forEach((point, index) => {
        const x = padding + index * stepX;
        const y = padding + height - ((point.value - minValue) / valueRange) * height;
        
        ctx.beginPath();
        ctx.arc(x, y, 4, 0, 2 * Math.PI);
        ctx.fill();
      });
    });
  }, [chartColors]);
  
  const renderBarChart = useCallback((
    ctx: CanvasRenderingContext2D,
    datasets: ChartDataset[],
    width: number,
    height: number,
    padding: number,
    minValue: number,
    valueRange: number
  ) => {
    const labels = datasets[0]?.data.map(point => point.label) || [];
    const barWidth = width / (labels.length * datasets.length);
    const stepX = width / labels.length;
    
    datasets.forEach((dataset, datasetIndex) => {
      const color = chartColors[datasetIndex];
      ctx.fillStyle = color;
      
      dataset.data.forEach((point, index) => {
        const x = padding + index * stepX + datasetIndex * barWidth;
        const barHeight = ((point.value - minValue) / valueRange) * height;
        const y = padding + height - barHeight;
        
        ctx.fillRect(x, y, barWidth - 2, barHeight);
      });
    });
  }, [chartColors]);
  
  const renderPieChart = useCallback((
    ctx: CanvasRenderingContext2D,
    datasets: ChartDataset[],
    width: number,
    height: number,
    padding: number
  ) => {
    const dataset = datasets[0];
    if (!dataset) return;
    
    const centerX = padding + width / 2;
    const centerY = padding + height / 2;
    const radius = Math.min(width, height) / 2 - 20;
    
    const total = dataset.data.reduce((sum, point) => sum + point.value, 0);
    let currentAngle = 0;
    
    dataset.data.forEach((point, index) => {
      const color = chartColors[index];
      const sliceAngle = (point.value / total) * 2 * Math.PI;
      
      ctx.fillStyle = color;
      ctx.beginPath();
      ctx.moveTo(centerX, centerY);
      ctx.arc(centerX, centerY, radius, currentAngle, currentAngle + sliceAngle);
      ctx.closePath();
      ctx.fill();
      
      currentAngle += sliceAngle;
    });
  }, [chartColors]);
  
  const renderDoughnutChart = useCallback((
    ctx: CanvasRenderingContext2D,
    datasets: ChartDataset[],
    width: number,
    height: number,
    padding: number
  ) => {
    const dataset = datasets[0];
    if (!dataset) return;
    
    const centerX = padding + width / 2;
    const centerY = padding + height / 2;
    const outerRadius = Math.min(width, height) / 2 - 20;
    const innerRadius = outerRadius * 0.6;
    
    const total = dataset.data.reduce((sum, point) => sum + point.value, 0);
    let currentAngle = 0;
    
    dataset.data.forEach((point, index) => {
      const color = chartColors[index];
      const sliceAngle = (point.value / total) * 2 * Math.PI;
      
      ctx.fillStyle = color;
      ctx.beginPath();
      ctx.arc(centerX, centerY, outerRadius, currentAngle, currentAngle + sliceAngle);
      ctx.arc(centerX, centerY, innerRadius, currentAngle + sliceAngle, currentAngle, true);
      ctx.closePath();
      ctx.fill();
      
      currentAngle += sliceAngle;
    });
  }, [chartColors]);
  
  const renderAreaChart = useCallback((
    ctx: CanvasRenderingContext2D,
    datasets: ChartDataset[],
    width: number,
    height: number,
    padding: number,
    minValue: number,
    valueRange: number
  ) => {
    const labels = datasets[0]?.data.map(point => point.label) || [];
    const stepX = width / (labels.length - 1);
    
    datasets.forEach((dataset, datasetIndex) => {
      const color = chartColors[datasetIndex];
      ctx.fillStyle = color + '40'; // Add transparency
      ctx.strokeStyle = color;
      ctx.lineWidth = 2;
      
      ctx.beginPath();
      ctx.moveTo(padding, padding + height);
      
      dataset.data.forEach((point, index) => {
        const x = padding + index * stepX;
        const y = padding + height - ((point.value - minValue) / valueRange) * height;
        
        ctx.lineTo(x, y);
      });
      
      ctx.lineTo(padding + width, padding + height);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
    });
  }, [chartColors]);
  
  // Event handlers
  const handleCanvasClick = useCallback((event: React.MouseEvent<HTMLCanvasElement>) => {
    if (!interactive || !onClick) return;
    
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const rect = canvas.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    
    // Find clicked data point
    const clickedPoint = findDataPointAtPosition(x, y);
    if (clickedPoint) {
      onClick({
        type: 'click',
        datasetIndex: clickedPoint.datasetIndex,
        dataIndex: clickedPoint.dataIndex,
        value: clickedPoint.value,
        label: clickedPoint.label,
        metadata: clickedPoint.metadata
      });
    }
  }, [interactive, onClick]);
  
  const handleCanvasMouseMove = useCallback((event: React.MouseEvent<HTMLCanvasElement>) => {
    if (!interactive || !showTooltip) return;
    
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const rect = canvas.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    
    const hoveredPoint = findDataPointAtPosition(x, y);
    if (hoveredPoint) {
      setTooltip({
        visible: true,
        x: event.clientX,
        y: event.clientY,
        data: hoveredPoint,
        dataset: currentData[hoveredPoint.datasetIndex]
      });
      
      if (onHover) {
        onHover({
          type: 'hover',
          datasetIndex: hoveredPoint.datasetIndex,
          dataIndex: hoveredPoint.dataIndex,
          value: hoveredPoint.value,
          label: hoveredPoint.label,
          metadata: hoveredPoint.metadata
        });
      }
    } else {
      setTooltip(prev => ({ ...prev, visible: false }));
    }
  }, [interactive, showTooltip, onHover, currentData]);
  
  const handleCanvasMouseLeave = useCallback(() => {
    setTooltip(prev => ({ ...prev, visible: false }));
  }, []);
  
  const handleLegendClick = useCallback((datasetIndex: number) => {
    setHiddenDatasets(prev => {
      const newSet = new Set(prev);
      if (newSet.has(datasetIndex)) {
        newSet.delete(datasetIndex);
      } else {
        newSet.add(datasetIndex);
      }
      return newSet;
    });
    
    if (onLegendClick) {
      onLegendClick({
        type: 'legend-click',
        datasetIndex,
        label: currentData[datasetIndex]?.label
      });
    }
  }, [onLegendClick, currentData]);
  
  // Helper function to find data point at position
  const findDataPointAtPosition = useCallback((x: number, y: number) => {
    // This is a simplified implementation
    // In a real chart library, this would be more sophisticated
    const padding = 40;
    const chartWidth = (canvasRef.current?.width || 0) - padding * 2;
    const chartHeight = (canvasRef.current?.height || 0) - padding * 2;
    
    if (x < padding || x > padding + chartWidth || y < padding || y > padding + chartHeight) {
      return null;
    }
    
    // For simplicity, return the first dataset's first point
    // In a real implementation, you'd calculate which point was clicked
    if (visibleDatasets[0]?.data[0]) {
      return {
        ...visibleDatasets[0].data[0],
        datasetIndex: 0,
        dataIndex: 0
      };
    }
    
    return null;
  }, [visibleDatasets]);
  
  // Effects
  useEffect(() => {
    setCurrentData(config.data);
  }, [config.data]);
  
  useEffect(() => {
    renderChart();
  }, [renderChart]);
  
  useEffect(() => {
    if (autoRefresh && refreshInterval > 0) {
      const interval = setInterval(() => {
        if (onDataUpdate) {
          onDataUpdate(currentData);
        }
      }, refreshInterval);
      
      return () => clearInterval(interval);
    }
  }, [autoRefresh, refreshInterval, onDataUpdate, currentData]);
  
  // Build CSS classes
  const cssClasses = [
    'chart',
    `chart--${size}`,
    `chart--${theme}`,
    className
  ].filter(Boolean).join(' ');
  
  // Don't render if error
  if (error) {
    return (
      <div className={cssClasses} style={{ ...style, height, width }} {...restProps}>
        {renderError ? renderError(error) : (
          <div className="chart__error">
            <div className="chart__error-icon">⚠️</div>
            <h3 className="chart__error-title">Chart Error</h3>
            <p className="chart__error-message">{error}</p>
          </div>
        )}
      </div>
    );
  }
  
  // Don't render if loading
  if (loading) {
    return (
      <div className={cssClasses} style={{ ...style, height, width }} {...restProps}>
        {renderLoading ? renderLoading() : (
          <div className="chart__loading">
            <div className="chart__loading-spinner"></div>
            Loading chart...
          </div>
        )}
      </div>
    );
  }
  
  // Don't render if no data
  if (!currentData.length || !currentData.some(dataset => dataset.data.length > 0)) {
    return (
      <div className={cssClasses} style={{ ...style, height, width }} {...restProps}>
        {renderEmpty ? renderEmpty() : (
          <div className="chart__empty">
            <div className="chart__empty-icon">{emptyIcon}</div>
            <h3 className="chart__empty-title">No Data</h3>
            <p className="chart__empty-message">{emptyMessage}</p>
          </div>
        )}
      </div>
    );
  }
  
  return (
    <div
      ref={containerRef}
      className={cssClasses}
      style={{ ...style, height, width }}
      aria-label={ariaLabel}
      aria-describedby={ariaDescribedBy}
      role="region"
      {...restProps}
    >
      {/* Header */}
      {(title || subtitle || showActions) && (
        <div className="chart__header">
          <div>
            {title && <h2 className="chart__title">{title}</h2>}
            {subtitle && <p className="chart__subtitle">{subtitle}</p>}
          </div>
          {showActions && (
            <div className="chart__actions">
              {renderActions ? renderActions() : (
                <>
                  <button
                    type="button"
                    className="chart__action"
                    onClick={() => setHiddenDatasets(new Set())}
                    aria-label="Show all datasets"
                  >
                    👁️
                  </button>
                  <button
                    type="button"
                    className="chart__action"
                    onClick={() => renderChart()}
                    aria-label="Refresh chart"
                  >
                    🔄
                  </button>
                </>
              )}
            </div>
          )}
        </div>
      )}
      
      {/* Chart content */}
      <div className="chart__content">
        <div className="chart__container">
          <canvas
            ref={canvasRef}
            className="chart__canvas"
            onClick={handleCanvasClick}
            onMouseMove={handleCanvasMouseMove}
            onMouseLeave={handleCanvasMouseLeave}
            style={{ cursor: interactive ? 'pointer' : 'default' }}
          />
          
          {/* Tooltip */}
          {tooltip.visible && tooltip.data && (
            <div
              className="chart__tooltip"
              style={{
                left: tooltip.x + 10,
                top: tooltip.y - 10,
                transform: 'translateY(-100%)'
              }}
            >
              {renderTooltip ? renderTooltip(tooltip.data, tooltip.dataset!) : (
                <>
                  <div className="chart__tooltip-title">{tooltip.data.label}</div>
                  <div className="chart__tooltip-content">
                    <span className="chart__tooltip-value">
                      {formatValue(tooltip.data.value, config.options?.scales?.y?.format)}
                    </span>
                  </div>
                </>
              )}
            </div>
          )}
        </div>
      </div>
      
      {/* Legend */}
      {showLegend && visibleDatasets.length > 0 && (
        <div className="chart__legend">
          {visibleDatasets.map((dataset, index) => (
            <div
              key={index}
              className={`chart__legend-item ${hiddenDatasets.has(index) ? 'chart__legend-item--disabled' : ''}`}
              onClick={() => handleLegendClick(index)}
              tabIndex={0}
              role="button"
              aria-label={`Toggle ${dataset.label} dataset`}
            >
              {renderLegend ? renderLegend(dataset, index) : (
                <>
                  <div
                    className="chart__legend-color"
                    style={{ backgroundColor: chartColors[index] }}
                  />
                  <span className="chart__legend-label">{dataset.label}</span>
                  <span className="chart__legend-value">
                    {formatValue(
                      dataset.data.reduce((sum, point) => sum + point.value, 0),
                      config.options?.scales?.y?.format
                    )}
                  </span>
                </>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Chart; 