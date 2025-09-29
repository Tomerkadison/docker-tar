import React, { useState, useEffect } from 'react';
import Select from 'react-select';
//import { Select } from 'antd'
import { components } from 'react-select';
import { getRelativeTime } from '../utils/timeUtils';

async function getAllImageTags(namespace, image) {
    try {
        // First, fetch the first page to get the total count
        const firstPageRes = await fetch(
            `https://dockertar.zapto.org/dockerhub/v2/repositories/${namespace}/${image}/tags/?page_size=100&page=1&name&ordering`
        );
        
        if (!firstPageRes.ok) {
            return []; // Return empty array for non-200 responses
        }
        
        const firstPageData = await firstPageRes.json();
        const totalCount = firstPageData.count || 0;
        const firstPageTags = firstPageData.results || [];
        
        // If there are no tags, return empty array
        if (totalCount === 0) {
            return [];
        }
        
        // If all tags fit in the first page, filter and return them
        if (totalCount <= 100) {
            const filteredTags = firstPageTags.filter(tag =>
                tag.media_type !== "application/vnd.docker.distribution.manifest.v1+prettyjws"
            );
            return filteredTags.map(tag => ({
                value: tag.name,
                label: tag.name
            }));
        }
        
        // Calculate how many additional pages we need
        const totalPages = Math.ceil(totalCount / 100);
        const additionalPages = [];
        
        // Create promises for all remaining pages
        for (let page = 2; page <= totalPages; page++) {
            additionalPages.push(
                fetch(`https://dockertar.zapto.org/dockerhub/v2/repositories/${namespace}/${image}/tags/?page_size=100&page=${page}&name&ordering`)
                    .then(res => res.ok ? res.json() : { results: [] })
                    .catch(() => ({ results: [] }))
            );
        }
        
        // Fetch all additional pages concurrently
        const additionalPagesData = await Promise.all(additionalPages);
        
        // Combine all tags
        let allTags = [...firstPageTags];
        additionalPagesData.forEach(pageData => {
            if (pageData.results) {
                allTags = [...allTags, ...pageData.results];
            }
        });

        // Filter out deprecated v1 manifest tags
        const filteredTags = allTags.filter(tag =>
            tag.media_type !== "application/vnd.docker.distribution.manifest.v1+prettyjws"
        );

        // Convert to options format
        return filteredTags.map(tag => ({
            value: tag.name,
            label: tag.name,
            lastPushed: getRelativeTime(tag.tag_last_pushed || tag.last_updated)
        }));
        
    } catch (error) {
        console.warn("Error fetching all image tags:", error);
        return []; // Return empty array on error
    }
}

