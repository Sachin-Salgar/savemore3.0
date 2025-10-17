import Layout from '@/components/Layout'

export default function Savings() {
  return (
    <Layout>
      <div>
        <h1 className="text-3xl font-bold text-gray-900 mb-6">My Savings</h1>
        <div className="card">
          <p className="text-gray-600">No savings data available yet</p>
        </div>
      </div>
    </Layout>
  )
}
