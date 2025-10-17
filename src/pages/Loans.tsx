import Layout from '@/components/Layout'

export default function Loans() {
  return (
    <Layout>
      <div>
        <h1 className="text-3xl font-bold text-gray-900 mb-6">Loans</h1>
        <div className="card">
          <p className="text-gray-600">No active loans</p>
        </div>
      </div>
    </Layout>
  )
}
