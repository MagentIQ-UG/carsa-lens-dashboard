/**
 * Basic test to verify Jest setup is working correctly
 */
describe('Test Setup', () => {
  it('should pass a basic test', () => {
    expect(true).toBe(true)
  })

  it('should have environment variables available', () => {
    expect(process.env.NEXT_PUBLIC_API_URL).toBeDefined()
  })
})