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
        } catch (err) {
            console.error('Error copying text: ', err);
            fallbackCopyTextToClipboard(text);
        }
    }
}

function getShareData() {
    return {
        title: document.querySelector("meta[property='og:title']").getAttribute('content'),
        url: document.querySelector("meta[property='og:url']").getAttribute('content')
    };
}

async function shareWithClipboard() {
    const shareData = getShareData();
    const text = shareData.title + " " + shareData.url;
    await copyToClipboard(text);
    return false;
}

async function shareWithApi() {
    const shareData = getShareData();
    await navigator.share(shareData);
    return false;
}

function createShareOption(id, icon, text, handler) {
    const item = document.createElement("li");
    item.className = 'app-links-list-item';
    item.innerHTML = `
    <a href="#" role="button" id="${id}">
        <i class="${icon}" aria-hidden="true"></i>
        <span class="app-links-list-item-text">${text}</span>
    </a>
    `;
    item.addEventListener('click', async function (event) {
        return await handler(event);
    });
    item.addEventListener('keypress', async function (event) {
        if (event.key === " ") {
            // To meet success criteria for WCAG 2.1.1 and 2.1.3
            event.stopPropagation();
            event.preventDefault();
            return await handler(event);
        }
        return true;
    });
    return item;
}

function addClipboardShareOption(shareList) {
    const item = createShareOption("app-share-clipboard",
        "las la-clipboard", shareList.dataset.copyText, shareWithClipboard);
    shareList.insertAdjacentElement('afterbegin', item);
}

function addNativeShareOption(shareList) {
    const shareData = getShareData();
    if (navigator.canShare && navigator.canShare(shareData)) {
        const item = createShareOption("app-share-native",
            "las la-share", shareList.dataset.moreText, shareWithApi);
        shareList.insertAdjacentElement('beforeend', item);
    }
}

function setupShareOptions() {
    try {
        const shareList = document.querySelector("#app-share-list");
        addClipboardShareOption(shareList);
        addNativeShareOption(shareList);
    } catch (e) {
        if (!(e instanceof DOMException)) {
            console.error(e);
        }
    }
}

window.onload = setupShareOptions;
