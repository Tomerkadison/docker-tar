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
 * @param {Object} props.selectedImage - Selected image object
 * @param {boolean} props.isDisabled - Disabled state
 * @param {Object} props.innerRef - Ref for the select component
 * @returns {JSX.Element} TagSelect component
 */
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
            loadingMessage={() => "Loading tags..."}
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
