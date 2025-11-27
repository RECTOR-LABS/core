import { Controller } from "@hotwired/stimulus"

// Typing animation controller for retro terminal effect
export default class extends Controller {
  static targets = ["text", "cursor"]
  static values = {
    speed: { type: Number, default: 50 },
    delay: { type: Number, default: 0 },
    loop: { type: Boolean, default: false }
  }

  connect() {
    this.originalText = this.textTarget.textContent
    this.textTarget.textContent = ""
    this.charIndex = 0

    setTimeout(() => {
      this.type()
    }, this.delayValue)
  }

  type() {
    if (this.charIndex < this.originalText.length) {
      this.textTarget.textContent += this.originalText.charAt(this.charIndex)
      this.charIndex++
      setTimeout(() => this.type(), this.speedValue)
    } else if (this.loopValue) {
      setTimeout(() => {
        this.charIndex = 0
        this.textTarget.textContent = ""
        this.type()
      }, 2000)
    }
  }

  disconnect() {
    this.textTarget.textContent = this.originalText
  }
}
