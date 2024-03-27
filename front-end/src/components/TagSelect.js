
import Select from 'react-select';

async function getImageTags(namespace, image) {
    const imageTagsRes = await fetch(
      `https://corsproxy.io/?https://hub.docker.com/v2/repositories/${namespace}/${image}/tags/?page_size=100&page=1&name&ordering`
    );
    const imageTagsData = await imageTagsRes.json();
    const imageTags = imageTagsData.results;
  
    const hasLatestTag = imageTags.some(tag => tag.name === "latest");
  
    const imageTagsOptions = hasLatestTag
      ? imageTags.map(tag => ({ value: tag.name, label: tag.name }))
      : [{ value: "latest", label: "latest" }, ...imageTags.map(tag => ({ value: tag.name, label: tag.name }))];
  
    return imageTagsOptions;
  }

const TagSelect = (props) => {
    return (
        <Select
            autoFocus={true}
            isSearchable={true}
            isClearable={true}
            name="lastest"
            placeholder="Select Image Tag"
            ref={props.innerRef}
            {...props}
        />
    );
}

export {getImageTags}
export default TagSelect