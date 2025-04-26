import Select from 'react-select';
//import { Select } from 'antd'
import { components } from 'react-select';
import { useState } from 'react';

async function getImageTags(namespace, image) {
    const imageTagsRes = await fetch(
        `https://dockertar.zapto.org/dockerhub/v2/repositories/${namespace}/${image}/tags/?page_size=100&page=1&name&ordering`
    );
    const imageTagsData = await imageTagsRes.json();
    const imageTags = imageTagsData.results || [];

    // Add 'latest' as default option if not already in the list
    const hasLatest = imageTags.some(tag => tag.name === 'latest');
    if (!hasLatest) {
        imageTags.unshift({ name: 'latest' });
    }

    // Add empty tag option
    imageTags.unshift({ name: '' });

    const imageTagsOptions = imageTags.map(tag => {
        return { 
            value: tag.name, 
            label: tag.name === '' ? '(empty tag)' : tag.name 
        };
    });

    return imageTagsOptions;
}

const TagSelect = (props) => {
    const [inputValue, setInputValue] = useState('');
    
    const createOption = (label) => ({
        label: label === '' ? '(empty tag)' : label,
        value: label
    });
    
    // Custom menu component to show "Use: <input>" option
    const Menu = (props) => {
        const { options, children } = props;
        
        // Convert to array if options is not an array
        const optionsArray = Array.isArray(options) ? options : [];
        
        // Show the explicit option only when there are no matching options or user has typed something
        const shouldShowExplicitOption = 
            (inputValue !== null && inputValue !== undefined) && 
            (!optionsArray.length || !optionsArray.some(option => 
                option.data && option.data.value !== undefined && 
                option.data.value.toLowerCase() === inputValue.toLowerCase()));
            
        // Add option for empty tag if not already shown
        const showEmptyTagOption = 
            inputValue === '' && 
            !optionsArray.some(option => 
                option.data && option.data.value !== undefined && option.data.value === '');
            
        return (
            <components.Menu {...props}>
                {children}
                {showEmptyTagOption && (
                    <div
                        className="explicit-option"
                        style={{
                            padding: '8px 12px',
                            cursor: 'pointer',
                            background: '#f0f0f0',
                            color: '#333',
                            fontWeight: 'bold'
                        }}
                        onClick={() => {
                            if (props.selectProps.onChange) {
                                props.selectProps.onChange(createOption(''));
                            }
                            if (props.selectProps.onMenuClose) {
                                props.selectProps.onMenuClose();
                            }
                        }}
                    >
                        Use empty tag
                    </div>
                )}
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
            </components.Menu>
        );
    };
    
    // Filter function that allows showing options that match input
    // while also preserving the ability to add custom values
    const filterOption = (option, inputValue) => {
        if (!inputValue) return true;
        
        // If this is a divider or group heading, show it
        if (option.data.__isNew__ || option.data.value === undefined) return true;
        
        // Empty tag should be visible when filtering
        if (option.data.value === '') return true;
        
        return option.data.label.toLowerCase().includes(inputValue.toLowerCase());
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
            noOptionsMessage={() => "No tags found. Type to create a custom tag."}
            filterOption={filterOption}
            {...props}
        />
    );
}

export { getImageTags }
export default TagSelect
