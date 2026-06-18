// Extract card objects from parsed tables

import { extractTablesFromMarkdown, findCardTables } from './table-parser.js'
import { getColorForSuit, getEraColor } from '../utils/color-utils.js'
import { resolvePrereqIds } from './trait-aliases.js'

export function extractCardsFromMarkdown(markdown, deckType) {
  const tables = extractTablesFromMarkdown(markdown)
  const cardTables = findCardTables(tables)

  const cards = []
  for (const table of cardTables) {
    const suit = extractSuitFromTitle(table.title)
    for (const row of table.rows) {
      const card = buildCard(row, suit, deckType, table.title)
      if (card) cards.push(card)
    }
  }

  return resolveConnections(cards)
}

// Resolve free-text prereq/enables into card ids once the whole deck is known.
function resolveConnections(cards) {
  for (const card of cards) {
    card.prereqIds = resolvePrereqIds(card.prereq, cards, card.id)
    card.enableIds = resolvePrereqIds(card.enables, cards, card.id)
  }
  return cards
}

function extractSuitFromTitle(title) {
  // Title format: "🌀 Body Plan (16 cards)" or "Body Plan"
  const match = title.match(/^[^\w]*\s*(.+?)\s*\(?\d*\s*cards?\)?$/i)
  if (match) return match[1].trim()
  
  // Try extracting just the text part
  return title.replace(/[^\w\s]/g, '').trim().split(/\s+/).slice(0, 2).join(' ')
}

function buildCard(row, suit, deckType, tableTitle) {
  // Handle special cards differently
  if (tableTitle.toLowerCase().includes('special')) {
    return buildSpecialCard(row, deckType)
  }

  // Standard card for Cambrian/Evo decks (MYA-based)
  if (deckType === 'cambrian' || deckType === 'evo') {
    return buildTemporalCard(row, suit, deckType)
  }

  // Human genetics deck (frequency-based)
  if (deckType === 'human') {
    return buildGeneticsCard(row, suit)
  }

  return null
}

function buildTemporalCard(row, suit, deckType) {
  const id = row[''] || row['_'] || row['number'] || ''
  const trait = row['trait'] || ''
  if (!trait) return null

  const mya = parseNumber(row['mya'])
  const era = row['era'] || ''
  const clade = row['clade'] || ''
  const prereq = row['prereq'] || ''
  const enables = row['enables'] || ''

  const colors = getColorForSuit(deckType, suit)
  const eraColor = getEraColor(era)

  return {
    id,
    type: 'temporal',
    deckType,
    trait,
    suit,
    mya,
    era,
    eraColor,
    clade,
    prereq,
    enables,
    colors,
    flavour: generateFlavour(trait, mya)
  }
}

function buildGeneticsCard(row, suit) {
  const id = row[''] || row['_'] || row['number'] || ''
  const trait = row['trait'] || ''
  if (!trait) return null

  const gene = row['gene'] || ''
  const rsid = row['rsid'] || ''
  const globalPercent = parsePercent(row['global'] || row['global__'] || row['global_percent'] || '')
  const peak = row['peak_region'] || ''
  const effect = row['effect'] || ''
  const h2 = parseNumber(row['h'] || row['h_'] || row['h2'] || '0.5')

  const colors = getColorForSuit('human', suit)

  return {
    id,
    type: 'genetics',
    deckType: 'human',
    trait,
    suit,
    gene,
    rsid,
    globalPercent,
    peak,
    effect,
    h2,
    colors,
    flavour: generateGeneticsFlavour(trait, gene)
  }
}

function buildSpecialCard(row, deckType) {
  const id = row[''] || row['_'] || row['number'] || ''
  const card = row['card'] || row['trait'] || ''
  const effect = row['effect'] || ''
  
  if (!card) return null

  const colors = getColorForSuit(deckType, 'Special')

  return {
    id,
    type: 'special',
    deckType,
    trait: card,
    suit: 'Special',
    effect,
    colors,
    isWild: effect.toLowerCase().includes('wild'),
    flavour: effect
  }
}

