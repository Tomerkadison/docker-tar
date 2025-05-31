import React, { useState, useEffect } from 'react';
import Select from 'react-select';
//import { Select } from 'antd'
import { components } from 'react-select';

async function getImageTags(namespace, image, page = 1) {
    try {
        const imageTagsRes = await fetch(
            `https://dockertar.zapto.org/dockerhub/v2/repositories/${namespace}/${image}/tags/?page_size=100&page=${page}&name&ordering`
        );
        if (!imageTagsRes.ok) {
            return { tags: [], hasMore: false }; // Return empty array for non-200 responses
        }
        const imageTagsData = await imageTagsRes.json();
        const imageTags = imageTagsData.results || [];

        // Only add 'latest' if there are no tags and it's not already present
        if (imageTags.length === 0 && page === 1) {
            return { 
                tags: [{ value: 'latest', label: 'latest' }],
                hasMore: false,
                count: 1
            };
        }

        const imageTagsOptions = imageTags.map(tag => {
            return { 
                value: tag.name, 
                label: tag.name
            };
        });

        // Check if there are more pages
        const count = imageTagsData.count || 0;
        const hasMore = page * 100 < count;

        return {
            tags: imageTagsOptions,
            hasMore,
            count
        };
    } catch (error) {
        console.warn("Error fetching image tags:", error);
        // Return empty array on error, we'll handle this in the UI
        return {
            tags: [],
            hasMore: false,
            count: 0
        };
    }
}

const TagSelect = (props) => {
    const [inputValue, setInputValue] = useState('');
    const [hasMore, setHasMore] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalCount, setTotalCount] = useState(0);
    
    // Update state when pagination info is provided
    useEffect(() => {
        if (props.paginationInfo) {
            setHasMore(props.paginationInfo.hasMore);
            setTotalCount(props.paginationInfo.count);
        }
    }, [props.paginationInfo]);
    
    // Reset pagination when options are reset
    useEffect(() => {
        if (!props.options || props.options.length === 0) {
            setCurrentPage(1);
        }
    }, [props.options]);
    
    const createOption = (label) => ({
        label,
        value: label
    });
    
    // Function to load more tags
    const loadMoreTags = async () => {
        if (!hasMore || !props.onLoadMore) return;
        
        const nextPage = currentPage + 1;
        setCurrentPage(nextPage);
        props.onLoadMore(nextPage);
    };
    
    // Custom menu component to show "Use: <input>" option and "Show More" button
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
        
        // Only show explicit option if input doesn't match any option AND is not empty
        const shouldShowExplicitOption = 
            inputValue !== null && 
            inputValue !== undefined && 
            inputValue !== '' && 
            !matchingOption;
            
        // Always show empty tag option when input is empty
        const showEmptyOption = inputValue === '';
        
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
                            background: '#1a73e8',
                            color: 'white',
                            fontWeight: 'bold'
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
                            padding: '8px 12px',
                            cursor: 'pointer',
                            background: '#f8f9fa',
                            color: '#333',
                            fontWeight: 'normal'
                        }}
                        onClick={handleEmptyTagClick}
                    >
                        Use: ""
                    </div>
                )}
                {hasMore && optionsArray.length > 0 && (
                    <div
                        className="show-more-option"
                        style={{
                            padding: '8px 12px',
                            cursor: 'pointer',
                            background: '#4CAF50',
                            color: 'white',
                            fontWeight: 'bold',
                            textAlign: 'center',
                            marginTop: '8px'
                        }}
                        onClick={(e) => {
                            e.stopPropagation(); // Prevent menu from closing
                            loadMoreTags();
                        }}
                    >
                        Show More Tags ({optionsArray.length} of {totalCount})
                    </div>
                )}
            </components.Menu>
        );
    };
    
    // Filter function that allows showing options that match input
    const filterOption = (option, inputValue) => {
        if (!inputValue) return true;
        
        // If this is a divider or group heading, show it
        if (option.data.__isNew__ || option.data.value === undefined) return true;
        
        return option.data.label.toLowerCase().includes(inputValue.toLowerCase());
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
            placeholder="Select Image Tag"
            ref={props.innerRef}
            components={{ Menu }}
            onInputChange={(value) => setInputValue(value)}
            onKeyDown={handleKeyDown}
            onChange={handleChange}
            noOptionsMessage={() => "No tags found. Type to create a custom tag."}
            filterOption={filterOption}
            {...props}
        />
    );
}

export { getImageTags }
export default TagSelect
