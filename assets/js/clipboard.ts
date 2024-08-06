export async function copyToClipboard(text) {
    function fallbackCopyTextToClipboard(text) {
        const tempInput = document.createElement('input');
        tempInput.setAttribute('value', text);
        document.body.appendChild(tempInput);
        tempInput.select();
        tempInput.setSelectionRange(0, 99999);

        try {
            document.execCommand('copy');
            console.debug('Copied to clipboard');
        } catch (err) {
            console.error('Fallback: Unable to copy', err);
        }

        document.body.removeChild(tempInput);
    }

    if (!navigator.clipboard) {
        fallbackCopyTextToClipboard(text);
    } else {
        try {
            await navigator.clipboard.writeText(text);
            console.debug('Copied to clipboard');
        } catch (err) {
            console.error('Error copying text: ', err);
            fallbackCopyTextToClipboard(text);
        }
    }
}
