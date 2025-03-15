'use client'
import TextFormInput from "@/components/form/TextFormInput"
import useSignIn from "../useSignIn"
import PasswordFormInput from "@/components/form/PasswordFormInput"
import Link from "next/link"
import { FormCheck } from "react-bootstrap"

const LoginForm = () => {

  const { login, control } = useSignIn()

  return (
    <form action="index.html" className="text-start mb-3" onSubmit={login}>
      <div className="mb-3">
        <TextFormInput control={control} name="email" containerClassName="mb-3" label="Email" id="email-id" placeholder="Enter your email" />
      </div>
      <div className="mb-3">
        <PasswordFormInput
        control={control}
        name="password"
        containerClassName="mb-3"
        placeholder="Enter your password"
        id="password-id"
        label='Password'
      />
      </div>
      <div className="d-flex justify-content-between mb-3">
        <div className="form-check">
          <FormCheck className="ps-0" label="Remember me" id="sign-in" />
        </div>
        <Link href="/auth/recover-password" className="text-muted border-bottom border-dashed">Forget Password</Link>
      </div>
      <div className="d-grid">
        <button className="btn btn-primary" type="submit">Login</button>
      </div>
    </form>
  )
}

export default LoginForm