// Legacy function kept for backward compatibility - now calls getAllImageTags
async function getImageTags(namespace, image, page = 1) {
    if (page === 1) {
        const allTags = await getAllImageTags(namespace, image);
        return {
            tags: allTags,
            hasMore: false,
            count: allTags.length
        };
    }
    
    // For pages > 1, return empty (since we now fetch everything at once)
    return {
        tags: [],
        hasMore: false,
        count: 0
    };
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
    // Extract options, isLoading, and selectedImage from props
    const { options, isLoading, onChange, selectedImage, ...otherProps } = props;
    
    const [inputValue, setInputValue] = useState('');
    const [filteredOptions, setFilteredOptions] = useState(options || []);
    
    // Helper function to determine if the selected image is explicit (not from Docker Hub)
    const isExplicitImage = () => {
        if (!selectedImage) return false;
        
        // Check if this is an explicit image by looking at its structure
        // Explicit images have minimal rate_plans structure and come from "Explicit Name" section
        const hasMinimalStructure = selectedImage.rate_plans && 
                                   selectedImage.rate_plans[0] && 
                                   selectedImage.rate_plans[0].repositories && 
                                   selectedImage.rate_plans[0].repositories[0] &&
                                   selectedImage.rate_plans[0].repositories[0].namespace === "_" &&
                                   !selectedImage.rate_plans[0].repositories[0].name;
        
        return hasMinimalStructure;
    };
    
    // Update filtered options when options or input value changes
    useEffect(() => {
        if (options) {
            setFilteredOptions(filterAndSortOptions(options, inputValue));
        }
    }, [options, inputValue]);
    
    const createOption = (label) => ({
        label,
        value: label
    });
    
    
    // Custom option component to display tag name with last pushed time
    const Option = (props) => {
        const { data } = props;
        return (
            <components.Option {...props}>
                <div className="flex justify-between items-center">
                    <span>{data.label}</span>
                    {data.lastPushed && (
                        <span className="text-gray-400 text-sm ml-2">
                            {data.lastPushed}
                        </span>
                    )}
                </div>
            </components.Option>
        );
    };

    // Custom menu component to show "Use: <input>" option and empty tag option
    const Menu = (props) => {
        const { options, children } = props;
        
        // Convert to array if options is not an array
        const optionsArray = Array.isArray(options) ? options : [];
        
        // Check if current input matches any existing option
        const matchingOption = optionsArray.find(option => 
            option.data && 
            option.data.value !== undefined && 
            option.data.value === inputValue
        );
        
        // Only show explicit option if input doesn't match any option AND is not empty AND is explicit image
        const shouldShowExplicitOption = 
            isExplicitImage() &&
            inputValue !== null && 
            inputValue !== undefined && 
            inputValue !== '' && 
            !matchingOption;
            
        // Only show empty tag option when input is empty AND is explicit image
        const showEmptyOption = isExplicitImage() && inputValue === '';
        
        // Handle clicking the empty tag option
        const handleEmptyTagClick = () => {
            console.log("Empty tag clicked"); // Debug log
            // Call the onChange handler with a proper object
            props.selectProps.onChange && props.selectProps.onChange({
                value: '',
                label: ''
            });
            
            props.selectProps.onMenuClose && props.selectProps.onMenuClose();
        };
            
        return (
            <components.Menu {...props}>
                {children}
                {shouldShowExplicitOption && (
                    <div
                        className="explicit-option"
                        style={{
                            padding: '8px 12px',
                            cursor: 'pointer',
                            background: '#e3f2fd',
                            color: '#1976d2',
                            fontWeight: 'normal',
                            borderTop: '1px solid #bbdefb',
                            borderBottom: '1px solid #bbdefb'
                        }}
                        onClick={() => {
                            console.log("Custom tag clicked:", inputValue); // Debug log
                            if (props.selectProps.onChange) {
                                props.selectProps.onChange(createOption(inputValue));
                            }
                            if (props.selectProps.onMenuClose) {
                                props.selectProps.onMenuClose();
                            }
                        }}
                    >
                        Use: "{inputValue}"
                    </div>
                )}
                {showEmptyOption && (
                    <div
                        className="explicit-option"
                        style={{
                            padding: '6px 10px',
                            cursor: 'pointer',
                            background: '#f8f9fa',
                            color: '#6c757d',
                            fontWeight: 'normal',
                            fontSize: '0.9em',
                            borderTop: '1px solid #e9ecef',
                            borderBottom: '1px solid #e9ecef'
                        }}
                        onClick={handleEmptyTagClick}
                    >
                        Use empty tag
                    </div>
                )}
            </components.Menu>
        );
    };
    

    // Handle empty tag selection with Enter key
    const handleKeyDown = (event) => {
        if (event.key === 'Enter' && inputValue === '') {
            console.log("Enter pressed with empty input"); // Debug log
            
            // Call parent onChange directly with the empty value
            props.onChange && props.onChange({
                value: '',
                label: ''
            });
            
            event.preventDefault();
        }
    };
    
    // Handle input change
    const handleInputChange = (newValue) => {
        setInputValue(newValue);
        return newValue;
    };
    
    // Wrap the onChange handler to add debugging
    const handleChange = (selectedOption) => {
        console.log("TagSelect onChange:", selectedOption); // Debug log
        props.onChange && props.onChange(selectedOption);
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
            components={{ Menu, Option }}
            options={filteredOptions}
            onInputChange={handleInputChange}
            onKeyDown={handleKeyDown}
            onChange={handleChange}
            noOptionsMessage={() => "No tags found. Type to create a custom tag."}
            filterOption={() => true} // Let our custom logic handle filtering
            {...otherProps}
        />
    );
}

export { getImageTags, getAllImageTags }
export default TagSelect
