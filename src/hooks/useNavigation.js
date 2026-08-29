import { useState, useCallback } from 'react';
import { MODULES } from '../utils/constants.js';

export function useNavigation(initialModule = MODULES.DASHBOARD) {
  const [activeModule, setActiveModule] = useState(initialModule);
  const [activeClient, setActiveClient] = useState('all');

  const navigateTo = useCallback((moduleId) => {
    setActiveModule(moduleId);
  }, []);

  return {
    activeModule,
    navigateTo,
    activeClient,
    setActiveClient,
  };
}
