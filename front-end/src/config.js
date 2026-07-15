// Central configuration for all external URLs and API endpoints.
//
// Everything is driven by environment variables so the app can be pointed at a
// local backend without touching source. Create React App only exposes vars
// prefixed with REACT_APP_. To run locally, copy `.env.example` to `.env.local`
// and adjust the values, then restart `npm start`.
//
// Defaults fall back to the production host so nothing breaks if no env is set.

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || 'https://dockertar.zapto.org';
const DOCKERHUB_PROXY_URL = process.env.REACT_APP_DOCKERHUB_PROXY_URL || 'https://dockertar.zapto.org';
const TURNSTILE_SITE_KEY = process.env.REACT_APP_TURNSTILE_SITE_KEY || '0x4AAAAAAB02nGeNdVYltnlB';

const config = {
  // Base hosts
  backendUrl: BACKEND_URL,
  dockerHubProxyUrl: DOCKERHUB_PROXY_URL,

  // Backend endpoints
  installUrl: `${BACKEND_URL}/install`,
  reportSuccessUrl: `${BACKEND_URL}/report/success`,

  // Docker Hub proxy endpoints
  dockerHubSearchUrl: `${DOCKERHUB_PROXY_URL}/dockerhub/api/search/v3/catalog/search`,
  dockerHubTagsUrl: (namespace, image) =>
    `${DOCKERHUB_PROXY_URL}/dockerhub/v2/repositories/${namespace}/${image}/tags/`,

  // Cloudflare Turnstile
  turnstileSiteKey: TURNSTILE_SITE_KEY,
};

export default config;
