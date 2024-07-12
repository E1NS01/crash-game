export class APIhelper {
  private API_URL: string =
    process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'

  async createUser() {
    const response = await fetch(`${this.API_URL}/user`, {
      method: 'POST',
    })
    return response.json()
  }
  async updateUserBalance(userId: number, amount: number) {
    const response = await fetch(`${this.API_URL}/user`, {
      method: 'PUT',
      body: JSON.stringify({ userId, amount }),
    })
    return response.json()
  }
}
