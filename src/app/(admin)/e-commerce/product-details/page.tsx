import PageTitle from "@/components/PageTitle"
import ProductDetails from "./components/ProductDetails"
import ProductDetailsDescription from "./components/ProductDetailsDescription"
import { Metadata } from "next"

export const metadata: Metadata = { title: 'Products Details' }

const ProductDetailsPage = () => {
  return (
    <>
      <PageTitle title='Product Details' subTitle="eCommerce" />
      <ProductDetails />
      <ProductDetailsDescription />
    </>
  )
}

export default ProductDetailsPage