// Clade legend: maps emoji -> clade name + description

const CLADE_INFO = [
    { emoji: '🦠', name: 'Basal', desc: 'Pre-bilaterian, single-celled origins (prokaryotes, eukaryotes, early multicellular life)' },
    { emoji: '🪼', name: 'Cnidaria', desc: 'Jellyfish, corals, anemones (radially symmetric animals)' },
    { emoji: '🐛', name: 'Worms', desc: 'Annelids, priapulids, nematodes (segmented and unsegmented worm-like animals)' },
    { emoji: '🦑', name: 'Mollusca/Cephalopod', desc: 'Squids, octopuses, cuttlefish (intelligent soft-bodied molluscs)' },
    { emoji: '🐚', name: 'Mollusca', desc: 'Snails, bivalves, other molluscs (soft-bodied shell-bearing animals)' },
    { emoji: '🐟', name: 'Fish/Aquatic Vertebrate', desc: 'Fish and aquatic vertebrates (early vertebrate evolution)' },
    { emoji: '🦎', name: 'Reptile/Amniote', desc: 'Reptiles, early amniotes (egg-laying vertebrates, scales)' },
    { emoji: '🐁', name: 'Mammal', desc: 'Mammals (warm-blooded, fur-bearing vertebrates)' },
    { emoji: '🐦', name: 'Bird', desc: 'Birds (feathered, flying vertebrates)' },
    { emoji: '🌿', name: 'Plant/Convergent', desc: 'Plants or convergently evolved traits (evolved independently across lineages)' },
]

export function renderLegend() {
    const root = document.createElement('div')
    root.className = 'legend'

    const header = document.createElement('div')
    header.className = 'legend__header'
    header.textContent = 'Clade Legend'
    root.append(header)

    const content = document.createElement('div')
    content.className = 'legend__content'

    for (const { emoji, name, desc } of CLADE_INFO) {
        const row = document.createElement('div')
        row.className = 'legend__row'

        const icon = document.createElement('span')
        icon.className = 'legend__emoji'
        icon.textContent = emoji

        const info = document.createElement('div')
        info.className = 'legend__info'

        const title = document.createElement('strong')
        title.textContent = name

        const description = document.createElement('span')
        description.className = 'legend__desc'
        description.textContent = desc

        info.append(title, ' — ', description)
        row.append(icon, info)
        content.append(row)
    }

    const note = document.createElement('p')
    note.className = 'legend__note'
    note.textContent = 'Note: The human genetics deck uses regional/population markers (flags) instead of clade markers.'

    root.append(content, note)
    return root
}

export function renderLegendToggle(onToggle) {
    const btn = document.createElement('button')
    btn.className = 'legend__toggle'
    btn.textContent = '📖 Legend'
    btn.addEventListener('click', onToggle)
    return btn
}
