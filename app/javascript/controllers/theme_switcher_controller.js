import { Controller } from "@hotwired/stimulus"

// Theme switcher controller - toggles between retro and modern themes
export default class extends Controller {
  static targets = ["label"]
  static values = {
    theme: { type: String, default: "retro" }
  }

  connect() {
    // Load saved preference
    const saved = localStorage.getItem("arbital-cv-theme")
    if (saved) {
      this.themeValue = saved
    }
    this.applyTheme()
  }

  toggle() {
    this.themeValue = this.themeValue === "retro" ? "modern" : "retro"
    localStorage.setItem("arbital-cv-theme", this.themeValue)
    this.applyTheme()
  }

  applyTheme() {
    const body = document.body
    const isRetro = this.themeValue === "retro"

    // Update body classes
    body.classList.remove("retro-terminal", "modern-dark")
    body.classList.add(isRetro ? "retro-terminal" : "modern-dark")

    // Update button label - shows which theme to switch to
    this.labelTargets.forEach(label => {
      label.textContent = isRetro ? "SWITCH TO MODERN" : "SWITCH TO RETRO"
    })

    // Toggle container visibility with smooth transition
    document.querySelectorAll("[data-theme]").forEach(el => {
      if (el.dataset.theme === this.themeValue) {
        el.style.display = "block"
        el.style.opacity = "0"
        requestAnimationFrame(() => {
          el.style.transition = "opacity 0.3s ease"
          el.style.opacity = "1"
        })
      } else {
        el.style.display = "none"
      }
    })
  }

  themeValueChanged() {
    this.applyTheme()
  }
}
