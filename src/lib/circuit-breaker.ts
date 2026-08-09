export class CircuitBreaker {
  private failures = 0
  private lastFailure = 0
  private state: "closed" | "open" | "half-open" = "closed"

  constructor(
    private readonly threshold: number = 5,
    private readonly resetTimeout: number = 60000
  ) {}

  async call<T>(fn: () => Promise<T>, fallback?: () => Promise<T>): Promise<T> {
    if (this.state === "open") {
      if (Date.now() - this.lastFailure > this.resetTimeout) {
        this.state = "half-open"
      } else if (fallback) {
        return fallback()
      } else {
        throw new Error("Circuit breaker is open")
      }
    }

    try {
      const result = await fn()
      this.onSuccess()
      return result
    } catch (error) {
      this.onFailure()
      if (fallback && this.getState() === "open") {
        return fallback()
      }
      throw error
    }
  }

  private onSuccess() {
    this.failures = 0
    this.state = "closed"
  }

  private onFailure() {
    this.failures++
    this.lastFailure = Date.now()
    if (this.failures >= this.threshold) {
      this.state = "open"
    }
  }

  getState() {
    return this.state
  }

  reset() {
    this.failures = 0
    this.state = "closed"
    this.lastFailure = 0
  }
}

export const twilioBreaker = new CircuitBreaker(3, 120000)
export const resendBreaker = new CircuitBreaker(3, 120000)
export const stripeBreaker = new CircuitBreaker(3, 120000)
