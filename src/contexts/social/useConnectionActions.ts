
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/components/ui/use-toast';
import { SocialUser } from './types';
import {
  sendConnectionRequest as sendRequest,
  acceptConnectionRequest as acceptRequest,
  declineConnectionRequest as declineRequest,
  removeConnection as removeConn
} from './connection-actions';

export const useConnectionActions = (
  user: any | null, 
  setUsers: React.Dispatch<React.SetStateAction<SocialUser[]>>,
  currentUser: SocialUser | null,
  setCurrentUser: React.Dispatch<React.SetStateAction<SocialUser | null>>,
  loadUsers: () => Promise<void>
) => {
  const sendConnectionRequest = async (userId: string) => {
    return sendRequest(user, userId, setUsers, loadUsers);
  };

  const acceptConnectionRequest = async (userId: string) => {
    return acceptRequest(user, userId, setUsers, currentUser, setCurrentUser, loadUsers);
  };

  const declineConnectionRequest = async (userId: string) => {
    return declineRequest(user, userId, setUsers, loadUsers);
  };

  const removeConnection = async (userId: string) => {
    return removeConn(user, userId, setUsers, currentUser, setCurrentUser, loadUsers);
  };

  return {
    sendConnectionRequest,
    acceptConnectionRequest,
    declineConnectionRequest,
    removeConnection
  };
};
