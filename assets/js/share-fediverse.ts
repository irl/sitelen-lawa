import {createShareOption, getShareData} from "./share";

const shareUrls = {
    /* Thanks https://palant.info/2023/10/19/implementing-a-share-on-mastodon-button-for-a-blog/ */
    "calckey": "share?text={text}",
    "diaspora": "bookmarklet?title={title}&notes={description}&url={url}",
    "fedibird": "share?text={text}",
    "firefish": "share?text={text}",
    "foundkey": "share?text={text}",
    "friendica": "compose?title={title}&body={description}%0A{url}",
    "glitchcafe": "share?text={text}",
    "gnusocial": "notice/new?status_textarea={text}",
    "hometown": "share?text={text}",
    "hubzilla": "rpost?title={title}&body={description}%0A{url}",
    "iceshrimp": "share?text={text}",
    "kbin": "new/link?url={url}",
    "mastodon": "share?text={text}",
    "meisskey": "share?text={text}",
    "microdotblog": "post?text=[{title}]({url})%0A%0A{description}",
    "misskey": "share?text={text}",
    "sharkey": "share?text={text}"
}

async function getNodeInfo(domain: string) {
    try {
        const response = await fetch(`https://${domain}/.well-known/nodeinfo`);
        if (!response.ok) {
            throw new Error(`Failed to fetch .well-known/nodeinfo: ${response.status}`);
        }
        const data = await response.json();
        const nodeInfoLink = data.links.find(link => link.rel === "http://nodeinfo.diaspora.software/ns/schema/2.0");

        if (nodeInfoLink) {
            const nodeInfoResponse = await fetch(nodeInfoLink.href);
            if (!nodeInfoResponse.ok) {
                console.error(`Error: Failed to fetch NodeInfo JSON from ${nodeInfoLink.href}: ${nodeInfoResponse.status}`);
                return null;
            }
            return await nodeInfoResponse.json();
        } else {
            console.error("Error: Link with the specified rel not found");
            return null;
        }
    } catch (error) {
        console.error("Error:", error);
        return null;
    }
}

function showModal() {
    let modal = document.getElementById('app-share-fedi-dialog');
    if (!modal) {
        modal = document.createElement('div');
        document.body.appendChild(modal);
    }
    modal.id = 'app-share-fedi-dialog';
    modal.className = 'app-modal';
    modal.setAttribute('role', 'dialog');
    modal.setAttribute('aria-labelledby', 'app-share-dialog__title');
    modal.setAttribute('aria-modal', 'true');

    modal.innerHTML = `
        <div class="app-modal__content" role="alert">
            <div class="govuk-form-group" id="app-share-fedi-dialog__domain-group">
            <h1 id="app-share-fedi-dialog__title" class="govuk-label-wrapper">
            <label class="govuk-label govuk-label--m" for="app-share-fedi-dialog__domain">
                Enter the domain name of your Fediverse instance
            </label>
            </h1>
            <div class="govuk-hint" id="app-share-fedi-dialog__domain-hint">
                For example: hackers.town
            </div>
            <input class="govuk-input" id="app-share-fedi-dialog__domain" type="text" autocapitalize="off" autocomplete="off">
            </div>
            <div class="govuk-checkboxes__item">
                <input class="govuk-checkboxes__input" id="app-share-fedi-dialog__save" type="checkbox">
                <label class="govuk-label govuk-checkboxes__label" for="app-share-fedi-dialog__save">
                    Save for next time
                </label>
            </div>
            
            <button class="govuk-button govuk-!-margin-0" id="app-share-fedi-dialog__share">Share</button>
            <button class="govuk-button govuk-button--secondary govuk-!-margin-0" id="app-share-fedi-dialog__cancel">Cancel</button>
        </div>
    `;

    const storedDomain = localStorage.getItem("fediverse-instance");
    if (storedDomain) {
        document.getElementById("app-share-fedi-dialog__domain").value = storedDomain;
        document.getElementById("app-share-fedi-dialog__save").checked = true;
    }
    document.getElementById('app-share-fedi-dialog__domain').focus();
    document.addEventListener('keydown', keydownHandler);

    const domainInput = document.getElementById('app-share-fedi-dialog__domain');
    domainInput.addEventListener('keydown', async (e) => {
        if (e.key === 'Enter') {
            await shareWithFedi();
            e.preventDefault();
            e.stopPropagation();
            return false;
        }
    })

    const saveInput = document.getElementById('app-share-fedi-dialog__save');
    saveInput.addEventListener('keydown', async (e) => {
        if (e.key === 'Enter') {
            await shareWithFedi();
            e.preventDefault();
            e.stopPropagation();
            return false;
        }
    })

    const shareButton = document.getElementById('app-share-fedi-dialog__share');
    shareButton.addEventListener('click', async (e) => {
        await shareWithFedi();
        e.preventDefault();
        return false;
    })
    shareButton.addEventListener('keydown', async (e) => {
        if (e.key === 'Space') {
            await shareWithFedi();
            e.preventDefault();
            e.stopPropagation();
            return false;
        }
    });

    const cancelButton = document.getElementById('app-share-fedi-dialog__cancel');
    cancelButton.addEventListener('click', (e) => {
        closeModal();
        e.preventDefault();
        return false;
    });
    cancelButton.addEventListener('keydown', (e) => {
        if (e.key === 'Space') {
            closeModal();
            e.preventDefault();
            e.stopPropagation();
            return false;
        }
    });
}

