import { User, UserProfile } from '../contexts/AuthContext';

const USERS_TABLE_ID = '10411'; // Assuming this is the table for user profiles

export class UserService {
  static async getAllUsers(params?: { pageNo?: number; pageSize?: number; search?: string; role?: string }) {
    try {
      if (!window.ezsite || !window.ezsite.apis) {
        throw new Error('API client not initialized. Please refresh the page.');
      }
      const { pageNo = 1, pageSize = 20, search, role } = params || {};
      const filters: any[] = [];

      if (search) {
        filters.push({
          name: 'full_name',
          op: 'Like',
          value: `%${search}%`
        });
      }
      if (role && role !== 'all') {
        if (role === 'admin') {
          filters.push({
            name: 'email',
            op: 'Like',
            value: '%admin%'
          });
        } else if (role === 'customer') {
          filters.push({
            name: 'email',
            op: 'NotLike',
            value: '%admin%'
          });
        }
      }

      console.log(`UserService: Fetching all users from table ${USERS_TABLE_ID} with filters:`, filters);
      const response = await window.ezsite.apis.tablePage(USERS_TABLE_ID, {
        PageNo: pageNo,
        PageSize: pageSize,
        OrderByField: 'ID',
        IsAsc: false,
        Filters: filters
      });

      // Check if response is valid
      if (!response || typeof response !== 'object') {
        throw new Error('Invalid response from server');
      }

      // Check for error in response
      if (response.error) {
        throw new Error(response.error);
      }

      const { data } = response;
      if (!data || !Array.isArray(data.List)) {
        throw new Error('Invalid data format received from server');
      }

      // Augment user profiles with role information
      const usersWithRoles = data.List.map((profile: UserProfile & { Email?: string; ID?: string }) => {
        const isAdmin = profile.Email === 'admin@example.com' || (profile.Email && profile.Email.includes('admin')) || profile.user_id === '1';
        return {
          ...profile,
          ID: profile.user_id,
          Email: profile.Email || `${profile.phone_number}@phone.user`,
          Name: profile.full_name,
          role: isAdmin ? 'admin' : 'customer'
        };
      });

      return {
        users: usersWithRoles,
        totalCount: data.VirtualCount || 0,
        currentPage: pageNo,
        totalPages: Math.ceil((data.VirtualCount || 0) / pageSize)
      };
    } catch (error) {
      console.error('Error fetching all users:', error);
      throw error;
    }
  }

  static async getUserById(userId: string) {
    try {
      if (!window.ezsite || !window.ezsite.apis) {
        console.error('UserService: window.ezsite.apis is not defined. Cannot get user by ID.');
        throw new Error('API not available');
      }
      console.log(`UserService: Fetching user by ID ${userId} from table ${USERS_TABLE_ID}`);
      const { data, error } = await window.ezsite.apis.tablePage(USERS_TABLE_ID, {
        PageNo: 1,
        PageSize: 1,
        Filters: [{ name: 'user_id', op: 'Equal', value: userId }]
      });

      if (error) {
        console.error(`UserService: Error fetching user by ID ${userId}:`, error);
        throw new Error(error);
      }
      console.log(`UserService: Successfully fetched user by ID ${userId}:`, data);

      const profile: UserProfile & { Email?: string; ID?: string } = data?.List?.[0];
      if (!profile) throw new Error('User not found');

      const isAdmin = profile.Email === 'admin@example.com' || (profile.Email && profile.Email.includes('admin')) || profile.user_id === '1';

      return {
        ...profile,
        ID: profile.user_id,
        Email: profile.Email || `${profile.phone_number}@phone.user`,
        Name: profile.full_name,
        role: isAdmin ? 'admin' : 'customer'
      };
    } catch (error) {
      console.error('Error fetching user by ID:', error);
      throw error;
    }
  }

