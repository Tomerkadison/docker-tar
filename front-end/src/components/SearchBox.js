import Turnstone from 'turnstone'
import { getRelativeTime } from '../utils/timeUtils'
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
  const storeRes = await fetch(
    `https://dockertar.zapto.org/dockerhub/api/search/v3/catalog/search?query=${query}&source=store&official=true&open_source=true&from=0&size=4&type=image`
  )
  const storeData = await storeRes.json()
  const storeDataResults = storeData.results || []

  const comunityRes = await fetch(
    `https://dockertar.zapto.org/dockerhub/api/search/v3/catalog/search?query=${query}&source=community&from=0&size=4&type=image`
  )
  const comunityData = await comunityRes.json()
  const comunityDataResults = comunityData.results || []

  const allResults = [...storeDataResults, ...comunityDataResults]
  const exactMatch = allResults.find(item => item.name === query)

  const baseListbox = [{
    name: "Verified Images",
    displayField: 'name',
    data: async () => storeDataResults,
    searchType: 'startsWith',
  },{
    name: "Community Images", 
    displayField: 'name',
    data: async () => comunityDataResults,
    searchType: 'startsWith',
  }]

  if (!exactMatch && query.trim()) {
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
      {/* Top row: Icon + Name + Description */}
      <div className='flex items-center mb-2'>
        {hasLogo ? (
          <img
            src={item.logo_url.small}
            alt={`${item.name} logo`}
            className="w-6 h-6 mr-3 rounded object-contain"
            onError={(e) => {e.target.style.display = 'none'}}
          />
        ) : (
          <svg
            className="w-6 h-6 mr-3 text-slate-400"
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
        <span className="text-white font-medium mr-3">{item.name}</span>
        <span className="text-gray-400 text-sm truncate">{item.short_description}</span>
      </div>

      {/* Bottom row: Download icon + pulls count + Clock icon + last update */}
      <div className='flex items-center justify-between'>
        <div className='flex items-center'>
          {pullCount && (
            <div className="flex items-center text-gray-400 text-sm">
              {/* Download icon */}
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
        </div>

        <div className='flex items-center'>
          {lastUpdate && (
            <div className="flex items-center text-gray-400 text-sm">
              {/* Clock icon */}
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
