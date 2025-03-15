import PageTitle from '@/components/PageTitle'
import React from 'react'
import AllWizard from './components/AllWizard'
import { Metadata } from 'next'

export const metadata: Metadata = { title: 'Form Wizard' }

const WizardPage = () => {
  return (
    <>
      <PageTitle title='Form Validation' subTitle="Forms" />
      <AllWizard />
    </>
  )
}

export default WizardPage