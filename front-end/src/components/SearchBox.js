import Turnstone from 'turnstone'
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

  return (
    <div className='flex items-center cursor-pointer px-5 py-4'>
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
      <p>{item.name}</p>
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
