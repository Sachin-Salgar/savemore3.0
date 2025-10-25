import { useState, useRef } from 'react'
import { useAddMembers } from '@/hooks/useAddMembers'
import { parseCSV, downloadSampleCSV } from '@/utils/csvHelper'

interface AddMembersModalProps {
  groupId: string
  onClose: () => void
  onSuccess: () => void
}

type TabType = 'single' | 'bulk'

export default function AddMembersModal({ groupId, onClose, onSuccess }: AddMembersModalProps) {
  const [activeTab, setActiveTab] = useState<TabType>('single')
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [csvFile, setCsvFile] = useState<File | null>(null)
  const [csvError, setCsvError] = useState<string | null>(null)
  const [csvPreview, setCsvPreview] = useState<any>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const { addMember, addMultipleMembers, loading, error, setError } = useAddMembers()

  const handleAddSingleMember = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (!name.trim() || !email.trim()) {
      setError('Name and email are required')
      return
    }

    const success = await addMember(groupId, {
      name: name.trim(),
      email: email.trim(),
      phone: phone.trim() || undefined
    })

    if (success) {
      setName('')
      setEmail('')
      setPhone('')
      onSuccess()
    }
  }

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setCsvFile(file)
    setCsvError(null)
    setCsvPreview(null)

    try {
      const text = await file.text()
      const result = parseCSV(text)

      if (result.errors.length > 0) {
        setCsvError(`${result.errors.length} validation error(s) found`)
      }

      setCsvPreview({
        members: result.members.slice(0, 5),
        totalMembers: result.members.length,
        errors: result.errors
      })
    } catch (err) {
      setCsvError(err instanceof Error ? err.message : 'Failed to read CSV file')
    }
  }

  const handleUploadCSV = async () => {
    if (!csvFile) {
      setCsvError('Please select a CSV file')
      return
    }

    setError(null)
    setCsvError(null)

    try {
      const text = await csvFile.text()
      const result = parseCSV(text)

      if (result.members.length === 0) {
        setCsvError('No valid members found in CSV')
        return
      }

      const uploadResult = await addMultipleMembers(groupId, result.members)

      if (uploadResult.success > 0) {
        // Show summary
        let message = `Successfully added ${uploadResult.success} member(s)`
        if (uploadResult.failed > 0) {
          message += ` and failed to add ${uploadResult.failed}`
        }
        setError(null)
        onSuccess()
      } else {
        setCsvError(`Failed to add members. ${uploadResult.errors.map(e => e.error).join(', ')}`)
      }
    } catch (err) {
      setCsvError(err instanceof Error ? err.message : 'Failed to process CSV file')
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-96 overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 p-4 flex justify-between items-center">
          <h2 className="text-lg font-semibold text-gray-900">Add Members</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            ✕
          </button>
        </div>

        <div className="p-4">
          {/* Tabs */}
          <div className="flex gap-2 mb-4 border-b border-gray-200">
            <button
              onClick={() => {
                setActiveTab('single')
                setError(null)
              }}
              className={`px-4 py-2 font-medium text-sm border-b-2 transition-colors ${
                activeTab === 'single'
                  ? 'text-primary border-primary'
                  : 'text-gray-600 border-transparent hover:text-gray-900'
              }`}
            >
              Single Member
            </button>
            <button
              onClick={() => {
                setActiveTab('bulk')
                setError(null)
              }}
              className={`px-4 py-2 font-medium text-sm border-b-2 transition-colors ${
                activeTab === 'bulk'
                  ? 'text-primary border-primary'
                  : 'text-gray-600 border-transparent hover:text-gray-900'
              }`}
            >
              CSV Upload
            </button>
          </div>

          {/* Error message */}
          {(error || csvError) && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-3 py-2 rounded-lg text-sm mb-4">
              {error || csvError}
            </div>
          )}

          {activeTab === 'single' ? (
            // Single member form
            <form onSubmit={handleAddSingleMember} className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Full Name *
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="John Doe"
                  disabled={loading}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email *
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="john@example.com"
                  disabled={loading}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Phone (Optional)
                </label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="9876543210"
                  disabled={loading}
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full px-4 py-2 bg-primary text-white rounded-lg font-medium text-sm hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {loading ? 'Adding...' : 'Add Member'}
              </button>
            </form>
          ) : (
            // CSV upload form
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Upload CSV File
                </label>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".csv"
                  onChange={handleFileSelect}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                  disabled={loading}
                />
              </div>

              <button
                onClick={downloadSampleCSV}
                type="button"
                className="w-full px-3 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-200 transition-colors"
              >
                📥 Download Sample CSV
              </button>

              {csvPreview && (
                <div className="mt-3">
                  <p className="text-sm font-medium text-gray-900 mb-2">
                    Preview: {csvPreview.totalMembers} member(s)
                  </p>
                  <div className="bg-gray-50 rounded-lg p-2 max-h-32 overflow-y-auto text-xs">
                    {csvPreview.members.map((m: any, idx: number) => (
                      <div key={idx} className="text-gray-600 py-1 border-b border-gray-200 last:border-0">
                        {m.name} ({m.email})
                      </div>
                    ))}
                  </div>
                  {csvPreview.errors.length > 0 && (
                    <div className="mt-2 p-2 bg-yellow-50 rounded-lg text-xs text-yellow-800">
                      ⚠️ {csvPreview.errors.length} row(s) with errors (they will be skipped)
                    </div>
                  )}
                </div>
              )}

              <button
                onClick={handleUploadCSV}
                disabled={!csvFile || loading}
                className="w-full px-4 py-2 bg-primary text-white rounded-lg font-medium text-sm hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {loading ? 'Uploading...' : 'Upload Members'}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