function parseNumber(str) {
  if (!str) return 0
  const num = parseFloat(str.replace(/[^0-9.-]/g, ''))
  return isNaN(num) ? 0 : num
}

function parsePercent(str) {
  if (!str) return 0
  const match = str.match(/(\d+(?:\.\d+)?)\s*%?/)
  return match ? parseFloat(match[1]) : 0
}

function generateFlavour(trait, mya) {
  const flavours = {
    // Evo deck traits - researched scientific fun facts
    'Multicellularity': 'The same innovation evolved independently at least twenty-five different times across the tree of life',
    'Bilateral Symmetry': 'This body plan enabled animals to develop a front and back, revolutionizing movement and sensory organization',
    'Exoskeleton': 'Arthropods must molt their rigid outer shell to grow, leaving them temporarily vulnerable',
    'Notochord': 'This flexible rod of cells provides support and serves as a blueprint for the spine',
    'Vertebral Column': 'The segmented backbone allows flexibility while protecting the spinal cord',
    'Jaws': 'This innovation transformed filter-feeders into predators and opened up entirely new ecological niches',
    'Bony Skeleton': 'Unlike cartilage, bone serves as a mineral reservoir and produces blood cells',
    'Lobed Fins': 'These muscular, bone-supported fins were pre-adaptations that made walking on land possible',
    'Four Limbs': 'All tetrapod limbs share the same basic bone pattern despite wildly different functions',
    'Digits (Fingers/Toes)': 'The number of fingers and toes has varied wildly through evolution, with early tetrapods sporting up to eight per limb',
    'Ribcage': 'This bony cage protects vital organs while allowing the lungs to expand and contract',
    'Shell (Turtle)': 'The turtle shell is actually modified ribs and vertebrae fused with the skin',
    'Hollow Bones': 'Bird bones are filled with air sacs that connect to the lungs, making them strong yet lightweight',
    'Antlers/Horns': 'Antlers are shed and regrown annually, while horns grow continuously throughout life',
    'Opposable Thumb': 'This trait allows precision gripping and is found in primates, opossums, and some frogs',
    'Bipedal Skeleton': 'Walking upright freed the hands for tool use but made childbirth more difficult',
    'Photoreceptor Cells': 'Even single-celled organisms can detect light using simple light-sensitive proteins',
    'Camera Eye': 'The octopus eye evolved completely independently from the vertebrate eye yet works remarkably similarly',
    'Compound Eye': 'Each tiny lens in a compound eye captures a single pixel of the overall image',
    'Lateral Line': 'This sensory system detects water movement and vibrations, essentially allowing fish to "feel" at a distance',
    'Electroreception': 'Some fish can detect the weak electrical fields generated by muscle contractions in prey',
    'Inner Ear': 'The semicircular canals detect rotation while otoliths detect linear acceleration and gravity',
    'Tongue': 'The chameleon tongue can extend more than twice the body length in a fraction of a second',
    'Eyelids': 'The third eyelid, or nictitating membrane, sweeps across the eye horizontally in many animals',
    'Jacobson\'s Organ': 'Snakes "smell" by flicking their tongue to collect particles and delivering them to this specialized sensor',
    'Pit Organs': 'Pit vipers can detect temperature differences as small as a fraction of a degree to locate warm-blooded prey',
    'Echolocation': 'Bats and dolphins independently evolved this sonar ability using completely different anatomical structures',
    'External Ears (Pinnae)': 'The complex folds of the outer ear help pinpoint sound direction in three dimensions',
    'Whiskers (Vibrissae)': 'Each whisker has its own dedicated section of the brain for processing touch information',
    'Trichromatic Vision': 'Most mammals lost color vision, but primates regained it to spot ripe fruit',
    'Fovea': 'This tiny pit in the retina is packed with color-detecting cones for sharp central vision',
    'Magnetoreception': 'Many animals can sense Earth\'s magnetic field, though the exact mechanism remains mysterious',
    'Sexual Reproduction': 'Mixing genes from two parents creates genetic diversity that helps populations adapt',
    'Gamete Dimorphism': 'Eggs are large and nutrient-rich while sperm are tiny and numerous, a fundamental asymmetry driving sexual selection',
    'External Fertilisation': 'Broadcasting millions of eggs and sperm into the water is energetically cheap but wasteful',
    'Internal Fertilisation': 'Mating directly increases the chance that sperm meets egg but requires complex anatomical adaptations',
    'Copulatory Organs': 'These structures evolved independently in many lineages, from insects to mammals',
    'Orgasm': 'This pleasure response likely evolved to motivate mating behavior in species with internal fertilization',
    'Amniotic Egg': 'The shell and membranes create a self-contained aquatic environment, freeing reproduction from water',
    'Viviparity (Live Birth)': 'Giving birth to live young evolved independently in fish, reptiles, and mammals',
    'Yolk Sac Placenta': 'This simple placenta transfers nutrients from a yolk sac rather than directly from maternal blood',
    'Mammary Glands': 'These modified sweat glands provide custom-tailored nutrition that changes as offspring grow',
    'Nipples': 'Monotremes like platypuses lack nipples and instead secrete milk through pores in the skin',
    'True Placenta': 'The intimate connection between maternal and fetal blood supplies allows extended development',
    'Egg Tooth': 'This temporary tooth or scale helps hatchlings break through their shell and is later shed',
    'Nest Building': 'Some fish, insects, and birds create elaborate structures to protect eggs and young',
    'Menstrual Cycle': 'Only a few mammal species menstruate; most reabsorb the uterine lining instead',
    'Menopause': 'Extended post-reproductive life is rare in nature and may have evolved to support grandchildren',
    'Aerobic Respiration': 'Using oxygen to burn fuel generates far more energy than anaerobic metabolism',
    'Digestive Tract': 'The specialized regions of the gut allow sequential processing of food',
    'Anus': 'A separate waste exit allows continuous one-way food processing',
    'Flatulence Capability': 'Intestinal gas is produced by gut bacteria fermenting undigested food',
    'Gills': 'These feathery structures maximize surface area for extracting dissolved oxygen from water',
    'Swim Bladder': 'This gas-filled organ evolved from a primitive lung and controls buoyancy',
    'Lungs': 'Air-breathing organs evolved from outpocketings of the digestive tract',
    'Four-Chambered Heart': 'Complete separation of oxygen-rich and oxygen-poor blood maximizes metabolic efficiency',
    'Endothermy (Warm-blood)': 'Maintaining constant body temperature allows activity in cold environments but requires enormous energy',
    'Hair/Fur': 'Each strand is dead keratin produced by a living follicle buried in the skin',
    'Feathers': 'These complex structures are modified scales that provide insulation and enable flight',
    'Sweat Glands': 'Evaporative cooling allows sustained running in hot conditions, a key human hunting adaptation',
    'Brown Fat': 'This specialized tissue generates heat by burning fat without producing ATP',
    'Ruminant Digestion': 'Multiple stomach chambers and symbiotic microbes allow herbivores to digest cellulose',
    'Torpor/Hibernation': 'Dropping body temperature dramatically reduces energy needs during food scarcity',
    'Alcohol Metabolism': 'This enzyme system originally evolved to process fermented fruit',
    'Neurons': 'These specialized cells use electrical and chemical signals to transmit information rapidly',
    'Cephalisation': 'Concentrating sense organs and processing power at the front end creates a head',
    'Brain': 'This centralized command center allows complex processing and coordinated responses',
    'Cerebellum': 'This structure coordinates movement and maintains balance, making athletic feats possible',
    'Sleep': 'This vulnerable state is universal in animals with nervous systems, suggesting vital restorative functions',
    'REM Sleep': 'The brain is highly active during this phase, and most vivid dreaming occurs here',
    'Limbic System': 'This ancient brain region generates emotions and motivation',
    'Play Behaviour': 'Juvenile play helps develop physical and social skills in a safe context',
    'Neocortex': 'This wrinkled outer brain layer handles abstract thought, planning, and language',
    'Neocortex Expansion': 'The human brain is not simply larger but has a vastly expanded outer layer',
    'Vocal Learning': 'Most animals inherit their calls, but humans, songbirds, and some cetaceans learn vocalizations culturally',
    'Language': 'The recursive grammar that allows infinite expression from finite elements appears unique to humans',
    // Cambrian deck traits - researched scientific fun facts
    'Prokaryotic Cell': 'These simple cells lack a nucleus and dominated Earth for billions of years',
    'Eukaryotic Cell': 'The nucleus and organelles arose when one cell engulfed another in an ancient symbiosis',
    'Colonial Organisation': 'Volvox colonies show division of labor, with some cells specialized for reproduction',
    'Radial Symmetry': 'A body plan with parts arranged around a central axis, like a wheel',
    'Body Cavity (Coelom)': 'This fluid-filled space cushions internal organs and allows them to move independently',
    'Segmentation': 'Repeating body units allowed evolutionary tinkering with specialized segments',
    'Tagmatisation': 'Fusion of body segments into functional units like head, thorax, and abdomen',
    'Pharyngeal Slits': 'These throat openings evolved for filter feeding but were later modified into gills',
    'Post-anal Tail': 'A muscular tail extending beyond the anus provides swimming power',
    'Skull': 'This bony or cartilaginous case protects the brain and supports sense organs',
    'Cell Wall': 'This rigid outer layer provides structural support in bacteria, plants, and fungi',
    'Collagen Matrix': 'This fibrous protein provides strength and flexibility to animal tissues',
    'Spicules': 'These tiny skeletal elements provide support in sponges and some other simple animals',
    'Chitin': 'This tough polysaccharide forms insect exoskeletons and fungal cell walls',
    'Mineralised Shell': 'Incorporating calcium carbonate or calcium phosphate creates hard protective structures',
    'Spines/Bristles': 'These defensive structures deter predators and can aid in movement',
    'Defensive Coiling': 'Many soft-bodied animals roll into a ball to protect vulnerable parts',
    'Ink Sac': 'Cephalopods eject dark fluid to confuse predators and escape',
    'Dermal Denticles': 'These tooth-like scales reduce drag and protect shark skin',
    'Bony Plates': 'Heavy armor provides excellent protection but reduces swimming speed',
    'Bony Scales': 'Overlapping scales combine protection with flexibility',
    'Venom Glands': 'Modified salivary glands produce toxic cocktails for hunting or defense',
    'Camouflage Cells': 'Chromatophores can rapidly change color and pattern for concealment',
    'Flagella': 'This whip-like appendage rotates like a propeller to move cells',
    'Cilia': 'These tiny hair-like structures beat in coordinated waves to move fluids or propel cells',
    'Muscular Hydrostatic': 'Fluid-filled chambers provide support and enable movement without a skeleton',
    'Jet Propulsion': 'Squids and octopuses forcefully expel water to swim backward rapidly',
    'Jointed Limbs': 'Articulated segments connected by flexible joints enable complex movements',
    'Biramous Limbs': 'These two-branched appendages can simultaneously swim and walk',
    'Parapodia': 'Fleshy paddle-like structures on each segment aid in swimming and respiration',
    'Tube Feet': 'These hydraulic structures allow echinoderms to grip surfaces and move slowly',
    'Paired Fins': 'Matched fins on each side provide stability and steering',
    'Sprawling Gait': 'Limbs projecting sideways produce a waddling walk seen in reptiles',
    'Wings (Insect)': 'These structures evolved from gill-like extensions and allow powered flight',
    'Phagocytosis': 'Cells engulf particles or other cells by wrapping membrane around them',
    'Filter Feeding': 'Straining tiny food particles from water is an ancient and efficient feeding strategy',
    'Digestive Cavity': 'A internal space where enzymes break down food externally to cells',
    'Through-Gut': 'A tubular digestive system with mouth and anus enables continuous feeding',
    'Radula': 'This ribbon of tiny teeth rasps algae from rocks or drills through shells',
    'Mandibles': 'These jaw-like structures bite and grind food in arthropods',
    'Proboscis': 'An extendable tubular mouthpart for piercing, sucking, or probing',
    'Tentacles': 'Flexible appendages for grasping, manipulating, or sensing',
    'Rasping Tongue': 'Lampreys use this tongue like a rasp to bore into fish flesh',
    'Teeth': 'Hard mineralized structures for gripping, cutting, or grinding',
    'Pharyngeal Teeth': 'A second set of jaws deep in the throat for processing food',
    'Diffusion Respiration': 'Small organisms absorb oxygen directly through their skin',
    'Gills (External)': 'Feathery gills provide large surface area but are vulnerable to damage',
    'Gills (Internal)': 'Protected gills inside the body cavity reduce damage while breathing',
    'Book Gills': 'Stacked gill lamellae resemble pages in a book and are found in horseshoe crabs',
    'Book Lungs': 'Modified gills adapted for breathing air in spiders and scorpions',
    'Tracheal System': 'Branching air tubes deliver oxygen directly to tissues in insects',
    'Cutaneous Respiration': 'Many amphibians absorb oxygen directly through moist skin',
    'Binary Fission': 'A simple cell splits into two identical daughter cells',
    'Larval Stage': 'A distinct juvenile form allows dispersal and reduces competition with adults',
    'Parental Care': 'Protecting and provisioning offspring increases their survival'
  }
  return flavours[trait] || ''
}

