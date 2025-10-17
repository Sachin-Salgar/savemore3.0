import Layout from '@/components/Layout'

export default function Transactions() {
  return (
    <Layout>
      <div>
        <h1 className="text-3xl font-bold text-gray-900 mb-6">Transaction History</h1>
        <div className="card">
          <p className="text-gray-600">No transactions yet</p>
        </div>
      </div>
    </Layout>
  )
}
