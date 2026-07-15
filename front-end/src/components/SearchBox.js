import Turnstone from 'turnstone'
import { getRelativeTime } from '../utils/timeUtils'
import config from '../config'
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
}


const getListbox = async (query) => {
  const searchRes = await fetch(
    `${config.dockerHubSearchUrl}?query=${query}&from=0&size=4&type=image`
  )
  const searchData = await searchRes.json()
  const searchResults = searchData.results || []

  const exactMatch = searchResults.find(item => item.name === query)

  const baseListbox = [{
    name: "Docker Hub Images",
    displayField: 'name',
    data: async () => searchResults,
    searchType: 'startsWith',
  }]

  if (!exactMatch && query.trim() && searchResults.length > 0) {
    baseListbox.push({
      name: "Explicit Name - Not found in Docker Hub",
      displayField: 'name',
      data: () => {
        const queryObject = {"name":query,"rate_plans":[{"repositories": [{"namespace": "_"}]}]}
        return [queryObject]
      }
    })
  }

  return baseListbox
}

const Item = ({ item }) => {
  const hasLogo = item.logo_url && item.logo_url.small
  const isVerified = item.source === 'verified_publisher'
  const isOfficial = item.rate_plans?.[0]?.repositories?.[0]?.is_official

  // Extract pull count from the API response
  const getPullCount = () => {
    if (item.rate_plans && item.rate_plans.length > 0) {
      const repositories = item.rate_plans[0].repositories
      if (repositories && repositories.length > 0) {
        return repositories[0].pull_count
      }
    }
    return null
  }

  // Get last update time
  const getLastUpdate = () => {
    if (item.rate_plans && item.rate_plans.length > 0) {
      const repositories = item.rate_plans[0].repositories
      if (repositories && repositories.length > 0) {
        const lastPushed = repositories[0].last_pushed_at
        return getRelativeTime(lastPushed)
      }
    }
    return null
  }

  const pullCount = getPullCount()
  const lastUpdate = getLastUpdate()

  return (
    <div className='cursor-pointer px-5 py-4'>
      <div className='flex items-center justify-between gap-4'>
        {/* Left: Logo + Name + Badge */}
        <div className='flex items-center gap-3 min-w-0'>
          {hasLogo ? (
            <img
              src={item.logo_url.small}
              alt={`${item.name} logo`}
              className="w-10 h-10 flex-shrink-0 rounded object-contain"
              onError={(e) => {e.target.style.display = 'none'}}
            />
          ) : (
            <svg
              className="w-10 h-10 flex-shrink-0 text-slate-400"
              viewBox="0 0 24 24"
              fill="none"
            >
              <path
                d="M20.5 7.27783L12 12.0001M12 12.0001L3.49997 7.27783M12 12.0001L12 21.5001M21 16.0586V7.94153C21 7.59889 21 7.42757 20.9495 7.27477C20.9049 7.13959 20.8318 7.01551 20.7354 6.91082C20.6263 6.79248 20.4766 6.70928 20.177 6.54288L12.777 2.43177C12.4934 2.27421 12.3516 2.19543 12.2015 2.16454C12.0685 2.13721 11.9315 2.13721 11.7986 2.16454C11.6484 2.19543 11.5066 2.27421 11.223 2.43177L3.82297 6.54288C3.52345 6.70928 3.37369 6.79248 3.26463 6.91082C3.16816 7.01551 3.09515 7.13959 3.05048 7.27477C3 7.42757 3 7.59889 3 7.94153V16.0586C3 16.4013 3 16.5726 3.05048 16.7254C3.09515 16.8606 3.16816 16.9847 3.26463 17.0893C3.37369 17.2077 3.52345 17.2909 3.82297 17.4573L11.223 21.5684C11.5066 21.726 11.6484 21.8047 11.7986 21.8356C11.9315 21.863 12.0685 21.863 12.2015 21.8356C12.3516 21.8047 12.4934 21.726 12.777 21.5684L20.177 17.4573C20.4766 17.2909 20.6263 17.2077 20.7354 17.0893C20.8318 16.9847 20.9049 16.8606 20.9495 16.7254C21 16.5726 21 16.4013 21 16.0586Z"
                stroke="currentColor"
                fill="none"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          )}
          <span className="text-white font-medium text-lg min-w-0 break-words">{item.name}</span>
          {(isVerified || isOfficial) && (
            <svg
              className="w-5 h-5 flex-shrink-0 text-blue-500"
              viewBox="0 0 24 24"
              fill="none"
              title={isOfficial ? "Official Image" : "Verified Publisher"}
            >
              <path
                fillRule="evenodd"
                clipRule="evenodd"
                d="M2.0315 12C2.0312 11.8662 2.00492 11.7325 1.95265 11.6065L1.23121 9.85975C1.07879 9.49188 1.00006 9.09699 1 8.69879C0.999936 8.30038 1.07838 7.90585 1.23084 7.53776C1.3833 7.16967 1.6068 6.83523 1.88856 6.55355C2.17025 6.27194 2.50465 6.04858 2.87267 5.89623L4.6166 5.17384C4.86916 5.06941 5.0706 4.86887 5.17575 4.61659L5.8983 2.87214C6.20608 2.12905 6.79645 1.53866 7.53953 1.23085C8.28261 0.923049 9.11753 0.923048 9.86061 1.23085L11.6037 1.9529C11.8567 2.05733 12.141 2.0572 12.3938 1.95231L12.3958 1.95149L14.1404 1.23192C14.8832 0.924529 15.7183 0.924429 16.4611 1.23209C17.204 1.53984 17.7943 2.13006 18.1021 2.87295L18.8073 4.57552C18.8136 4.58896 18.8196 4.60259 18.8253 4.61641C18.9298 4.86924 19.1304 5.07024 19.383 5.1753L21.1279 5.8981C21.871 6.20591 22.4614 6.7963 22.7692 7.53939C23.0769 8.28247 23.0769 9.11739 22.7692 9.86048L22.0468 11.6045C21.9943 11.7311 21.9681 11.8661 21.9681 12.0003C21.9681 12.1345 21.9943 12.2689 22.0468 12.3955L22.7692 14.1395C23.0769 14.8826 23.0769 15.7175 22.7692 16.4606C22.4614 17.2037 21.871 17.7941 21.1279 18.1019L19.383 18.8247C19.1304 18.9298 18.9298 19.1308 18.8253 19.3836C18.8196 19.3974 18.8136 19.411 18.8073 19.4245L18.1021 21.127C17.7943 21.8699 17.204 22.4602 16.4611 22.7679C15.7183 23.0756 14.8832 23.0755 14.1404 22.7681L12.3958 22.0485L12.3938 22.0477C12.141 21.9428 11.8567 21.9427 11.6037 22.0471L9.86061 22.7691C9.11753 23.077 8.28261 23.077 7.53953 22.7691C6.79645 22.4613 6.20608 21.8709 5.8983 21.1279L5.17575 19.3834C5.0706 19.1311 4.86916 18.9306 4.6166 18.8262L2.87267 18.1038C2.50465 17.9514 2.17025 17.7281 1.88856 17.4465C1.6068 17.1648 1.3833 16.8303 1.23084 16.4622C1.07838 16.0941 0.999936 15.6996 1 15.3012C1.00006 14.903 1.07879 14.5081 1.23121 14.1402L1.95265 12.3935C2.00492 12.2675 2.0312 12.1338 2.0315 12ZM16.2071 10.2071C16.5976 9.81658 16.5976 9.18342 16.2071 8.79289C15.8166 8.40237 15.1834 8.40237 14.7929 8.79289L11 12.5858L9.70711 11.2929C9.31658 10.9024 8.68342 10.9024 8.29289 11.2929C7.90237 11.6834 7.90237 12.3166 8.29289 12.7071L10.2929 14.7071C10.6834 15.0976 11.3166 15.0976 11.7071 14.7071L16.2071 10.2071Z"
                fill="currentColor"
              />
            </svg>
          )}
        </div>

        {/* Right: Metadata - fixed size, no shrink */}
        <div className='flex flex-col items-end space-y-1 flex-shrink-0'>
          {/* Pull count */}
          {pullCount && (
            <div className="flex items-center text-gray-400 text-sm whitespace-nowrap">
              <svg
                className="w-4 h-4 mr-1"
                viewBox="0 0 24 24"
                fill="none"
              >
                <path
                  d="M21 21H3M18 11L12 17M12 17L6 11M12 17V3"
                  stroke="currentColor"
                  fill="none"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              <span>{pullCount}</span>
            </div>
          )}

          {/* Last update */}
          {lastUpdate && (
            <div className="flex items-center text-gray-400 text-sm whitespace-nowrap">
              <svg
                className="w-4 h-4 mr-1"
                viewBox="0 0 24 24"
                fill="none"
              >
                <path
                  d="M21.7 13.5L19.7005 11.5L17.7 13.5M20 12C20 16.9706 15.9706 21 11 21C6.02944 21 2 16.9706 2 12C2 7.02944 6.02944 3 11 3C14.3019 3 17.1885 4.77814 18.7545 7.42909M11 7V12L14 14"
                  stroke="currentColor"
                  fill="none"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              <span>{lastUpdate}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}


const SearchBox = (props) => {
  return (
    <Turnstone
      id='search'
      name='search'
      autoFocus={true}
      typeahead={true}
      clearButton={true}
      debounceWait={250}
      listboxIsImmutable={false}
      maxItems={9}
      noItemsMessage="No Images Found"
      placeholder='Search for an image'
      listbox={getListbox}
      styles={styles}
      Item={Item}
      {...props}
      // text='Iron M'
    />
  )
}



export default SearchBox
