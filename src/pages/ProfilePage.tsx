import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { User, Mail, Phone, MapPin, Calendar, Edit, Bell, MessageSquare, Shield, Save, Lock, Package } from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';

const ProfilePage: React.FC = () => {
  const { user, userProfile, refreshProfile } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('profile');

  // Profile form state
  const [profile, setProfile] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    birthDate: '',
    fullName: '',
    avatarUrl: ''
  });

  // Notification preferences state
  const [notifications, setNotifications] = useState({
    emailNotifications: true,
    whatsappNotifications: false,
    marketingNotifications: true
  });

  useEffect(() => {
    if (!user) {
      navigate('/auth');
      return;
    }

    // Initialize profile with user data
    setProfile({
      name: user.Name || '',
      email: user.Email || '',
      phone: userProfile?.phone_number || '',
      address: '123 Main St, City, State 12345', // Mock data
      birthDate: '1990-01-01', // Mock data
      fullName: userProfile?.full_name || user.Name || '',
      avatarUrl: userProfile?.avatar_url || ''
    });

    // Initialize notification preferences
    if (userProfile) {
      setNotifications({
        emailNotifications: userProfile.email_notifications,
        whatsappNotifications: userProfile.whatsapp_notifications,
        marketingNotifications: userProfile.marketing_notifications
      });
    }
  }, [user, userProfile, navigate]);

  const handleSave = async () => {
    setIsLoading(true);
    try {
      if (userProfile) {
        // Update existing profile
        const { error } = await window.ezsite.apis.tableUpdate(10411, {
          ID: userProfile?.ID || "",
          full_name: profile.fullName,
          phone_number: profile.phone,
          avatar_url: profile.avatarUrl,
          updated_at: new Date().toISOString()
        });

        if (error) throw new Error(error);
      } else if (user) {
        // Create new profile
        const { error } = await window.ezsite.apis.tableCreate(10411, {
          user_id: user.ID,
          full_name: profile.fullName,
          phone_number: profile.phone,
          avatar_url: profile.avatarUrl,
          auth_method: 'email',
          email_notifications: true,
          whatsapp_notifications: false,
          marketing_notifications: true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        });

        if (error) throw new Error(error);
      }

      toast({
        title: 'Success',
        description: 'Profile updated successfully!'
      });

      setIsEditing(false);
      await refreshProfile();
    } catch (error) {
      console.error('Error updating profile:', error);
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to update profile. Please try again.',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveNotifications = async () => {
    setIsLoading(true);
    try {
      if (userProfile) {
        const { error } = await window.ezsite.apis.tableUpdate(10411, {
          ID: userProfile?.ID || "",
          email_notifications: notifications.emailNotifications,
          whatsapp_notifications: notifications.whatsappNotifications,
          marketing_notifications: notifications.marketingNotifications,
          updated_at: new Date().toISOString()
        });

        if (error) throw new Error(error);

        toast({
          title: 'Success',
          description: 'Notification preferences updated successfully!'
        });

        await refreshProfile();
      }
    } catch (error) {
      console.error('Error updating notifications:', error);
      toast({
        title: 'Error',
        description: 'Failed to update notification preferences.',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    // Reset to original values
    setProfile({
      name: user?.Name || '',
      email: user?.Email || '',
      phone: userProfile?.phone_number || '',
      address: '123 Main St, City, State 12345',
      birthDate: '1990-01-01',
      fullName: userProfile?.full_name || user?.Name || '',
      avatarUrl: userProfile?.avatar_url || ''
    });
    setIsEditing(false);
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="max-w-md w-full mx-4">
          <CardContent className="p-8 text-center">
            <User className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Login Required
            </h2>
            <p className="text-gray-600 mb-6">
              Please login to view your profile
            </p>
            <Button asChild>
              <Link to="/auth">Login</Link>
            </Button>
          </CardContent>
        </Card>
      </div>);
  }

  const getAuthMethodDisplay = () => {
    if (userProfile?.auth_method === 'phone') {
      return {
        icon: Phone,
        label: 'Phone Authentication',
        value: userProfile.phone_number
      };
    }
    return {
      icon: Mail,
      label: 'Email Authentication',
      value: user.Email
    };
  };

  const authMethod = getAuthMethodDisplay();

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">My Profile</h1>
          <p className="text-gray-600 mt-2">
            Manage your account information and preferences
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Profile Picture & Basic Info */}
          <div className="lg:col-span-1">
            <Card>
              <CardContent className="p-6 text-center">
                {profile.avatarUrl ?
                <img
                  src={profile.avatarUrl}
                  alt="Profile"
                  className="w-24 h-24 rounded-full mx-auto mb-4 object-cover" /> :


                <div className="w-24 h-24 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
                    <User className="h-12 w-12 text-white" />
                  </div>
                }
                <h2 className="text-xl font-semibold mb-2">{profile.fullName || profile.name}</h2>
                <p className="text-gray-600 mb-4">{profile.email}</p>
                <div className="space-y-2 text-sm text-gray-600">
                  <div className="flex items-center justify-center gap-2">
                    <Calendar className="h-4 w-4" />
                    <span>Member since 2024</span>
                  </div>
                  <div className="flex items-center justify-center gap-2">
                    <authMethod.icon className="h-4 w-4" />
                    <span>{authMethod.value}</span>
                  </div>
                  <div className="flex items-center justify-center gap-2 mt-4">
                    <Shield className="h-4 w-4 text-blue-600" />
                    <span className="text-blue-600 font-medium">{authMethod.label}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Profile Details & Settings */}
          <div className="lg:col-span-2">
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="profile">Profile</TabsTrigger>
                <TabsTrigger value="notifications">Notifications</TabsTrigger>
                <TabsTrigger value="orders">Order History</TabsTrigger>
              </TabsList>
              
              <TabsContent value="profile" className="mt-6">
                <Card>
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle>Personal Information</CardTitle>
                        <CardDescription>
                          Update your personal details and contact information
                        </CardDescription>
                      </div>
                      <Button
                        variant={isEditing ? "outline" : "default"}
                        onClick={() => isEditing ? handleCancel() : setIsEditing(true)}>

                        {isEditing ? 'Cancel' :
                        <>
                            <Edit className="h-4 w-4 mr-2" />
                            Edit
                          </>
                        }
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="fullName">Full Name</Label>
                        <Input
                          id="fullName"
                          value={profile.fullName}
                          onChange={(e) => setProfile({ ...profile, fullName: e.target.value })}
                          disabled={!isEditing}
                          className={!isEditing ? 'bg-gray-50' : ''} />

                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="email">Email Address</Label>
                        <Input
                          id="email"
                          type="email"
                          value={profile.email}
                          disabled
                          className="bg-gray-50" />

                        <p className="text-xs text-gray-500">Email cannot be changed</p>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="phone">Phone Number</Label>
                        <Input
                          id="phone"
                          value={profile.phone}
                          onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                          disabled={!isEditing}
                          className={!isEditing ? 'bg-gray-50' : ''}
                          placeholder="+1 234 567 8900" />

                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="birthDate">Birth Date</Label>
                        <Input
                          id="birthDate"
                          type="date"
                          value={profile.birthDate}
                          onChange={(e) => setProfile({ ...profile, birthDate: e.target.value })}
                          disabled={!isEditing}
                          className={!isEditing ? 'bg-gray-50' : ''} />

                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="avatarUrl">Avatar URL</Label>
                      <Input
                        id="avatarUrl"
                        value={profile.avatarUrl}
                        onChange={(e) => setProfile({ ...profile, avatarUrl: e.target.value })}
                        disabled={!isEditing}
                        className={!isEditing ? 'bg-gray-50' : ''}
                        placeholder="https://example.com/avatar.jpg" />

                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="address">Address</Label>
                      <Input
                        id="address"
                        value={profile.address}
                        onChange={(e) => setProfile({ ...profile, address: e.target.value })}
                        disabled={!isEditing}
                        className={!isEditing ? 'bg-gray-50' : ''}
                        placeholder="Enter your full address" />

                    </div>
                    
                    {isEditing &&
                    <div className="pt-4">
                        <Separator className="mb-4" />
                        <div className="flex gap-4">
                          <Button onClick={handleSave} disabled={isLoading}>
                            {isLoading ?
                          <div className="flex items-center gap-2">
                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                Saving...
                              </div> :

                          <>
                                <Save className="h-4 w-4 mr-2" />
                                Save Changes
                              </>
                          }
                          </Button>
                          <Button variant="outline" onClick={handleCancel}>
                            Cancel
                          </Button>
                        </div>
                      </div>
                    }
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="orders" className="mt-6">
                <Card>
                  <CardContent className="p-6">
                    <p className="text-gray-600 mb-4">
                      View your order history and track your recent purchases.
                    </p>
                    <Button asChild>
                      <Link to="/orders">
                        <Package className="w-4 h-4 mr-2" />
                        View Order History
                      </Link>
                    </Button>
                  </CardContent>
                </Card>
              </TabsContent>
              
              <TabsContent value="notifications" className="mt-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Bell className="h-5 w-5" />
                      Notification Preferences
                    </CardTitle>
                    <CardDescription>
                      Choose how you want to receive notifications
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="space-y-4">
                      <div className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <Mail className="h-4 w-4 text-blue-600" />
                            <span className="font-medium">Email Notifications</span>
                          </div>
                          <p className="text-sm text-gray-600">Receive notifications via email</p>
                        </div>
                        <Switch
                          checked={notifications.emailNotifications}
                          onCheckedChange={(checked) =>
                            setNotifications({ ...notifications, emailNotifications: checked })
                          } />

                      </div>
                      
                      <div className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <MessageSquare className="h-4 w-4 text-green-600" />
                            <span className="font-medium">WhatsApp Notifications</span>
                          </div>
                          <p className="text-sm text-gray-600">Receive notifications via WhatsApp</p>
                        </div>
                        <Switch
                          checked={notifications.whatsappNotifications}
                          onCheckedChange={(checked) =>
                            setNotifications({ ...notifications, whatsappNotifications: checked })
                          } />

                      </div>
                      
                      <div className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <Bell className="h-4 w-4 text-purple-600" />
                            <span className="font-medium">Marketing Notifications</span>
                          </div>
                          <p className="text-sm text-gray-600">Receive promotional offers and marketing updates</p>
                        </div>
                        <Switch
                          checked={notifications.marketingNotifications}
                          onCheckedChange={(checked) =>
                            setNotifications({ ...notifications, marketingNotifications: checked })
                          } />

                      </div>
                    </div>
                    
                    <div className="pt-4">
                      <Separator className="mb-4" />
                      <Button onClick={handleSaveNotifications} disabled={isLoading}>
                        {isLoading ?
                          <div className="flex items-center gap-2">
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                            Saving...
                          </div> :

                          <>
                            <Save className="h-4 w-4 mr-2" />
                            Save Preferences
                          </>
                        }
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;

