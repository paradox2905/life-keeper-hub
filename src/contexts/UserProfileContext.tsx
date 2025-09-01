import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { supabase } from '@/integrations/supabase/client';

interface UserProfile {
  displayName: string;
  email: string;
}

interface UserProfileContextType {
  profile: UserProfile | null;
  updateDisplayName: (newName: string) => Promise<void>;
  loading: boolean;
}

const UserProfileContext = createContext<UserProfileContextType>({
  profile: null,
  updateDisplayName: async () => {},
  loading: true,
});

export const useUserProfile = () => {
  const context = useContext(UserProfileContext);
  if (!context) {
    throw new Error('useUserProfile must be used within a UserProfileProvider');
  }
  return context;
};

export const UserProfileProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      const displayName = user.user_metadata?.full_name || user.email?.split('@')[0] || '';
      setProfile({
        displayName,
        email: user.email || '',
      });
    } else {
      setProfile(null);
    }
    setLoading(false);
  }, [user]);

  const updateDisplayName = async (newName: string) => {
    if (!user) return;

    try {
      const { error } = await supabase.auth.updateUser({
        data: {
          full_name: newName
        }
      });

      if (error) throw error;

      setProfile(prev => prev ? { ...prev, displayName: newName } : null);
    } catch (error) {
      throw error;
    }
  };

  return (
    <UserProfileContext.Provider value={{ profile, updateDisplayName, loading }}>
      {children}
    </UserProfileContext.Provider>
  );
};