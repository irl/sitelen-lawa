import {copyToClipboard} from "./clipboard";
import {createShareOption, getShareData} from './share';

async function shareWithClipboard() {
    const shareData = getShareData();
    const text = shareData.title + " " + shareData.url;
    await copyToClipboard(text);
    return false;
}

export function addClipboardShareOption(shareList) {
    const item = createShareOption("app-share-clipboard",
        "las la-clipboard", shareList.dataset.copyText, shareWithClipboard);
    shareList.insertAdjacentElement('afterbegin', item);
}
