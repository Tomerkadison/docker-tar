
import Select from 'react-select';
//import { Select } from 'antd'

async function getImageTags(namespace, image) {
    // First, fetch the first page to get total count and determine number of pages
    const firstPageRes = await fetch(
        `https://dockertar.zapto.org/dockerhub/v2/repositories/${namespace}/${image}/tags/?page_size=100&page=1&name&ordering`
    );
    const firstPageData = await firstPageRes.json();
    
    // Calculate total number of pages
    const totalCount = firstPageData.count;
    const totalPages = Math.ceil(totalCount / 100);
    
    // Create an array of page numbers to fetch (starting from page 2, since we already have page 1)
    const pageNumbers = Array.from({ length: totalPages - 1 }, (_, i) => i + 2);
    
    // Start with the results from the first page
    let allTags = [...firstPageData.results];
    
    // Fetch all remaining pages concurrently
    if (pageNumbers.length > 0) {
        const remainingPagesPromises = pageNumbers.map(page => 
            fetch(`https://dockertar.zapto.org/dockerhub/v2/repositories/${namespace}/${image}/tags/?page_size=100&page=${page}&name&ordering`)
                .then(res => res.json())
                .then(data => data.results)
        );
        
        // Wait for all requests to complete
        const remainingPagesResults = await Promise.all(remainingPagesPromises);
        
        // Combine all results
        for (const pageResults of remainingPagesResults) {
            allTags = [...allTags, ...pageResults];
        }
    }
    
    // Map to the format expected by the component
    const imageTagsOptions = allTags.map(tag => {
        return { value: tag.name, label: tag.name };
    });
    
    return imageTagsOptions;
}

const TagSelect = (props) => {
    // Extract isLoading from props to avoid passing it twice
    const { isLoading, ...otherProps } = props;
    
    return (
        <Select
            autoFocus={true}
            isSearchable={true}
            //isClearable={true}
            name="lastest"
            placeholder={isLoading ? "Loading tags..." : "Select Image Tag"}
            ref={props.innerRef}
            isDisabled={props.isDisabled || isLoading}
            isLoading={isLoading}
            loadingMessage={() => "Fetching all tags..."}
            {...otherProps}
        />
    );
}

export { getImageTags }
export default TagSelect
