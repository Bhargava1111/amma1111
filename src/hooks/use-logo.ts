import { useState, useEffect } from 'react';
import LogoService from '@/services/LogoService';

interface LogoSettings {
  id?: string;
  logo_url: string;
  logo_text: string;
  show_text: boolean;
  logo_position: 'left' | 'center';
  logo_size: 'small' | 'medium' | 'large';
  updated_by: string;
  updated_at: string;
}

export const useLogo = () => {
  const [logoSettings, setLogoSettings] = useState<LogoSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadLogo = async () => {
    try {
      setLoading(true);
      setError(null);
      const settings = await LogoService.getLogoSettings();
      setLogoSettings(settings || LogoService.getDefaultLogo());
    } catch (err) {
      console.error('Error loading logo settings:', err);
      setError('Failed to load logo settings');
      setLogoSettings(LogoService.getDefaultLogo());
    } finally {
      setLoading(false);
    }
  };

  const updateLogo = async (logoData: {
    logo_url?: string;
    logo_text?: string;
    show_text?: boolean;
    logo_position?: string;
    logo_size?: string;
    updated_by: string;
  }) => {
    try {
      setError(null);
      const result = await LogoService.updateLogo(logoData);
      
      if (result.success) {
        await loadLogo(); // Reload the logo settings
        return { success: true };
      } else {
        setError(result.error || 'Failed to update logo');
        return { success: false, error: result.error };
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update logo';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    }
  };

  const resetLogo = async (userId: string) => {
    try {
      setError(null);
      const result = await LogoService.resetLogo(userId);
      
      if (result.success) {
        await loadLogo(); // Reload the logo settings
        return { success: true };
      } else {
        setError(result.error || 'Failed to reset logo');
        return { success: false, error: result.error };
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to reset logo';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    }
  };

  useEffect(() => {
    loadLogo();
  }, []);

  return {
    logoSettings,
    loading,
    error,
    loadLogo,
    updateLogo,
    resetLogo
  };
};

export default useLogo; 