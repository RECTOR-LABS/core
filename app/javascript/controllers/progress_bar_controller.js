import { Controller } from "@hotwired/stimulus"

// Animated progress bars for tech stack visualization
export default class extends Controller {
  static targets = ["bar"]
  static values = {
    delay: { type: Number, default: 100 },
    duration: { type: Number, default: 1000 }
  }

  connect() {
    // Store original widths and reset to 0
    this.barTargets.forEach((bar, index) => {
      bar.dataset.targetWidth = bar.style.width
      bar.style.width = "0%"
    })

    // Use IntersectionObserver to trigger animation when visible
    this.observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          this.animateBars()
          this.observer.disconnect()
        }
      })
    }, { threshold: 0.2 })

    this.observer.observe(this.element)
  }

  animateBars() {
    this.barTargets.forEach((bar, index) => {
      setTimeout(() => {
        bar.style.transition = `width ${this.durationValue}ms ease-out`
        bar.style.width = bar.dataset.targetWidth
      }, index * this.delayValue)
    })
  }

  disconnect() {
    if (this.observer) {
      this.observer.disconnect()
    }
  }
}