function closeModal() {
    const modal = document.getElementById('app-share-fedi-dialog');
    if (modal) {
        modal.remove();
    }
    document.getElementById('app-share-fedi').focus();
    document.removeEventListener('keydown', keydownHandler);
}

function keydownHandler(event) {
    if (event.key === 'Tab') {
        // Trap focus
        const modal = document.getElementById('app-share-fedi-dialog');
        const focusableElements = modal.querySelectorAll('input, button');
        const firstElement = focusableElements[0];
        const lastElement = focusableElements[focusableElements.length - 1];

        if (event.shiftKey) {
            if (document.activeElement === firstElement) {
                lastElement.focus();
                event.preventDefault();
            }
        } else {
            if (document.activeElement === lastElement) {
                firstElement.focus();
                event.preventDefault();
            }
        }
    } else if (event.key === 'Escape') {
        closeModal();
    }
}

async function shareWithFedi() {
    const shareData = getShareData();
    const instanceDomain = document.getElementById('app-share-fedi-dialog__domain').value;
    if (!instanceDomain) {
        document.getElementById('app-share-fedi-dialog__domain').classList.add('govuk-input--error');
        document.getElementById('app-share-fedi-dialog__domain').setAttribute('aria-invalid', 'true');
        document.getElementById('app-share-fedi-dialog__domain').insertAdjacentHTML('beforebegin', '<span class="govuk-error-message" role="alert">A domain name must be specified</span>');
        document.getElementById('app-share-fedi-dialog__domain-group').classList.add('govuk-form-group--error');
        return false;
    }
    const nodeInfo = await getNodeInfo(instanceDomain);
    if (!nodeInfo?.software?.name || !(nodeInfo.software.name in shareUrls)) {
        const modal = document.getElementById('app-share-fedi-dialog');
        modal.innerHTML = `
            <div class="app-modal__content" role="alert">
                <h1 id="app-share-fedi-dialog__title" class="govuk-heading-m">Unknown software type</h1>
                <p class="govuk-body">Unable to determine the software running on ${instanceDomain}.</p>
                <p class="govuk-body">Use the "Copy to clipboard" share feature instead to manually share this post.</p>
                <button class="govuk-button govuk-!-margin-0" id="app-share-fedi-dialog__cancel">Close</button>
            </div>
        `;
        const cancelButton = document.getElementById('app-share-fedi-dialog__cancel');
        cancelButton.addEventListener('click', (e) => {
            closeModal();
            e.preventDefault();
            return false;
        });
        cancelButton.addEventListener('keydown', (e) => {
            if (e.key === 'Space') {
                closeModal();
                e.preventDefault();
                e.stopPropagation();
                return false;
            }
        });
        cancelButton.focus();
        return false;
    }
    if (document.getElementById('app-share-fedi-dialog__save').checked) {
        localStorage.setItem("fediverse-instance", instanceDomain);
    } else {
        localStorage.removeItem("fediverse-instance");
    }
    closeModal();
    window.open(
        "https://" + instanceDomain + "/" + shareUrls[nodeInfo.software.name]
            .replace("{text}", encodeURIComponent(`${shareData.title} - ${shareData.url}`))
            .replace("{url}", encodeURIComponent(shareData.url))
            .replace("{title}", encodeURIComponent(shareData.title))
            .replace("{description}", encodeURIComponent(shareData.description)),
        "_blank",
        "noopener"
    )
    return false;
}

export function addFediShareOption(shareList) {
    const item = createShareOption("app-share-fedi",
        "fa-brands fa-fw fa-mastodon", shareList.dataset.fediverseText, showModal);
    const whatsappItem = shareList.querySelector("a[href*='api.whatsapp.com']").closest("li");
    whatsappItem.parentNode.insertBefore(item, whatsappItem.nextSibling);
}
