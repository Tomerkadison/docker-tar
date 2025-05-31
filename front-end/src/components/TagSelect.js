
import Select from 'react-select';
import React, { useState, useEffect } from 'react';
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

// Function to filter and sort options based on input value
const filterAndSortOptions = (options, inputValue) => {
    if (!inputValue || !options) return options;
    
    const input = inputValue.toLowerCase();
    
    // Create a new array with priority information
    const optionsWithPriority = options.map(option => {
        const optionValue = option.value.toLowerCase();
        
        // Assign priority based on match type
        if (optionValue === input) {
            // Exact match (highest priority)
            return { ...option, priority: 1 };
        } else if (optionValue.startsWith(input)) {
            // Starts with match (medium priority)
            return { ...option, priority: 2 };
        } else if (optionValue.includes(input)) {
            // Contains match (lowest priority)
            return { ...option, priority: 3 };
        }
        
        // No match
        return { ...option, priority: 999 };
    });
    
    // Filter out non-matches
    const filteredOptions = optionsWithPriority.filter(option => option.priority < 999);
    
    // Sort by priority
    filteredOptions.sort((a, b) => a.priority - b.priority);
    
    return filteredOptions;
};

const TagSelect = (props) => {
    // Extract options and isLoading from props
    const { options, isLoading, onChange, ...otherProps } = props;
    
    // State for input value and filtered options
    const [inputValue, setInputValue] = useState('');
    const [filteredOptions, setFilteredOptions] = useState(options || []);
    
    // Update filtered options when options or input value changes
    useEffect(() => {
        if (options) {
            setFilteredOptions(filterAndSortOptions(options, inputValue));
        }
    }, [options, inputValue]);
    
    // Handle input change
    const handleInputChange = (newValue) => {
        setInputValue(newValue);
        return newValue;
    };
    
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
            options={filteredOptions}
            onInputChange={handleInputChange}
            onChange={onChange}
            filterOption={() => true} // Let our custom logic handle filtering
            {...otherProps}
        />
    );
}

export { getImageTags }
export default TagSelect
