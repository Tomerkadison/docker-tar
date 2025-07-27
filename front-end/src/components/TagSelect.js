import React, { useState, useEffect } from 'react';
import Select from 'react-select';
import { components } from 'react-select';

/**
 * Filters and sorts options based on input value with priority matching
 * @param {Array} options - Array of tag options
 * @param {string} inputValue - Current input value
 * @returns {Array} Filtered and sorted options
 */
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

/**
 * TagSelect component for Docker image tag selection with advanced features
 * @param {Object} props - Component props
 * @param {Array} props.options - Available tag options
 * @param {boolean} props.isLoading - Loading state
 * @param {Function} props.onChange - Change handler
 * @param {Object} props.paginationInfo - Pagination information
 * @param {Function} props.onLoadMore - Load more handler
 * @param {boolean} props.isDisabled - Disabled state
 * @param {Object} props.innerRef - Ref for the select component
 * @returns {JSX.Element} TagSelect component
 */
const TagSelect = (props) => {
    // Extract options and isLoading from props
    const { options, isLoading, onChange, ...otherProps } = props;
    
    const [inputValue, setInputValue] = useState('');
    const [filteredOptions, setFilteredOptions] = useState(options || []);
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
            components={{ Menu }}
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

export default TagSelect
