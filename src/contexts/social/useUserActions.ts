
import { useState } from 'react';
import { useUserLoading } from './useUserLoading';
import { useFollowActions } from './useFollowActions';
import { useConnectionActions } from './useConnectionActions';
import { SocialUser } from './types';

export const useUserActions = (user: any | null, setUsers: React.Dispatch<React.SetStateAction<SocialUser[]>>, currentUser: SocialUser | null, setCurrentUser: React.Dispatch<React.SetStateAction<SocialUser | null>>) => {
  const [loading, setLoading] = useState(false);
  
  // Użyj zrefaktoryzowanych hooków
  const { 
    loadUsers: loadUsersBase, 
    fetchUserProfile, 
    searchUsers 
  } = useUserLoading(user);
  
  // Funkcja opakowująca dla loadUsers, ponieważ wymaga setUsers
  const loadUsers = async () => {
    await loadUsersBase(setUsers);
  };

  const {
    followUser,
    unfollowUser
  } = useFollowActions(user, setUsers, currentUser, setCurrentUser);

  const {
    sendConnectionRequest,
    acceptConnectionRequest,
    declineConnectionRequest,
    removeConnection
  } = useConnectionActions(user, setUsers, currentUser, setCurrentUser, loadUsers);

  return {
    loadUsers,
    fetchUserProfile,
    searchUsers,
    followUser,
    unfollowUser,
    sendConnectionRequest,
    acceptConnectionRequest,
    declineConnectionRequest,
    removeConnection
  };
};
