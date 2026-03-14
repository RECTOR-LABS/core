import { Controller } from "@hotwired/stimulus"

// Animates a number counting up from 0 to a target value.
// Uses data-counter-number-value for animation target (integer).
// Uses data-counter-display-value for final formatted string (e.g., "$31,050+").
// Triggered when element enters viewport via IntersectionObserver.
export default class extends Controller {
  static values = {
    number: { type: Number, default: 0 },
    display: { type: String, default: "" },
    duration: { type: Number, default: 1500 }
  }

  connect() {
    this.animated = false
    this.observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting && !this.animated) {
          this.animated = true
          this.animate()
        }
      })
    }, { threshold: 0.3 })

    this.observer.observe(this.element)
  }

  disconnect() {
    if (this.observer) {
      this.observer.disconnect()
    }
  }

  animate() {
    const target = this.numberValue
    const duration = this.durationValue
    const start = performance.now()

    const step = (timestamp) => {
      const elapsed = timestamp - start
      const progress = Math.min(elapsed / duration, 1)
      // Ease-out cubic for smooth deceleration
      const eased = 1 - Math.pow(1 - progress, 3)
      const current = Math.round(eased * target)

      this.element.textContent = current.toLocaleString()

      if (progress < 1) {
        requestAnimationFrame(step)
      } else if (this.displayValue) {
        // Swap to formatted display string on completion
        this.element.textContent = this.displayValue
      }
    }

    requestAnimationFrame(step)
  }
}
