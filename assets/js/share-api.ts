import {createShareOption, getShareData} from "./share";

async function shareWithApi() {
    const shareData = getShareData();
    await navigator.share(shareData);
    return false;
}

export function addNativeShareOption(shareList) {
    const shareData = getShareData();
    if (navigator.canShare && navigator.canShare(shareData)) {
        const item = createShareOption("app-share-native",
            "fa-regular fa-fw fa-share", shareList.dataset.moreText, shareWithApi);
        shareList.insertAdjacentElement('beforeend', item);
    }
}
