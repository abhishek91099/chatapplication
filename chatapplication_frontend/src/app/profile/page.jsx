'use client'
import React, {useRef, useState} from "react";

const Profile= ()=>{
    const [modal,setModal]=useState(false)
    const image_ref=useRef()

    const uploadimage=async()=>{
        setModal(prev=>!prev)
        console.log(image_ref.current.files[0],'here')
    }
    const handleSubmit=function(e)

    {e.preventdefault
        setModal(prev=>!prev)
        

    }
    return (
    <div className="flex-col w-full h-lvh items-center p-10 bg-zinc-200">
    <div className="flex-2 flex justify-center items-center w-fit h-fit "><img className="w-40 h-40" src=""/>
    {modal &&(
    <>
    <input type="file" accept="image/*" ref={image_ref}/>
    <button onClick={uploadimage} className="border rounded text-white bg-neutral-700 m-2 p-2">Submit</button>
    <button onClick={handleSubmit} className="border rounded text-white bg-neutral-700 m-2 p-2">Cancel</button></>)}

    {!modal &&(
    <button onClick={handleSubmit} className="border rounded text-white bg-neutral-700 m-2 p-2">Upload</button>)}
    </div>
    <div className="flex-2 flex w-fit h-fit border p-5 m-5 items-center justify-center bg-blue-400 rounded-lg text-white"><h1>name</h1></div>
    <div className="flex-2 flex w-fit h-fit border p-5 m-5 items-center justify-center bg-blue-400 rounded-lg text-white"><h1>about_me</h1></div>
    
    </div>)


}

export default Profile