
  const downloadFile = ( url, fileName) => {
    fetch(url,{
      signal: AbortSignal.timeout(5000)
    })
      .then((response) => response.blob())
      .then((blob) => {
        const url = window.URL.createObjectURL(new Blob([blob]));
        const link = document.createElement("a");
        link.href = url;
        link.download = fileName || "downloaded-file";
        document.body.appendChild(link);

        link.click();

        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
        return true
      }).catch((error) => {
        alert("Failed to download image... Refresh page and try again later");
        return false
      });
  };


export {downloadFile}