  static async createUser(userData: {
    email: string;
    password?: string;
    name: string;
    role: 'customer' | 'admin';
    phoneNumber?: string;
  }) {
    try {
      if (!window.ezsite || !window.ezsite.apis) {
        console.error('UserService: window.ezsite.apis is not defined. Cannot create user.');
        throw new Error('API not available');
      }
      // For simplicity, we'll assume direct creation via ezsite.apis.tableCreate for user profiles.
      // In a real scenario, this might involve a dedicated admin API for user creation
      // or using the existing register function if it supports admin-level creation.

      const userId = `user_${Date.now()}`;
      const profileData: any = {
        user_id: userId,
        full_name: userData.name,
        email: userData.email, // Assuming email can be stored directly
        phone_number: userData.phoneNumber || '',
        auth_method: userData.password ? 'email' : (userData.phoneNumber ? 'phone' : 'unknown'),
        email_notifications: true,
        whatsapp_notifications: true,
        marketing_notifications: true,
        avatar_url: '',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      console.log(`UserService: Creating user in table ${USERS_TABLE_ID} with data:`, profileData);
      const { error } = await window.ezsite.apis.tableCreate(USERS_TABLE_ID, profileData);
      if (error) {
        console.error('UserService: Error creating user:', error);
        throw new Error(error);
      }
      console.log('UserService: User created successfully.');

      // If a password is provided, we might need to call a separate registration API
      // or handle it differently if ezsite.apis.tableCreate doesn't handle authentication credentials.
      // For now, we'll assume the profile creation is sufficient for admin purposes.

      return { success: true, userId };
    } catch (error) {
      console.error('Error creating user:', error);
      throw error;
    }
  }

  static async updateUser(userId: string, updateData: Partial<UserProfile & { email?: string; name?: string; role?: 'customer' | 'admin' }>) {
    try {
      if (!window.ezsite || !window.ezsite.apis) {
        console.error('UserService: window.ezsite.apis is not defined. Cannot update user.');
        throw new Error('API not available');
      }
      const currentProfile = await this.getUserById(userId);

      const updatedProfileData: any = {
        ID: currentProfile.ID, // Use the actual ID from the fetched profile
        full_name: updateData.name || currentProfile.full_name,
        email: updateData.email || currentProfile.Email,
        phone_number: updateData.phone_number || currentProfile.phone_number,
        email_notifications: updateData.email_notifications ?? currentProfile.email_notifications,
        whatsapp_notifications: updateData.whatsapp_notifications ?? currentProfile.whatsapp_notifications,
        marketing_notifications: updateData.marketing_notifications ?? currentProfile.marketing_notifications,
        avatar_url: updateData.avatar_url || currentProfile.avatar_url,
        updated_at: new Date().toISOString()
      };

      // Handle role update if applicable. This might require a separate API call
      // or a specific field in the user profile table.
      // For now, we'll assume role is derived from email/ID and not directly stored.
      // If a direct role field is added to table 10411, this logic would change.

      console.log(`UserService: Updating user ${userId} in table ${USERS_TABLE_ID} with data:`, updatedProfileData);
      const { error } = await window.ezsite.apis.tableUpdate(USERS_TABLE_ID, updatedProfileData);
      if (error) {
        console.error('UserService: Error updating user:', error);
        throw new Error(error);
      }
      console.log(`UserService: User ${userId} updated successfully.`);

      return { success: true };
    } catch (error) {
      console.error('Error updating user:', error);
      throw error;
    }
  }

  static async deleteUser(userId: string) {
    try {
      if (!window.ezsite || !window.ezsite.apis) {
        console.error('UserService: window.ezsite.apis is not defined. Cannot delete user.');
        throw new Error('API not available');
      }
      // In a real application, deleting a user might involve more complex logic
      // like deleting associated data (orders, notifications, etc.) or soft-deleting.
      // For this task, we'll assume a direct deletion from the user profile table.
      console.log(`UserService: Deleting user ${userId} from table ${USERS_TABLE_ID}`);
      const { error } = await window.ezsite.apis.tableDelete(USERS_TABLE_ID, userId);
      if (error) {
        console.error('UserService: Error deleting user:', error);
        throw new Error(error);
      }
      console.log(`UserService: User ${userId} deleted successfully.`);

      return { success: true };
    } catch (error) {
      console.error('Error deleting user:', error);
      throw error;
    }
  }
}
