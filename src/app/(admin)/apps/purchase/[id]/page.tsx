"use client"
import { Metadata } from 'next'
import { useState } from 'react'
import TransactionMain from '../components/BuyerList'
import ProductSelector from '../components/ProductListMain'
// If you're using Next.js App Router in v13+, you can export metadata:
// export const metadata: Metadata = {
//   title: 'Purchase Transactions',
// }

export default function PurchaseTransactionsPage() {
  const [selectedAccount, setSelectedAccount] = useState('brandon test')

  const handleAccountChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSelectedAccount(event.target.value)
  }

  return (
    <>
    {/* <TransactionMain /> */}
    <ProductSelector />
    </>
  )
}
