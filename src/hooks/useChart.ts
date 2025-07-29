import { useState, useCallback, useEffect } from 'react';
import type { ChartConfig, ChartDataset, ChartDataPoint, ChartEvent } from '../components/previous_components/ui/Chart';

export interface UseChartOptions {
  initialConfig?: ChartConfig;
  autoRefresh?: boolean;
  refreshInterval?: number;
  onDataChange?: (data: ChartDataset[]) => void;
}

export interface UseChartReturn {
  config: ChartConfig;
  
  // Data operations
  updateData: (datasetIndex: number, data: ChartDataPoint[]) => void;
  addDataset: (dataset: ChartDataset) => void;
  removeDataset: (datasetIndex: number) => void;
  updateDataPoint: (datasetIndex: number, dataIndex: number, updates: Partial<ChartDataPoint>) => void;
  addDataPoint: (datasetIndex: number, dataPoint: ChartDataPoint) => void;
  removeDataPoint: (datasetIndex: number, dataIndex: number) => void;
  
  // Configuration operations
  updateConfig: (updates: Partial<ChartConfig>) => void;
  setChartType: (type: ChartConfig['type']) => void;
  setOptions: (options: ChartConfig['options']) => void;
  
  // Utility functions
  getDataset: (datasetIndex: number) => ChartDataset | undefined;
  getDataPoint: (datasetIndex: number, dataIndex: number) => ChartDataPoint | undefined;
  getTotalValue: (datasetIndex?: number) => number;
  getMaxValue: (datasetIndex?: number) => number;
  getMinValue: (datasetIndex?: number) => number;
  getAverageValue: (datasetIndex?: number) => number;
  
  // Event handlers
  handleClick: (event: ChartEvent) => void;
  handleHover: (event: ChartEvent) => void;
  handleLegendClick: (event: ChartEvent) => void;
}

export const useChart = (options: UseChartOptions = {}): UseChartReturn => {
  const { 
    initialConfig, 
    autoRefresh = false, 
    refreshInterval = 5000, 
    onDataChange 
  } = options;
  
  const [config, setConfig] = useState<ChartConfig>(initialConfig || {
    type: 'line',
    data: [],
    options: {
      responsive: true,
      animation: true,
      interaction: true,
      plugins: {
        legend: true,
        tooltip: true
      }
    }
  });

  // Helper function to update config and trigger callbacks
  const updateConfigState = useCallback((updater: (prev: ChartConfig) => ChartConfig) => {
    setConfig((prev: ChartConfig) => {
      const newConfig = updater(prev);
      if (onDataChange) {
        onDataChange(newConfig.data);
      }
      return newConfig;
    });
  }, [onDataChange]);

  // Data operations
  const updateData = useCallback((datasetIndex: number, data: ChartDataPoint[]) => {
    updateConfigState(prev => ({
      ...prev,
      data: prev.data.map((dataset: ChartDataset, index: number) =>
        index === datasetIndex ? { ...dataset, data } : dataset
      )
    }));
  }, [updateConfigState]);

  const addDataset = useCallback((dataset: ChartDataset) => {
    updateConfigState(prev => ({
      ...prev,
      data: [...prev.data, dataset]
    }));
  }, [updateConfigState]);

  const removeDataset = useCallback((datasetIndex: number) => {
    updateConfigState(prev => ({
      ...prev,
      data: prev.data.filter((_: ChartDataset, index: number) => index !== datasetIndex)
    }));
  }, [updateConfigState]);

  const updateDataPoint = useCallback((
    datasetIndex: number, 
    dataIndex: number, 
    updates: Partial<ChartDataPoint>
  ) => {
    updateConfigState(prev => ({
      ...prev,
      data: prev.data.map((dataset: ChartDataset, dsIndex: number) =>
        dsIndex === datasetIndex
          ? {
              ...dataset,
              data: dataset.data.map((point: ChartDataPoint, dpIndex: number) =>
                dpIndex === dataIndex ? { ...point, ...updates } : point
              )
            }
          : dataset
      )
    }));
  }, [updateConfigState]);

  const addDataPoint = useCallback((datasetIndex: number, dataPoint: ChartDataPoint) => {
    updateConfigState(prev => ({
      ...prev,
      data: prev.data.map((dataset: ChartDataset, index: number) =>
        index === datasetIndex
          ? { ...dataset, data: [...dataset.data, dataPoint] }
          : dataset
      )
    }));
  }, [updateConfigState]);

  const removeDataPoint = useCallback((datasetIndex: number, dataIndex: number) => {
    updateConfigState(prev => ({
      ...prev,
      data: prev.data.map((dataset: ChartDataset, dsIndex: number) =>
        dsIndex === datasetIndex
          ? {
              ...dataset,
              data: dataset.data.filter((_: ChartDataPoint, dpIndex: number) => dpIndex !== dataIndex)
            }
          : dataset
      )
    }));
  }, [updateConfigState]);

  // Configuration operations
  const updateConfig = useCallback((updates: Partial<ChartConfig>) => {
    updateConfigState(prev => ({
      ...prev,
      ...updates
    }));
  }, [updateConfigState]);

  const setChartType = useCallback((type: ChartConfig['type']) => {
    updateConfigState(prev => ({
      ...prev,
      type
    }));
  }, [updateConfigState]);

  const setOptions = useCallback((options: ChartConfig['options']) => {
    updateConfigState(prev => ({
      ...prev,
      options: { ...prev.options, ...options }
    }));
  }, [updateConfigState]);

  // Utility functions
  const getDataset = useCallback((datasetIndex: number): ChartDataset | undefined => {
    return config.data[datasetIndex];
  }, [config.data]);

  const getDataPoint = useCallback((
    datasetIndex: number, 
    dataIndex: number
  ): ChartDataPoint | undefined => {
    return config.data[datasetIndex]?.data[dataIndex];
  }, [config.data]);

  const getTotalValue = useCallback((datasetIndex?: number): number => {
    if (datasetIndex !== undefined) {
      return config.data[datasetIndex]?.data.reduce((sum: number, point: ChartDataPoint) => sum + point.value, 0) || 0;
    }
    return config.data.reduce((sum: number, dataset: ChartDataset) => 
      sum + dataset.data.reduce((dsSum: number, point: ChartDataPoint) => dsSum + point.value, 0), 0
    );
  }, [config.data]);

  const getMaxValue = useCallback((datasetIndex?: number): number => {
    if (datasetIndex !== undefined) {
      return Math.max(...(config.data[datasetIndex]?.data.map((point: ChartDataPoint) => point.value) || [0]));
    }
    return Math.max(...config.data.flatMap((dataset: ChartDataset) => dataset.data.map((point: ChartDataPoint) => point.value)));
  }, [config.data]);

  const getMinValue = useCallback((datasetIndex?: number): number => {
    if (datasetIndex !== undefined) {
      return Math.min(...(config.data[datasetIndex]?.data.map((point: ChartDataPoint) => point.value) || [0]));
    }
    return Math.min(...config.data.flatMap((dataset: ChartDataset) => dataset.data.map((point: ChartDataPoint) => point.value)));
  }, [config.data]);

  const getAverageValue = useCallback((datasetIndex?: number): number => {
    if (datasetIndex !== undefined) {
      const dataset = config.data[datasetIndex];
      if (!dataset || dataset.data.length === 0) return 0;
      return dataset.data.reduce((sum: number, point: ChartDataPoint) => sum + point.value, 0) / dataset.data.length;
    }
    const allValues = config.data.flatMap((dataset: ChartDataset) => dataset.data.map((point: ChartDataPoint) => point.value));
    if (allValues.length === 0) return 0;
    return allValues.reduce((sum: number, value: number) => sum + value, 0) / allValues.length;
  }, [config.data]);

  // Event handlers
  const handleClick = useCallback((event: ChartEvent) => {
    console.log('Chart clicked:', event);
  }, []);

  const handleHover = useCallback((event: ChartEvent) => {
    console.log('Chart hovered:', event);
  }, []);

  const handleLegendClick = useCallback((event: ChartEvent) => {
    console.log('Legend clicked:', event);
  }, []);

  // Auto-refresh effect
  useEffect(() => {
    if (autoRefresh && refreshInterval > 0) {
      const interval = setInterval(() => {
        if (onDataChange) {
          onDataChange(config.data);
        }
      }, refreshInterval);
      
      return () => clearInterval(interval);
    }
  }, [autoRefresh, refreshInterval, onDataChange, config.data]);

  return {
    config,
    
    // Data operations
    updateData,
    addDataset,
    removeDataset,
    updateDataPoint,
    addDataPoint,
    removeDataPoint,
    
    // Configuration operations
    updateConfig,
    setChartType,
    setOptions,
    
    // Utility functions
    getDataset,
    getDataPoint,
    getTotalValue,
    getMaxValue,
    getMinValue,
    getAverageValue,
    
    // Event handlers
    handleClick,
    handleHover,
    handleLegendClick
  };
};

