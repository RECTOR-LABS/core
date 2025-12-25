import { Controller } from "@hotwired/stimulus"

export default class extends Controller {
  static targets = ["item", "button"]
  static values = {
    limit: { type: Number, default: 12 },
    expanded: { type: Boolean, default: false }
  }

  connect() {
    this.updateVisibility()
  }

  toggle() {
    this.expandedValue = !this.expandedValue
    this.updateVisibility()
  }

  // Called when filter-sort dispatches 'filtered' event
  handleFilter() {
    // Reset to collapsed state when filters change
    this.expandedValue = false
    this.updateVisibility()
  }

  updateVisibility() {
    // Only count items that aren't filtered out
    const visibleItems = this.itemTargets.filter(
      item => !item.classList.contains("filter-hidden")
    )
    const hiddenCount = visibleItems.length - this.limitValue

    // Apply show-more visibility to visible items only
    let visibleIndex = 0
    this.itemTargets.forEach(item => {
      // Skip filtered items - they're hidden by filter-sort
      if (item.classList.contains("filter-hidden")) {
        return
      }

      // Apply show-more logic to visible items
      if (visibleIndex < this.limitValue) {
        item.classList.remove("show-more-hidden")
      } else {
        item.classList.toggle("show-more-hidden", !this.expandedValue)
      }
      visibleIndex++
    })

    // Update button text
    if (this.hasButtonTarget) {
      if (hiddenCount <= 0) {
        this.buttonTarget.classList.add("hidden")
      } else {
        this.buttonTarget.classList.remove("hidden")
        this.buttonTarget.textContent = this.expandedValue
          ? "Show less"
          : `Show ${hiddenCount} more`
      }
    }
  }
}
