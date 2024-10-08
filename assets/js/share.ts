import {addNativeShareOption} from "./share-api";
import {addClipboardShareOption} from "./share-clipboard";
import {addFediShareOption} from "./share-fediverse";

export function getShareData() {
    return {
        url: document.querySelector("meta[property='og:url']").getAttribute('content'),
        title: document.querySelector("meta[property='og:title']").getAttribute('content'),
        description: document.querySelector("meta[property='og:description']").getAttribute('content'),
    };
}

export function createShareOption(id, icon, text, handler) {
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

export function setupShareOptions() {
    const shareList = document.querySelector("#app-share-list");
    if (!shareList) return;
    addClipboardShareOption(shareList);
    addFediShareOption(shareList);
    addNativeShareOption(shareList);
}