// Convenience hooks for common chart types
export const useLineChart = (options?: UseChartOptions) => {
  const defaultConfig: ChartConfig = {
    type: 'line',
    data: [],
    options: {
      responsive: true,
      animation: true,
      interaction: true,
      plugins: {
        legend: true,
        tooltip: true
      },
      scales: {
        y: {
          title: 'Value',
          format: (value: number) => value.toLocaleString()
        }
      }
    }
  };

  return useChart({
    initialConfig: defaultConfig,
    ...options
  });
};

export const useBarChart = (options?: UseChartOptions) => {
  const defaultConfig: ChartConfig = {
    type: 'bar',
    data: [],
    options: {
      responsive: true,
      animation: true,
      interaction: true,
      plugins: {
        legend: true,
        tooltip: true
      },
      scales: {
        y: {
          title: 'Value',
          format: (value: number) => value.toLocaleString()
        }
      }
    }
  };

  return useChart({
    initialConfig: defaultConfig,
    ...options
  });
};

export const usePieChart = (options?: UseChartOptions) => {
  const defaultConfig: ChartConfig = {
    type: 'pie',
    data: [],
    options: {
      responsive: true,
      animation: true,
      interaction: true,
      plugins: {
        legend: true,
        tooltip: true
      }
    }
  };

  return useChart({
    initialConfig: defaultConfig,
    ...options
  });
};

export const useAreaChart = (options?: UseChartOptions) => {
  const defaultConfig: ChartConfig = {
    type: 'area',
    data: [],
    options: {
      responsive: true,
      animation: true,
      interaction: true,
      plugins: {
        legend: true,
        tooltip: true
      },
      scales: {
        y: {
          title: 'Value',
          format: (value: number) => value.toLocaleString()
        }
      }
    }
  };

  return useChart({
    initialConfig: defaultConfig,
    ...options
  });
}; 