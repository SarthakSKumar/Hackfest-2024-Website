"use client"
import { signIn } from "next-auth/react";

export const RequestButton=()=>{

    return(
    <button  onClick = {()=>{fetch("/api/user/updateProfile",{
        method: "POST",
        credentials: "include",
        body: JSON.stringify({
            name: "test",
            adhaar: "test",
        }),
        })
      signIn("google")
      }} className="hidden md:block text-white bg-gray-800 hover:bg-gray-900 font-medium rounded-lg text-sm px-5 py-2 drop-shadow-lg">Request</button>
    )
}
