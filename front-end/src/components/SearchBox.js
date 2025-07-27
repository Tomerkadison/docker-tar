import Turnstone from 'turnstone';
import { API_ENDPOINTS, SEARCH_CONFIG, UI_CONFIG } from '../constants/config';

/**
 * Styles configuration for Turnstone component
 */
const styles = {
  input: 'w-full border py-2 px-4 text-lg outline-none rounded-md',
  listbox: 'bg-neutral-900 w-full text-slate-50 rounded-md',
  highlightedItem: 'bg-neutral-800 font-bold',
  query: 'text-oldsilver-800 placeholder:text-slate-600',
  typeahead: 'text-slate-500',
  clearButton:
    'absolute inset-y-0 text-lg right-0 w-10 inline-flex items-center justify-center bg-netural-700 hover:text-red-500',
  noItems: 'cursor-default text-center my-20',
  match: 'font-semibold',
  groupHeading: 'px-5 py-3 text-blue-500 font-bold',
};

/**
 * Fetches search results from Docker Hub API
 * @param {string} query - Search query
 * @returns {Array} Listbox configuration for Turnstone
 */
const getListbox = async (query) => {
  // Fetch verified/official images
  const storeRes = await fetch(
    `${API_ENDPOINTS.DOCKERHUB_SEARCH}?query=${query}&source=${SEARCH_CONFIG.VERIFIED_IMAGES.source}&official=${SEARCH_CONFIG.VERIFIED_IMAGES.official}&open_source=${SEARCH_CONFIG.VERIFIED_IMAGES.open_source}&from=0&size=${SEARCH_CONFIG.VERIFIED_IMAGES.size}&type=image`
  );
  const storeData = await storeRes.json();
  const storeDataResults = storeData.results || [];

  // Fetch community images
  const communityRes = await fetch(
    `${API_ENDPOINTS.DOCKERHUB_SEARCH}?query=${query}&source=${SEARCH_CONFIG.COMMUNITY_IMAGES.source}&from=0&size=${SEARCH_CONFIG.COMMUNITY_IMAGES.size}&type=image`
  );
  const communityData = await communityRes.json();
  const communityDataResults = communityData.results || [];

  // Check for exact matches
  const allResults = [...storeDataResults, ...communityDataResults];
  const exactMatch = allResults.find(item => item.name === query);

  // Build listbox configuration
  const baseListbox = [
    {
      name: "Verified Images",
      displayField: 'name',
      data: async () => storeDataResults,
      searchType: 'startsWith',
    },
    {
      name: "Community Images", 
      displayField: 'name',
      data: async () => communityDataResults,
      searchType: 'startsWith',
    }
  ];

  // Add explicit name option if no exact match found
  if (!exactMatch && query.trim()) {
    baseListbox.push({
      name: "Explicit Name - Not found in Docker Hub",
      displayField: 'name',
      data: () => {
        const queryObject = {
          "name": query,
          "rate_plans": [{"repositories": [{"namespace": "_"}]}]
        };
        return [queryObject];
      }
    });
  }

  return baseListbox;
};

/**
 * Custom item component for search results
 * @param {Object} props - Component props
 * @param {Object} props.item - Search result item
 * @returns {JSX.Element} Item component
 */
const Item = ({ item }) => {
  return (
    <div className='flex items-center cursor-pointer px-5 py-4'>
      <p>{item.name}</p>
    </div>
  );
};

/**
 * SearchBox component for Docker image search functionality
 * @param {Object} props - Component props
 * @param {Function} props.onSelect - Callback for item selection
 * @param {Function} props.onChange - Callback for input changes
 * @returns {JSX.Element} SearchBox component
 */
const SearchBox = (props) => {
  return (
    <Turnstone
      id='search'
      name='search'
      autoFocus={true}
      typeahead={true}
      clearButton={true}
      debounceWait={UI_CONFIG.DEBOUNCE_DELAY}
      listboxIsImmutable={false}
      maxItems={9}
      noItemsMessage="No Images Found"
      placeholder='Search for an image'
      listbox={getListbox}
      styles={styles}
      Item={Item}
      {...props}
    />
  );
};



export default SearchBox
