import { useEffect, useState } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { useTransactions } from '@/hooks/useTransactions'
import Layout from '@/components/Layout'
import { formatCurrency, formatDate } from '@/utils/calculations'
import { supabase } from '@/lib/supabase'

export default function Transactions() {
  const { user } = useAuth()
  const [groupId, setGroupId] = useState<string | null>(null)
  const { transactions, loading } = useTransactions(groupId || undefined)

  useEffect(() => {
    const fetchUserGroup = async () => {
      try {
        const { data } = await supabase
          .from('group_members')
          .select('group_id')
          .eq('user_id', user?.id)
          .eq('status', 'approved')
          .single()

        if (data) {
          setGroupId(data.group_id)
        }
      } catch (error) {
        console.error('Failed to fetch group:', error)
      }
    }

    if (user?.id) {
      fetchUserGroup()
    }
  }, [user?.id])

  if (loading) {
    return <Layout><div className="text-center py-8">Loading...</div></Layout>
  }

  const getTransactionIcon = (type: string) => {
    switch (type) {
      case 'deposit': return '💰'
      case 'withdrawal': return '🏦'
      case 'loan_disbursement': return '📤'
      case 'loan_repayment': return '📥'
      case 'interest': return '📈'
      default: return '💳'
    }
  }

  const getTransactionColor = (type: string) => {
    switch (type) {
      case 'deposit': return 'text-green-600'
      case 'withdrawal': return 'text-red-600'
      case 'loan_disbursement': return 'text-blue-600'
      case 'loan_repayment': return 'text-purple-600'
      case 'interest': return 'text-amber-600'
      default: return 'text-gray-600'
    }
  }

  return (
    <Layout>
      <div className="space-y-6">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Transaction History</h1>
          <p className="text-gray-600 mt-1">All your group transactions</p>
        </div>

        {transactions.length === 0 ? (
          <div className="card text-center py-8">
            <p className="text-gray-500">No transactions yet</p>
          </div>
        ) : (
          <div className="space-y-2">
            {transactions.map(transaction => (
              <div key={transaction.id} className="card flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <span className="text-2xl">{getTransactionIcon(transaction.transaction_type)}</span>
                  <div>
                    <p className="font-medium text-gray-900 capitalize">
                      {transaction.transaction_type.replace(/_/g, ' ')}
                    </p>
                    <p className="text-xs text-gray-500">{formatDate(transaction.created_at)}</p>
                    {transaction.description && (
                      <p className="text-xs text-gray-600 mt-1">{transaction.description}</p>
                    )}
                  </div>
                </div>
                <p className={`text-lg font-bold ${getTransactionColor(transaction.transaction_type)}`}>
                  {transaction.transaction_type === 'withdrawal' ? '-' : '+'}
                  {formatCurrency(transaction.amount)}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </Layout>
  )
}
