import { Controller } from "@hotwired/stimulus"

// Scroll reveal animation for modern dark theme
export default class extends Controller {
  static targets = ["item"]
  static values = {
    delay: { type: Number, default: 100 },
    threshold: { type: Number, default: 0.1 }
  }

  connect() {
    // Set initial state
    this.itemTargets.forEach((item, index) => {
      item.style.opacity = "0"
      item.style.transform = "translateY(20px)"
      item.style.transition = `opacity 0.6s ease, transform 0.6s ease`
      item.style.transitionDelay = `${index * this.delayValue}ms`
    })

    // Create observer
    this.observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.style.opacity = "1"
          entry.target.style.transform = "translateY(0)"
        }
      })
    }, { threshold: this.thresholdValue })

    // Observe all items
    this.itemTargets.forEach(item => {
      this.observer.observe(item)
    })
  }

  disconnect() {
    if (this.observer) {
      this.observer.disconnect()
    }
  }
}
