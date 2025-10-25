import { MemberInput } from '@/hooks/useAddMembers'

export interface CSVParseResult {
  members: MemberInput[]
  errors: Array<{ row: number; error: string }>
  totalRows: number
}

export const parseCSV = (csvContent: string): CSVParseResult => {
  const lines = csvContent.trim().split('\n')
  const members: MemberInput[] = []
  const errors: Array<{ row: number; error: string }> = []

  if (lines.length === 0) {
    return { members: [], errors: [{ row: 0, error: 'CSV file is empty' }], totalRows: 0 }
  }

  const headerLine = lines[0]
  const headers = headerLine.split(',').map(h => h.trim().toLowerCase())

  // Check for required columns
  const emailIndex = headers.findIndex(h => h === 'email')
  const nameIndex = headers.findIndex(h => h === 'name')

  if (emailIndex === -1 || nameIndex === -1) {
    return {
      members: [],
      errors: [{ row: 1, error: 'CSV must have "email" and "name" columns' }],
      totalRows: lines.length
    }
  }

  const phoneIndex = headers.findIndex(h => h === 'phone')

  // Parse data rows (skip header row)
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim()

    // Skip empty lines
    if (!line) {
      continue
    }

    // Parse CSV line (handle quoted fields)
    const values = parseCSVLine(line)

    if (values.length < Math.max(nameIndex, emailIndex) + 1) {
      errors.push({ row: i + 1, error: 'Insufficient columns in row' })
      continue
    }

    const email = values[emailIndex]?.trim() || ''
    const name = values[nameIndex]?.trim() || ''
    const phone = phoneIndex !== -1 ? values[phoneIndex]?.trim() : undefined

    // Validate email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!email || !emailRegex.test(email)) {
      errors.push({ row: i + 1, error: `Invalid email: ${email}` })
      continue
    }

    // Validate name
    if (!name) {
      errors.push({ row: i + 1, error: 'Name is required' })
      continue
    }

    members.push({
      email,
      name,
      phone: phone && phone.length > 0 ? phone : undefined
    })
  }

  return {
    members,
    errors,
    totalRows: lines.length
  }
}

// Helper function to parse CSV line (handles quoted fields)
const parseCSVLine = (line: string): string[] => {
  const result: string[] = []
  let current = ''
  let insideQuotes = false

  for (let i = 0; i < line.length; i++) {
    const char = line[i]
    const nextChar = line[i + 1]

    if (char === '"') {
      if (insideQuotes && nextChar === '"') {
        current += '"'
        i++ // Skip next quote
      } else {
        insideQuotes = !insideQuotes
      }
    } else if (char === ',' && !insideQuotes) {
      result.push(current)
      current = ''
    } else {
      current += char
    }
  }

  result.push(current)
  return result
}

export const generateSampleCSV = (): string => {
  const headers = ['email', 'name', 'phone']
  const sampleData = [
    ['john.doe@example.com', 'John Doe', '9876543210'],
    ['jane.smith@example.com', 'Jane Smith', '9876543211'],
    ['raj.kumar@example.com', 'Raj Kumar', '9876543212']
  ]

  const csvLines = [
    headers.join(','),
    ...sampleData.map(row => row.join(','))
  ]

  return csvLines.join('\n')
}

export const downloadSampleCSV = () => {
  const csv = generateSampleCSV()
  const element = document.createElement('a')
  element.setAttribute('href', `data:text/csv;charset=utf-8,${encodeURIComponent(csv)}`)
  element.setAttribute('download', 'sample_members.csv')
  element.style.display = 'none'
  document.body.appendChild(element)
  element.click()
  document.body.removeChild(element)
}