function generateGeneticsFlavour(trait, gene) {
  const flavours = {
    'Red-Green Colourblind': 'This X-linked trait is far more common in males than females',
    'Blue-Yellow Colourblind': 'This rare form affects the short-wavelength cones in the retina',
    'Tetrachromat': 'Some women have four types of color cones instead of three, potentially seeing millions more colors',
    'Supertaster (PTC)': 'Supertasters have more taste buds and find bitter compounds intensely unpleasant',
    'Non-taster (PTC)': 'Some people cannot taste certain bitter compounds that others find overwhelming',
    'Cilantro Soap': 'A genetic variant makes cilantro taste like soap or metal to some people',
    'Asparagus Smell': 'Only some people can smell the distinctive odor in urine after eating asparagus',
    'Photic Sneeze (ACHOO)': 'Bright light triggers sneezing in people with this autosomal dominant trait',
    'Pain Insensitivity': 'Rare mutations can eliminate the sensation of pain entirely, which is extremely dangerous',
    'Perfect Pitch': 'The ability to identify or produce musical notes without a reference is partly genetic',
    'Motion Sickness': 'Mismatch between visual and vestibular signals triggers nausea in susceptible individuals',
    'Misophonia': 'Certain sounds like chewing trigger intense emotional and physiological distress',
    'Lactase Persistent': 'The ability to digest milk sugar into adulthood evolved recently in dairy-farming populations',
    'Lactose Intolerant': 'Losing the ability to produce lactase after weaning is the ancestral human condition',
    'Alcohol Flush': 'A deficiency in the enzyme that breaks down acetaldehyde causes facial redness when drinking',
    'Coeliac Risk': 'Certain HLA variants greatly increase the risk of immune reactions to gluten',
    'FUT2 Secretor': 'This gene determines whether blood group antigens appear in saliva and other secretions',
    'Spicy Tolerance': 'Variations in capsaicin receptors affect how intensely people experience chili heat',
    'High Flatulence': 'Gut bacteria composition and digestive enzyme levels influence gas production',
    'Fructose Malabsorption': 'Some people poorly absorb fruit sugar, leading to digestive discomfort',
    'High Amylase': 'More copies of the amylase gene help digest starchy foods more efficiently',
    'Fast Caffeine': 'Rapid caffeine metabolism allows some people to drink coffee late without sleep disruption',
    'Thrifty Metabolism': 'This adaptation for food scarcity may increase obesity risk in modern environments',
    'Sprint Gene': 'A variant that builds fast-twitch muscle fibers enhances explosive power',
    'High VO2max': 'Genetic variants affecting oxygen utilization influence endurance capacity',
    'MTHFR Variant': 'This common variant affects folate metabolism and homocysteine levels',
    'Iron Overload': 'Hemochromatosis mutations cause excessive iron absorption and storage',
    'Vitamin D Efficient': 'Genetic variants affect how efficiently the body produces and uses vitamin D',
    'Wet Earwax': 'The dominant form produces sticky, wet earwax and stronger body odor',
    'Dry Earwax': 'This recessive trait produces flaky earwax and reduced body odor',
    'Freckles': 'Clusters of melanin appear in sun-exposed skin, especially in fair individuals',
    'Red Hair': 'The MC1R variant reduces dark pigment production, creating red hair and fair skin',
    'Widow\'s Peak': 'A V-shaped hairline point shows autosomal dominant inheritance',
    'Attached Earlobes': 'Whether earlobes hang free or attach directly shows simple genetic inheritance',
    'Cleft Chin': 'A dimple in the chin forms where the two sides of the jaw imperfectly fused',
    'Dimples': 'These facial indentations form where facial muscles attach differently to skin',
    'Blue Eyes': 'A single mutation near the OCA2 gene reduced melanin in the iris',
    'Green Eyes': 'This rare eye color results from low melanin combined with light scattering',
    'Heterochromia': 'Different colored eyes result from varied melanin distribution or mosaicism',
    'Unibrow': 'Hair growth patterns across the forehead are partly genetically determined',
    'Thick Hair': 'The EDAR variant increases hair shaft diameter and follicle density',
    'Male Pattern Bald': 'This X-linked trait shows earlier onset when inherited from the mother\'s side',
    'Early Grey Hair': 'Premature graying runs in families and relates to melanocyte decline',
    'Morning Person': 'Clock gene variants influence whether you\'re most alert in morning or evening',
    'Night Owl': 'Evening chronotypes may have slightly longer circadian periods',
    'Short Sleeper': 'Rare variants allow some people to function well on very little sleep',
    'Novelty Seeking': 'DRD4 variants influence exploratory behavior and risk-taking',
    'Warrior Gene': 'Low MAOA activity may increase impulsivity and aggression, especially in males',
    'High Empathy': 'Oxytocin receptor variants influence social bonding and empathy',
    'Optimism Bias': 'Genetic variants in serotonin systems affect baseline mood and outlook',
    'ADHD Risk': 'Multiple genetic variants affect dopamine signaling and attention regulation',
    'Malaria Resist (Sickle)': 'Sickle cell trait provides malaria protection but two copies cause disease',
    'Malaria Resist (Duffy)': 'The Duffy-negative blood type blocks a malaria parasite entry route',
    'HIV Resistance (CCR5)': 'A deletion in the CCR5 receptor prevents most HIV strains from entering cells',
    'Norovirus Resist': 'FUT2 non-secretors are resistant to the most common stomach flu strain',
    'Autoimmune Risk': 'HLA-B27 increases risk of several autoimmune inflammatory conditions',
    'Allergic Tendency': 'Genetic variants in immune signaling increase allergic sensitization',
    'Tall Stature': 'Height is highly polygenic with hundreds of contributing variants',
    'Double-Jointed': 'Joint hypermobility results from variants affecting connective tissue',
    'Dense Bones': 'LRP5 variants can dramatically increase bone density and fracture resistance',
    'Osteoporosis Risk': 'Low bone density has strong genetic components',
    'High Muscle Insert': 'Achilles tendon attachment point affects leverage and athletic performance',
    'Long Achilles': 'A longer Achilles tendon may enhance running economy',
    'Morton\'s Toe': 'The second toe is longer than the big toe in this variant foot structure'
  }
  return flavours[trait] || ''
}

export function groupCardsBySuit(cards) {
  const groups = {}
  for (const card of cards) {
    if (!groups[card.suit]) groups[card.suit] = []
    groups[card.suit].push(card)
  }
  return groups
}

export function sortCardsByValue(cards) {
  return [...cards].sort((a, b) => {
    if (a.mya !== undefined && b.mya !== undefined) {
      return b.mya - a.mya // Oldest first
    }
    if (a.globalPercent !== undefined && b.globalPercent !== undefined) {
      return a.globalPercent - b.globalPercent // Rarest first
    }
    return 0
  })
}

