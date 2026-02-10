import { useAuth } from "oidc-react";
import { getConfig } from "../../../lib/config";

const config = getConfig();

// If login is enabled → returns the real auth object from oidc-react
// If login is disabled → returns null
// Note: AuthProvider must always be rendered (even with minimal config when login is disabled)
// to avoid "context is undefined" errors

export const useAuthSafe = () => {
  const loginEnabled = config?.ui?.showLogin === true;
  
  // Always call hooks unconditionally (React rules of hooks)
  // useAuth() will work as long as AuthProvider is in the tree
  const auth = useAuth();
  
  // If login is disabled, return null
  // The auth object will still exist (because AuthProvider is rendered),
  // but we return null to indicate login is not available
  if (!loginEnabled) {
    return null;
  }
  
  // Return the auth object when login is enabled
  return auth;
};
