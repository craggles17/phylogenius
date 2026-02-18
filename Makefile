.PHONY: all cards rulebook pdf clean dev install cards-cambrian cards-human cards-evo

# Default target
all: cards rulebook pdf

# Install dependencies
install:
	npm install

# Generate all HTML cards
cards: install
	node scripts/build.js cards

# Generate HTML rulebook
rulebook: install
	node scripts/build.js rulebook

# Generate PDF from HTML rulebook
pdf: rulebook
	node scripts/build.js pdf

# Development watch mode
dev: install
	node scripts/build.js dev

# Clean generated files
clean:
	rm -rf dist/

# Individual deck targets for parallel execution
cards-cambrian: install
	node scripts/build.js cards --deck cambrian

cards-human: install
	node scripts/build.js cards --deck human

cards-evo: install
	node scripts/build.js cards --deck evo

# Parallel card generation
cards-parallel: install
	$(MAKE) -j3 cards-cambrian cards-human cards-evo

# Help target
help:
	@echo "Available targets:"
	@echo "  all            - Build everything (cards, rulebook, pdfs)"
	@echo "  cards          - Generate HTML cards for all decks"
	@echo "  rulebook       - Generate HTML rulebook"
	@echo "  pdf            - Generate all PDFs (rulebook + card sheets)"
	@echo "  dev            - Watch mode for development"
	@echo "  clean          - Remove dist/ directory"
	@echo "  install        - Install npm dependencies"
	@echo "  cards-parallel - Build all deck cards in parallel"
	@echo "  help           - Show this help"
	@echo ""
	@echo "Output files:"
	@echo "  dist/phylogenius-rulebook.pdf  - Complete rulebook"
	@echo "  dist/cambrian-cards.pdf        - Cambrian deck print sheets"
	@echo "  dist/human-cards.pdf           - Human genetics print sheets"
	@echo "  dist/evo-cards.pdf             - Universal evo print sheets"

