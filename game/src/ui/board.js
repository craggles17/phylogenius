// Shared placement helpers. Three input paths, one model:
//   • mouse drag  — HTML5 dataTransfer (desktop only; dead on touch)
//   • tap / click — pick a card, then tap a target (works everywhere, incl. mobile)
//   • keyboard    — Enter/Space to pick, Enter/Space on a target to drop, Escape cancels
// Tap and keyboard share one "picked" card; picking highlights it (.card--selected),
// tapping a drop target places it. This is what makes the drag modes touch-playable.

let picked = null

function clearPicked() {
    picked = null
    document.querySelectorAll('.card--selected').forEach((c) => c.classList.remove('card--selected'))
}

function pick(el, payload) {
    const alreadyPicked = el.classList.contains('card--selected')
    clearPicked()
    if (alreadyPicked) return // tapping the selected card again deselects it
    picked = payload
    el.classList.add('card--selected')
}

function place(onDrop, el) {
    if (!picked) return
    const payload = picked
    clearPicked()
    onDrop(payload, el)
}

export function enableDrag(el, payload) {
    el.draggable = true
    el.tabIndex = 0
    el.addEventListener('dragstart', (e) => {
        e.dataTransfer.effectAllowed = 'move'
        e.dataTransfer.setData('text/plain', JSON.stringify(payload))
        el.classList.add('is-dragging')
    })
    el.addEventListener('dragend', () => el.classList.remove('is-dragging'))
    el.addEventListener('click', () => pick(el, payload))
    el.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault()
            pick(el, payload)
        } else if (e.key === 'Escape') {
            clearPicked()
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
    el.addEventListener('click', () => place(onDrop, el))
    el.addEventListener('keydown', (e) => {
        if ((e.key === 'Enter' || e.key === ' ') && picked) {
            e.preventDefault()
            place(onDrop, el)
        } else if (e.key === 'Escape') {
            clearPicked()
        }
    })
    return el
}

export function clearBoard(root) {
    while (root.firstChild) root.removeChild(root.firstChild)
    return root
}
