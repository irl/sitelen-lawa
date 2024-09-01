
export function addButtonHandler(element: HTMLElement, handler: CallableFunction) {
    element.addEventListener('click', (e) => {
        e.preventDefault();
        handler();
    });
    element.addEventListener('keydown', (e) => {
        if (e.key === ' ') {
            e.preventDefault();
            e.stopPropagation();
            handler();
        }
    });
}
