import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

interface ActivityLogData {
  action_type: string;
  action_description: string;
  category: string;
  entity_id?: string;
  entity_type?: string;
  metadata?: any;
}

export const useActivityLogger = () => {
  const { user } = useAuth();

  const logActivity = async (data: ActivityLogData) => {
    if (!user) return;

    try {
      await supabase.from('activity_logs').insert({
        user_id: user.id,
        ...data,
      });
    } catch (error) {
      console.error('Error logging activity:', error);
    }
  };

  return { logActivity };
};