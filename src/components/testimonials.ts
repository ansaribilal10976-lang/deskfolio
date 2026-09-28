export type Testimonial = {
  name: string
  role?: string
  quote: string
}

// Yahan sirf ASLI client reviews daal.
// Jab tak ye list khali hai, "Reviews" tab site pe dikhega hi nahi.
// Format (uncomment karke apna daal):
export const TESTIMONIALS: Testimonial[] = [
  // { name: 'Client Name', role: 'Stone Mount Group', quote: 'Ek-do line ka review.' },
]
