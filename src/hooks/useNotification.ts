import { useState, useCallback } from 'react';
import type { NotificationType, NotificationPosition, NotificationAnimation, NotificationExitAnimation } from '../components/previous_components/ui/Notification';

export interface NotificationConfig {
  id?: string;
  title?: string;
  message: string | React.ReactNode;
  type?: NotificationType;
  position?: NotificationPosition;
  size?: 'sm' | 'md' | 'lg';
  showIcon?: boolean;
  showClose?: boolean;
  showProgress?: boolean;
  autoDismiss?: boolean;
  dismissTimeout?: number;
  pauseOnHover?: boolean;
  animation?: NotificationAnimation;
  exitAnimation?: NotificationExitAnimation;
  animationDuration?: number;
  className?: string;
  style?: React.CSSProperties;
  icon?: React.ReactNode;
  onShow?: () => void;
  onHide?: () => void;
  onClose?: () => void;
  onDismiss?: () => void;
}

export interface UseNotificationReturn {
  visible: boolean;
  config: NotificationConfig;
  show: (config?: Partial<NotificationConfig>) => void;
  hide: () => void;
  update: (updates: Partial<NotificationConfig>) => void;
}

export const useNotification = (initialConfig?: Partial<NotificationConfig>): UseNotificationReturn => {
  const [visible, setVisible] = useState(false);
  const [config, setConfig] = useState<NotificationConfig>({
    message: '',
    type: 'info',
    position: 'top-right',
    size: 'md',
    showIcon: true,
    showClose: true,
    showProgress: false,
    autoDismiss: false,
    dismissTimeout: 5000,
    pauseOnHover: true,
    animationDuration: 300,
    ...initialConfig
  });

  const show = useCallback((newConfig?: Partial<NotificationConfig>) => {
    if (newConfig) {
      setConfig(prev => ({ ...prev, ...newConfig }));
    }
    setVisible(true);
  }, []);

  const hide = useCallback(() => {
    setVisible(false);
  }, []);

  const update = useCallback((updates: Partial<NotificationConfig>) => {
    setConfig(prev => ({ ...prev, ...updates }));
  }, []);

  return {
    visible,
    config,
    show,
    hide,
    update
  };
};

// Convenience hooks for common notification types
export const useSuccessNotification = (initialConfig?: Partial<NotificationConfig>) => {
  return useNotification({ type: 'success', ...initialConfig });
};

export const useErrorNotification = (initialConfig?: Partial<NotificationConfig>) => {
  return useNotification({ type: 'error', ...initialConfig });
};

export const useWarningNotification = (initialConfig?: Partial<NotificationConfig>) => {
  return useNotification({ type: 'warning', ...initialConfig });
};

export const useInfoNotification = (initialConfig?: Partial<NotificationConfig>) => {
  return useNotification({ type: 'info', ...initialConfig });
};

// Auto-dismiss convenience hooks
export const useAutoDismissNotification = (initialConfig?: Partial<NotificationConfig>) => {
  return useNotification({ 
    autoDismiss: true, 
    dismissTimeout: 5000,
    ...initialConfig 
  });
};

export const useToastNotification = (initialConfig?: Partial<NotificationConfig>) => {
  return useNotification({ 
    autoDismiss: true, 
    dismissTimeout: 3000,
    position: 'bottom-right',
    size: 'sm',
    showProgress: true,
    ...initialConfig 
  });
}; 