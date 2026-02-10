// import React from "react";
// import ReactDOM from "react-dom/client";
// import App from "./App";
// import { AuthProvider } from "oidc-react";
// import configData from "./auth.config.json";
// import "./index.css";

// const oidcConfig = {
//   onSignIn: async () => {
//     window.history.replaceState(null, "", `${process.env.PUBLIC_URL || ""}/login`);
//   },

//   authority: "https://login.aai.lifescience-ri.eu/oidc",
//   clientId: process.env.REACT_APP_CLIENT_ID,
//   clientSecret: process.env.REACT_APP_CLIENT_SECRET,
//   autoSignIn: false,
//   responseType: "code",
//   automaticSilentRenew: true,
//   redirectUri:
//     process.env.NODE_ENV === "development" && configData.REDIRECT_URL,
//   // postLogoutRedirectUri:
//   // process.env.NODE_ENV === "development" &&
//   // configData.POST_LOGOUT_REDIRECT_URL,
//   // process.env.NODE_ENV === "development" && configData.REDIRECT_URL,
//   scope: "openid profile email ga4gh_passport_v1 offline_access",
//   revokeAccessTokenOnSignout: true,
// };

// // console.log("OIDC Config:", oidcConfig);

// const root = ReactDOM.createRoot(document.getElementById("root"));
// root.render(
//   <React.StrictMode>
//     <AuthProvider {...oidcConfig}>
//       <App />
//     </AuthProvider>
//   </React.StrictMode>
// );

import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import { AuthProvider } from "oidc-react";
import { getConfig } from "./lib/config";

const config = getConfig();
import "./index.css";

// Builds the OIDC configuration using settings from config.json
// Always returns a config object to ensure AuthProvider can be rendered
function buildOidcConfig() {
  const ui = config.ui;
  const loginEnabled = ui?.showLogin === true;
  const auth = ui?.auth;
  const oidc = auth?.oidc;

  // If login is disabled or oidc config is missing, build a safe no-op config from defaults
  if (!loginEnabled || !oidc) {
    // Use values from config.json if they exist, otherwise use safe defaults
    return {
      authority: oidc?.authority || window.location.origin,
      clientId: oidc?.clientId || process.env.REACT_APP_CLIENT_ID || "disabled-client",
      redirectUri: oidc?.redirectUri || window.location.origin,
      responseType: oidc?.responseType || "code",
      scope: oidc?.scope || "openid",
      autoSignIn: false, // Always disabled when login is disabled
      automaticSilentRenew: false, // Always disabled when login is disabled
      revokeAccessTokenOnSignout: oidc?.revokeAccessTokenOnSignout || false,
      onSignIn: async () => {
        window.history.replaceState(null, "", `${process.env.PUBLIC_URL || ""}/login`);
      },
    };
  }

  const { providerType = "public" } = auth;
  const isPrivate = providerType === "private";

  // Prefer env variables; fallback to config
  const clientId = process.env.REACT_APP_CLIENT_ID || oidc.clientId;
  const clientSecret = process.env.REACT_APP_CLIENT_SECRET || (isPrivate ? oidc.clientSecret : undefined);

  // Warn if required fields are missing, but still build a config
  if (!clientId) {
    console.warn("clientId is missing. Using fallback from config.json.");
  }

  if (isPrivate && !clientSecret) {
    console.warn(
      "providerType is 'private' but no clientSecret was found. Authentication may not work."
    );
  }

  if (!isPrivate && clientSecret) {
    console.warn(
      "providerType is 'public', but a clientSecret was provided. It will not be used."
    );
  }

  // OIDC configuration passed to AuthProvider, always built from config.json
  return {
    onSignIn: async () => {
      window.history.replaceState(null, "", `${process.env.PUBLIC_URL || ""}/login`);
    },
    authority: oidc.authority,
    clientId: clientId || oidc.clientId,
    ...(isPrivate && clientSecret ? { clientSecret } : {}),
    autoSignIn: oidc.autoSignIn ?? false,
    responseType: oidc.responseType || "code",
    automaticSilentRenew: oidc.automaticSilentRenew ?? true,
    redirectUri: oidc.redirectUri || window.location.origin,
    scope: oidc.scope || "openid",
    revokeAccessTokenOnSignout: oidc.revokeAccessTokenOnSignout ?? true,
  };
}

// Always build config from config.json (never returns null)
const oidcConfig = buildOidcConfig();

const root = ReactDOM.createRoot(document.getElementById("root"));

root.render(
  <React.StrictMode>
    <AuthProvider {...oidcConfig}>
      <App />
    </AuthProvider>
  </React.StrictMode>
);
