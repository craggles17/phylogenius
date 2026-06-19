// Shared drag/drop + layout helpers. HTML5 drag-and-drop; payload as JSON.
// Keyboard support: pick with Enter/Space, drop with Enter/Space, cancel with Escape.

let keyboardPickedPayload = null

export function enableDrag(el, payload) {
    el.draggable = true
    el.tabIndex = 0
    el.addEventListener('dragstart', (e) => {
        e.dataTransfer.effectAllowed = 'move'
        e.dataTransfer.setData('text/plain', JSON.stringify(payload))
        el.classList.add('is-dragging')
    })
    el.addEventListener('dragend', () => el.classList.remove('is-dragging'))
    el.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault()
            keyboardPickedPayload = payload
            el.classList.add('is-dragging')
        } else if (e.key === 'Escape') {
            keyboardPickedPayload = null
            el.classList.remove('is-dragging')
        }
    })
    return el
}

export function makeDropZone(el, onDrop) {
    el.tabIndex = 0
    el.addEventListener('dragover', (e) => {
        e.preventDefault()
        e.dataTransfer.dropEffect = 'move'
        el.classList.add('is-over')
    })
    el.addEventListener('dragleave', () => el.classList.remove('is-over'))
    el.addEventListener('drop', (e) => {
        e.preventDefault()
        el.classList.remove('is-over')
        let payload = null
        try {
            payload = JSON.parse(e.dataTransfer.getData('text/plain'))
        } catch {
            payload = null
        }
        onDrop(payload, el)
    })
    el.addEventListener('keydown', (e) => {
        if ((e.key === 'Enter' || e.key === ' ') && keyboardPickedPayload) {
            e.preventDefault()
            onDrop(keyboardPickedPayload, el)
            keyboardPickedPayload = null
        } else if (e.key === 'Escape') {
            keyboardPickedPayload = null
            document.querySelectorAll('.is-dragging').forEach((item) => item.classList.remove('is-dragging'))
        }
    })
    return el
}

export function clearBoard(root) {
    while (root.firstChild) root.removeChild(root.firstChild)
    return root
}
