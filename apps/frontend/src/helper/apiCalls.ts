const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'

export async function createUser() {
  const response = await fetch(`${API_URL}/user`, {
    method: 'POST',
  })
  return await response.json()
}
export async function updateUserBalance(userId: number, amount: number) {
  const response = await fetch(`${API_URL}/user`, {
    method: 'PUT',
    body: JSON.stringify({ userId, amount }),
  })
  return await response.json()
}

export async function getUserById(userId: number) {
  const response = await fetch(`${API_URL}/user?id=${userId}`, {
    method: 'GET',
  })
  const user = await response.json()
  return user
}
