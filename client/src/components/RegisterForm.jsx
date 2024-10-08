import * as React from "react"
import { Link, useNavigate } from "react-router-dom"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { FaGithub, FaGoogle } from "react-icons/fa";
import axios from "axios"
import { baseUrl } from "@/common/common"
import { useDispatch } from "react-redux"
import { useForm } from "react-hook-form"
import { login } from "@/store/authSlice"
import { toast } from "react-toastify"
import { VscLoading } from "react-icons/vsc";
import SignInWithGoogle from "./signInWithGoogle"

export default function RegisterForm() {

  const dispatch = useDispatch()

  const navigate = useNavigate()

  const { register, handleSubmit, reset } = useForm()

  const [loading, setLoading] = React.useState(false)

  const formSubmit = async (data) => {
    console.log(data);
    setLoading(true)
    try {
      await axios.post(baseUrl + '/api/user/register', data).then((response) => {
        // if(response.status === 200) {
        // toast.success("Product Created Successfully!")
        console.log(JSON.stringify(data))
        toast.success("User Registered Successfully!")
        const { token } = response.data.response
        // const {fullname, email } = response.data.response.createdUser;
        localStorage.setItem('userToken', token)
        dispatch(login(response.data.response.createdUser))
        reset();
        navigate('/')
        window.location.reload();
        // }else if(response.status===403) {
        //   toast.error("User Already Exist !")
        // }
        // setProgressPercent(0);
      })
    } catch (err) {
      if (axios.isCancel(err)) {
        console.log("Fetch aborted");
      } else {
        console.error("Registration failed:", err);
        toast.error("User Already Exist !")
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card className="w-[400px]">
      <form onSubmit={handleSubmit(formSubmit)} >
        <CardHeader>
          <CardTitle>Create Account</CardTitle>
          <CardDescription>Enter your details to create a new account.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="pb-2">
           {/* <Button variant="outline" className="flex justify-around align-middle w-28">
              <FaGithub />Github
            </Button> */}
            {/* <Button variant="outline" className="flex justify-around align-middle w-28">
              <FaGoogle />Google
            </Button> */}
            <SignInWithGoogle/>
          </div>
          <div className="flex items-center my-2">
            <hr className="flex-grow border-gray-300 rounded-md border-[1.5px]" />
            <p className="mx-2 text-xs text-gray-400 uppercase">or continue with</p>
            <hr className="flex-grow border-gray-300 rounded-md border-[1.5px]" />
          </div>
          <div className="grid w-full items-center gap-4">
            <div className="flex flex-col space-y-1.5">
              <Label htmlFor="firstname">First Name</Label>
              <Input required id="firstname" placeholder="Type your First name" {...register('firstname')} />
            </div>
            <div className="flex flex-col space-y-1.5">
              <Label htmlFor="lastname">Last Name</Label>
              <Input required id="lastname" placeholder="Type your Last name" {...register('lastname')} />
            </div>
            <div className="flex flex-col space-y-1.5">
              <Label htmlFor="email">Email</Label>
              <Input required id="email" type="email" placeholder="Type your email" {...register('email')} />
            </div>
            <div className="flex flex-col space-y-1.5">
              <Label htmlFor="password">Password</Label>
              <Input required id="password" type="password" placeholder="Type your password" {...register('password')} />
            </div>
          </div>
        </CardContent>
        <CardFooter className="grid" >
          <Button className="w-full bg-gray-900 text-white" >{loading ? <VscLoading className="text-white animate-spin-slow text-2xl text-bold" /> : "SIGN UP"}</Button>
          <hr className="mt-3 border-gray-300 rounded-md border-[1.5px]" />
          <div className="flex py-2 justify-center" >
            <p className="" >Already Have an Account?</p>
            <Link to={"/login"} className="pl-2 underline" >Sign In</Link>
          </div>
        </CardFooter>
      </form>
    </Card>
  )
}