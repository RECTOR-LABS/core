import { Controller } from "@hotwired/stimulus"

export default class extends Controller {
  static targets = ["card", "filterChip", "sortButton", "noResults", "counter"]
  static values = {
    selectedTechs: { type: Array, default: [] },
    sortBy: { type: String, default: "date" }
  }

  connect() {
    this.readFromURL()
    this.applyFiltersAndSort()
  }

  // Toggle a technology filter (multi-select)
  toggleFilter(event) {
    const tech = event.currentTarget.dataset.tech

    if (tech === "all") {
      this.selectedTechsValue = []
    } else {
      const techs = [...this.selectedTechsValue]
      const index = techs.indexOf(tech)

      if (index > -1) {
        techs.splice(index, 1)
      } else {
        techs.push(tech)
      }

      this.selectedTechsValue = techs
    }

    this.updateFilterChipStates()
    this.applyFiltersAndSort()
    this.updateURL()
  }

  // Set sort order
  setSort(event) {
    this.sortByValue = event.currentTarget.dataset.sort
    this.updateSortButtonStates()
    this.applyFiltersAndSort()
    this.updateURL()
  }

  // Apply both filters and sorting
  applyFiltersAndSort() {
    const cards = this.cardTargets
    const container = cards[0]?.parentElement
    if (!container) return

    // Filter cards
    let visibleCards = []
    let hiddenCount = 0

    cards.forEach(card => {
      const cardTechs = JSON.parse(card.dataset.technologies || "[]")
        .map(t => t.toLowerCase())

      const matchesFilter = this.selectedTechsValue.length === 0 ||
        this.selectedTechsValue.some(tech => cardTechs.includes(tech.toLowerCase()))

      if (matchesFilter) {
        card.classList.remove("filter-hidden")
        visibleCards.push(card)
      } else {
        card.classList.add("filter-hidden")
        hiddenCount++
      }
    })

    // Sort visible cards
    visibleCards.sort((a, b) => {
      switch (this.sortByValue) {
        case "stars":
          return (parseInt(b.dataset.stars) || 0) - (parseInt(a.dataset.stars) || 0)
        case "commits":
          return (parseInt(b.dataset.commits) || 0) - (parseInt(a.dataset.commits) || 0)
        case "alpha":
          return (a.dataset.title || "").localeCompare(b.dataset.title || "")
        case "date":
        default:
          return new Date(b.dataset.date || 0) - new Date(a.dataset.date || 0)
      }
    })

    // Reorder DOM
    visibleCards.forEach(card => container.appendChild(card))

    // Update counter
    if (this.hasCounterTarget) {
      this.counterTarget.textContent = `${visibleCards.length} project${visibleCards.length !== 1 ? 's' : ''}`
    }

    // Show/hide no results message
    if (this.hasNoResultsTarget) {
      this.noResultsTarget.classList.toggle("hidden", visibleCards.length > 0)
    }

    // Dispatch event for show-more controller to recalculate
    this.dispatch("filtered", { detail: { visibleCount: visibleCards.length } })
  }

  // Update filter chip visual states
  updateFilterChipStates() {
    this.filterChipTargets.forEach(chip => {
      const tech = chip.dataset.tech

      if (tech === "all") {
        chip.classList.toggle("active", this.selectedTechsValue.length === 0)
      } else {
        chip.classList.toggle("active", this.selectedTechsValue.includes(tech))
      }
    })
  }

  // Update sort button visual states
  updateSortButtonStates() {
    this.sortButtonTargets.forEach(btn => {
      btn.classList.toggle("active", btn.dataset.sort === this.sortByValue)
    })
  }

  // Read state from URL params
  readFromURL() {
    const params = new URLSearchParams(window.location.search)

    const techParam = params.get("tech")
    if (techParam) {
      this.selectedTechsValue = techParam.split(",").filter(t => t)
    }

    const sortParam = params.get("sort")
    if (sortParam && ["date", "stars", "commits", "alpha"].includes(sortParam)) {
      this.sortByValue = sortParam
    }

    this.updateFilterChipStates()
    this.updateSortButtonStates()
  }

  // Update URL without page reload
  updateURL() {
    const params = new URLSearchParams()

    if (this.selectedTechsValue.length > 0) {
      params.set("tech", this.selectedTechsValue.join(","))
    }

    if (this.sortByValue !== "date") {
      params.set("sort", this.sortByValue)
    }

    const newURL = params.toString()
      ? `${window.location.pathname}?${params.toString()}`
      : window.location.pathname

    window.history.replaceState({}, "", newURL)
  }
}
