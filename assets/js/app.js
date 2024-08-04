async function copyToClipboard(text) {
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
        } catch(err) {
            console.error('Error copying text: ', err);
            fallbackCopyTextToClipboard(text);
        }
    }
}

async function copyLinkAndTitleToClipboard() {
    const title = document.querySelector("meta[property='og:title']").getAttribute('content');
    const url = document.querySelector("meta[property='og:url']").getAttribute('content');
    const text = title + " " + url;
    await copyToClipboard(text);
    return false;
}

function addClipboardShareOption() {
    const shareList = document.querySelector("#app-share-list");
    if (shareList) {
        const item = document.createElement("li");
        item.className = 'app-links-list-item';
        item.innerHTML = `
            <a href="#" role="button" id="app-share-clipboard-link">
                <i class="las la-clipboard" aria-hidden="true"></i>
                <span class="app-links-list-item-text">
                    <span class="govuk-visually-hidden">Copy title and link to</span>
                    Clipboard
                </span>
            </a>`
        item.addEventListener('click', async function(event) {
            return await copyLinkAndTitleToClipboard();
        });
        item.addEventListener('keydown', async function(event) {
            if (event.key === " ") {
                // To meet success criteria for WCAG 2.1.1 and 2.1.3
                event.stopPropagation();
                event.preventDefault();
                return await copyLinkAndTitleToClipboard();
            }
            return true;
        });
        shareList.insertAdjacentElement('afterbegin', item);
    }
}

window.onload = addClipboardShareOption;
