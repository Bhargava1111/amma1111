import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  Upload, 
  Image as ImageIcon, 
  Type, 
  Settings, 
  Eye, 
  RotateCcw, 
  Save, 
  AlertCircle, 
  CheckCircle, 
  Loader2,
  X,
  Link2
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
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

const LogoManagement: React.FC = () => {
  const { user } = useAuth();
  const [logoSettings, setLogoSettings] = useState<LogoSettings | null>(null);
  const [previewSettings, setPreviewSettings] = useState<LogoSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('current');
  const [logoUrlInput, setLogoUrlInput] = useState('');
  const [validatingUrl, setValidatingUrl] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    loadLogoSettings();
  }, []);

  const loadLogoSettings = async () => {
    try {
      setLoading(true);
      const settings = await LogoService.getLogoSettings();
      const logoData = settings || LogoService.getDefaultLogo();
      setLogoSettings(logoData);
      setPreviewSettings(logoData);
      setLogoUrlInput(logoData.logo_url);
    } catch (err) {
      setError('Failed to load logo settings');
      console.error('Error loading logo settings:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !user?.ID) return;

    setUploading(true);
    setError(null);
    setSuccess(null);

    try {
      const result = await LogoService.uploadLogoImage(file, user.ID);
      
      if (result.success && result.url) {
        setLogoUrlInput(result.url);
        setPreviewSettings(prev => prev ? { ...prev, logo_url: result.url } : null);
        setSuccess('Logo image uploaded successfully!');
      } else {
        setError(result.error || 'Failed to upload logo image');
      }
    } catch (err) {
      setError('Failed to upload logo image');
      console.error('Upload error:', err);
    } finally {
      setUploading(false);
    }
  };

  const handleUrlValidation = async (url: string) => {
    if (!url) return;
    
    setValidatingUrl(true);
    try {
      const isValid = await LogoService.validateLogoUrl(url);
      if (isValid) {
        setPreviewSettings(prev => prev ? { ...prev, logo_url: url } : null);
        setError(null);
      } else {
        setError('Invalid image URL or image could not be loaded');
      }
    } catch (err) {
      setError('Failed to validate image URL');
    } finally {
      setValidatingUrl(false);
    }
  };

  const handleSave = async () => {
    if (!previewSettings || !user?.ID) return;

    setSaving(true);
    setError(null);
    setSuccess(null);

    try {
      const result = await LogoService.updateLogo({
        logo_url: previewSettings.logo_url,
        logo_text: previewSettings.logo_text,
        show_text: previewSettings.show_text,
        logo_position: previewSettings.logo_position,
        logo_size: previewSettings.logo_size,
        updated_by: user.ID
      });

      if (result.success) {
        setLogoSettings(previewSettings);
        setSuccess('Logo settings saved successfully!');
        toast.success('Logo updated successfully');
      } else {
        setError(result.error || 'Failed to save logo settings');
        toast.error('Failed to save logo settings');
      }
    } catch (err) {
      setError('Failed to save logo settings');
      console.error('Save error:', err);
      toast.error('Failed to save logo settings');
    } finally {
      setSaving(false);
    }
  };

  const handleReset = async () => {
    if (!user?.ID) return;

    setSaving(true);
    setError(null);
    setSuccess(null);

    try {
      const result = await LogoService.resetLogo(user.ID);
      
      if (result.success) {
        const defaultSettings = LogoService.getDefaultLogo();
        setLogoSettings(defaultSettings);
        setPreviewSettings(defaultSettings);
        setLogoUrlInput('');
        setSuccess('Logo reset to default successfully!');
        toast.success('Logo reset to default');
      } else {
        setError(result.error || 'Failed to reset logo');
        toast.error('Failed to reset logo');
      }
    } catch (err) {
      setError('Failed to reset logo');
      console.error('Reset error:', err);
      toast.error('Failed to reset logo');
    } finally {
      setSaving(false);
    }
  };

  const LogoPreview: React.FC<{ settings: LogoSettings; title: string }> = ({ settings, title }) => (
    <div className="border rounded-lg p-6 bg-gray-50">
      <h4 className="font-semibold text-sm text-gray-700 mb-4">{title}</h4>
      <div className={`flex items-center space-x-3 ${settings.logo_position === 'center' ? 'justify-center' : 'justify-start'}`}>
        {settings.logo_url ? (
          <img 
            src={settings.logo_url} 
            alt="Logo" 
            className={`object-contain ${
              settings.logo_size === 'small' ? 'h-8 w-8' : 
              settings.logo_size === 'medium' ? 'h-10 w-10' : 
              'h-12 w-12'
            }`}
            onError={(e) => {
              e.currentTarget.style.display = 'none';
            }}
          />
        ) : (
          <div className={`bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold ${
            settings.logo_size === 'small' ? 'h-8 w-8 text-sm' : 
            settings.logo_size === 'medium' ? 'h-10 w-10 text-base' : 
            'h-12 w-12 text-lg'
          }`}>
            <span>E</span>
          </div>
        )}
        
        {settings.show_text && (
          <span className={`font-bold text-gray-900 ${
            settings.logo_size === 'small' ? 'text-lg' : 
            settings.logo_size === 'medium' ? 'text-xl' : 
            'text-2xl'
          }`}>
            {settings.logo_text}
          </span>
        )}
      </div>
    </div>
  );

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center p-8">
          <Loader2 className="h-8 w-8 animate-spin" />
          <span className="ml-2">Loading logo settings...</span>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <ImageIcon className="h-5 w-5" />
            <span>Logo Management</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="current">Current Logo</TabsTrigger>
              <TabsTrigger value="upload">Upload Logo</TabsTrigger>
              <TabsTrigger value="settings">Settings</TabsTrigger>
            </TabsList>

            <TabsContent value="current" className="space-y-4">
              {logoSettings && (
                <LogoPreview settings={logoSettings} title="Current Logo" />
              )}
              
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <Label className="text-gray-600">Logo URL</Label>
                  <p className="text-gray-900 break-all">{logoSettings?.logo_url || 'Default logo'}</p>
                </div>
                <div>
                  <Label className="text-gray-600">Logo Text</Label>
                  <p className="text-gray-900">{logoSettings?.logo_text}</p>
                </div>
                <div>
                  <Label className="text-gray-600">Show Text</Label>
                  <Badge variant={logoSettings?.show_text ? 'default' : 'secondary'}>
                    {logoSettings?.show_text ? 'Yes' : 'No'}
                  </Badge>
                </div>
                <div>
                  <Label className="text-gray-600">Size</Label>
                  <Badge variant="outline">{logoSettings?.logo_size}</Badge>
                </div>
              </div>

              <Separator />

              <div className="flex space-x-2">
                <Button 
                  variant="outline" 
                  onClick={handleReset}
                  disabled={saving}
                  className="flex items-center space-x-2"
                >
                  <RotateCcw className="h-4 w-4" />
                  <span>Reset to Default</span>
                </Button>
              </div>
            </TabsContent>

            <TabsContent value="upload" className="space-y-4">
              <div className="space-y-4">
                <div>
                  <Label htmlFor="logo-upload" className="text-sm font-medium">
                    Upload Logo Image
                  </Label>
                  <div className="mt-2 flex items-center space-x-4">
                    <Button
                      variant="outline"
                      onClick={() => fileInputRef.current?.click()}
                      disabled={uploading}
                      className="flex items-center space-x-2"
                    >
                      {uploading ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Upload className="h-4 w-4" />
                      )}
                      <span>{uploading ? 'Uploading...' : 'Choose File'}</span>
                    </Button>
                    <span className="text-sm text-gray-500">
                      PNG, JPG, SVG up to 5MB
                    </span>
                  </div>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                </div>

                <div className="relative">
                  <Label htmlFor="logo-url" className="text-sm font-medium">
                    Or Enter Logo URL
                  </Label>
                  <div className="mt-2 flex items-center space-x-2">
                    <Input
                      id="logo-url"
                      type="url"
                      placeholder="https://example.com/logo.png"
                      value={logoUrlInput}
                      onChange={(e) => setLogoUrlInput(e.target.value)}
                      className="flex-1"
                    />
                    <Button
                      variant="outline"
                      onClick={() => handleUrlValidation(logoUrlInput)}
                      disabled={validatingUrl || !logoUrlInput}
                      size="sm"
                    >
                      {validatingUrl ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Link2 className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="settings" className="space-y-4">
              {previewSettings && (
                <div className="space-y-6">
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="logo-text">Logo Text</Label>
                      <Input
                        id="logo-text"
                        value={previewSettings.logo_text}
                        onChange={(e) => setPreviewSettings(prev => prev ? { ...prev, logo_text: e.target.value } : null)}
                        placeholder="Enter logo text"
                      />
                    </div>

                    <div className="flex items-center space-x-2">
                      <Switch
                        id="show-text"
                        checked={previewSettings.show_text}
                        onCheckedChange={(checked) => setPreviewSettings(prev => prev ? { ...prev, show_text: checked } : null)}
                      />
                      <Label htmlFor="show-text">Show logo text</Label>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="logo-position">Logo Position</Label>
                      <Select
                        value={previewSettings.logo_position}
                        onValueChange={(value: 'left' | 'center') => setPreviewSettings(prev => prev ? { ...prev, logo_position: value } : null)}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="left">Left</SelectItem>
                          <SelectItem value="center">Center</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="logo-size">Logo Size</Label>
                      <Select
                        value={previewSettings.logo_size}
                        onValueChange={(value: 'small' | 'medium' | 'large') => setPreviewSettings(prev => prev ? { ...prev, logo_size: value } : null)}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="small">Small</SelectItem>
                          <SelectItem value="medium">Medium</SelectItem>
                          <SelectItem value="large">Large</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <Separator />

                  <div className="space-y-4">
                    <h4 className="font-semibold flex items-center space-x-2">
                      <Eye className="h-4 w-4" />
                      <span>Preview</span>
                    </h4>
                    <LogoPreview settings={previewSettings} title="Preview" />
                  </div>
                </div>
              )}
            </TabsContent>
          </Tabs>

          {error && (
            <Alert className="mt-4">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {success && (
            <Alert className="mt-4">
              <CheckCircle className="h-4 w-4" />
              <AlertDescription>{success}</AlertDescription>
            </Alert>
          )}

          <div className="flex justify-between items-center mt-6 pt-4 border-t">
            <div className="text-sm text-gray-500">
              {logoSettings?.updated_at && (
                <span>Last updated: {new Date(logoSettings.updated_at).toLocaleString()}</span>
              )}
            </div>
            
            <div className="flex space-x-2">
              <Button 
                variant="outline" 
                onClick={loadLogoSettings}
                disabled={loading}
              >
                <RotateCcw className="h-4 w-4 mr-2" />
                Refresh
              </Button>
              <Button 
                onClick={handleSave}
                disabled={saving || !previewSettings}
                className="flex items-center space-x-2"
              >
                {saving ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Save className="h-4 w-4" />
                )}
                <span>Save Changes</span>
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default LogoManagement; 