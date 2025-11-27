import { Controller } from "@hotwired/stimulus"

// Boot sequence animation for retro terminal
export default class extends Controller {
  static targets = ["line", "content"]
  static values = {
    lineDelay: { type: Number, default: 400 },
    charSpeed: { type: Number, default: 20 }
  }

  connect() {
    this.currentLine = 0
    this.lines = this.lineTargets

    // Hide all lines initially
    this.lines.forEach(line => {
      line.style.opacity = "0"
      line.dataset.originalText = line.textContent
      line.textContent = ""
    })

    // Hide main content initially
    if (this.hasContentTarget) {
      this.contentTarget.style.opacity = "0"
    }

    // Start boot sequence
    this.showNextLine()
  }

  showNextLine() {
    if (this.currentLine < this.lines.length) {
      const line = this.lines[this.currentLine]
      line.style.opacity = "1"
      this.typeText(line, line.dataset.originalText, () => {
        this.currentLine++
        setTimeout(() => this.showNextLine(), this.lineDelayValue)
      })
    } else {
      // Boot complete, show main content
      this.showContent()
    }
  }

  typeText(element, text, callback) {
    let charIndex = 0
    const type = () => {
      if (charIndex < text.length) {
        element.textContent += text.charAt(charIndex)
        charIndex++
        setTimeout(type, this.charSpeedValue)
      } else if (callback) {
        callback()
      }
    }
    type()
  }

  showContent() {
    if (this.hasContentTarget) {
      this.contentTarget.style.transition = "opacity 0.5s ease"
      this.contentTarget.style.opacity = "1"
    }
  }
}
