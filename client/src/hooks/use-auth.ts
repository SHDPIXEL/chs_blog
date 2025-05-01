import { useMutation } from '@tanstack/react-query';
import { queryClient } from '@/lib/queryClient';
import { LoginFormData, User } from '@/types/auth';
import { useAuth as useAuthContext } from '@/context/AuthContext';

export function useAuth() {
  const authContext = useAuthContext();
  
  // Create login mutation
  const loginMutation = useMutation({
    mutationFn: async (data: LoginFormData) => {
      return authContext.login(data);
    },
    onSuccess: () => {
      // Invalidate relevant queries
      queryClient.invalidateQueries({ queryKey: ['/api/auth/me'] });
    }
  });

  return {
    ...authContext,
    loginMutation
  };
}