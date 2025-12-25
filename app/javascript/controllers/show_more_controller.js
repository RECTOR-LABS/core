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

  updateVisibility() {
    const items = this.itemTargets
    const hiddenCount = items.length - this.limitValue

    items.forEach((item, index) => {
      if (index < this.limitValue) {
        item.classList.remove("hidden")
      } else {
        item.classList.toggle("hidden", !this.expandedValue)
      }
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
