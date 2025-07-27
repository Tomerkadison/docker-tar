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
  // const avatar = `${item.thumbnail.path}.${item.thumbnail.extension}`
  return (
    <div className='flex items-center cursor-pointer px-5 py-4'>
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
