"use client"
import { Metadata } from 'next'
import { useState } from 'react'
import TransactionMain from '../components/BuyerList'
import ProductSelector from '../components/ProductListMain'
// If you're using Next.js App Router in v13+, you can export metadata:
// export const metadata: Metadata = {
//   title: 'sale Transactions',
// }

export default function saleTransactionsPage() {
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
