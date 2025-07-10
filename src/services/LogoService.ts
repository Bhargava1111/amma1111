import { env } from '@/config/env';

interface LogoData {
  id?: string;
  logo_url: string;
  logo_text: string;
  updated_by: string;
  updated_at: string;
  is_active: boolean;
}

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

export class LogoService {
  private static readonly LOGO_TABLE_ID = env.TABLES.LOGO_SETTINGS || '10424';

  // Get current logo settings
  static async getLogoSettings(): Promise<LogoSettings | null> {
    try {
      const { data, error } = await window.ezsite.apis.tablePage(this.LOGO_TABLE_ID, {
        PageNo: 1,
        PageSize: 1,
        Filters: [{ name: 'is_active', op: 'Equal', value: true }],
        OrderBy: 'updated_at DESC'
      });

      if (error) {
        console.error('Error fetching logo settings:', error);
        // Return default logo settings if table doesn't exist yet
        return this.getDefaultLogo();
      }

      return data?.List?.[0] || this.getDefaultLogo();
    } catch (error) {
      console.error('Error in getLogoSettings:', error);
      // Return default logo settings on any error
      return this.getDefaultLogo();
    }
  }

  // Update logo settings
  static async updateLogo(logoData: {
    logo_url?: string;
    logo_text?: string;
    show_text?: boolean;
    logo_position?: string;
    logo_size?: string;
    updated_by: string;
  }): Promise<{ success: boolean; error?: string }> {
    try {
      // First, get current settings
      const currentLogo = await this.getLogoSettings();
      
      const updateData = {
        logo_url: logoData.logo_url || currentLogo?.logo_url || '',
        logo_text: logoData.logo_text || currentLogo?.logo_text || 'MANAfoods',
        show_text: logoData.show_text !== undefined ? logoData.show_text : (currentLogo?.show_text ?? true),
        logo_position: logoData.logo_position || currentLogo?.logo_position || 'left',
        logo_size: logoData.logo_size || currentLogo?.logo_size || 'medium',
        updated_by: logoData.updated_by,
        updated_at: new Date().toISOString(),
        is_active: true
      };

      let result;
      
      if (currentLogo?.id) {
        // Update existing logo settings
        result = await window.ezsite.apis.tableUpdate(this.LOGO_TABLE_ID, {
          id: currentLogo.id,
          ...updateData
        });
      } else {
        // Create new logo settings
        result = await window.ezsite.apis.tableCreate(this.LOGO_TABLE_ID, updateData);
      }

      if (result.error) {
        throw new Error(result.error);
      }

      return { success: true };
    } catch (error) {
      console.error('Error updating logo:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to update logo'
      };
    }
  }

  // Upload logo image
  static async uploadLogoImage(file: File, userId: string): Promise<{ success: boolean; url?: string; error?: string }> {
    try {
      // Validate file
      if (!file.type.startsWith('image/')) {
        return { success: false, error: 'Please select a valid image file' };
      }

      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        return { success: false, error: 'Image size must be less than 5MB' };
      }

      // Convert file to base64 for upload
      const base64 = await this.fileToBase64(file);
      
      // Upload to your preferred service (this example uses a generic upload endpoint)
      const uploadData = {
        file: base64,
        filename: `logo_${Date.now()}_${file.name}`,
        content_type: file.type,
        folder: 'logos',
        uploaded_by: userId
      };

      // Use your file upload service or API
      const response = await fetch('/api/upload', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(uploadData)
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Upload failed');
      }

      return { 
        success: true, 
        url: result.url || result.file_url 
      };
    } catch (error) {
      console.error('Error uploading logo:', error);
      
      // Fallback: Use a placeholder service or return a data URL
      try {
        const dataUrl = await this.fileToBase64(file);
        return { 
          success: true, 
          url: dataUrl 
        };
      } catch (fallbackError) {
        return { 
          success: false, 
          error: error instanceof Error ? error.message : 'Failed to upload logo'
        };
      }
    }
  }

  // Convert file to base64
  private static fileToBase64(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = error => reject(error);
    });
  }

  // Delete logo (reset to default)
  static async resetLogo(userId: string): Promise<{ success: boolean; error?: string }> {
    try {
      const defaultSettings = {
        logo_url: '',
        logo_text: 'MANAfoods',
        show_text: true,
        logo_position: 'left',
        logo_size: 'medium',
        updated_by: userId,
        updated_at: new Date().toISOString(),
        is_active: true
      };

      const currentLogo = await this.getLogoSettings();
      
      let result;
      if (currentLogo?.id) {
        result = await window.ezsite.apis.tableUpdate(this.LOGO_TABLE_ID, {
          id: currentLogo.id,
          ...defaultSettings
        });
      } else {
        result = await window.ezsite.apis.tableCreate(this.LOGO_TABLE_ID, defaultSettings);
      }

      if (result.error) {
        throw new Error(result.error);
      }

      return { success: true };
    } catch (error) {
      console.error('Error resetting logo:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to reset logo'
      };
    }
  }

  // Validate logo URL
  static async validateLogoUrl(url: string): Promise<boolean> {
    try {
      return new Promise((resolve) => {
        const img = new Image();
        img.onload = () => resolve(true);
        img.onerror = () => resolve(false);
        img.src = url;
      });
    } catch {
      return false;
    }
  }

  // Get default logo settings
  static getDefaultLogo(): LogoSettings {
    return {
      logo_url: '',
      logo_text: 'MANAfoods',
      show_text: true,
      logo_position: 'left',
      logo_size: 'medium',
      updated_by: 'system',
      updated_at: new Date().toISOString()
    };
  }

  // Preview logo with settings
  static previewLogo(settings: Partial<LogoSettings>): string {
    const { logo_url, logo_text, show_text, logo_size } = settings;
    
    if (logo_url) {
      return logo_url;
    }
    
    // Generate a preview URL or return placeholder
    return '/placeholder-logo.png';
  }
}

export default LogoService; 