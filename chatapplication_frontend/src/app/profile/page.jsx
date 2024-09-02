import React from "react";

const Profile= ()=>{

    return (
    <div className="flex-col w-full h-lvh items-center p-10 bg-zinc-200">
    <div className="flex-2 flex justify-center items-center w-fit h-fit "><img className="w-40 h-40" src="https://upload.wikimedia.org/wikipedia/commons/thumb/9/9e/Madana_Mohana_temple_of_Bishnupur_in_Bankura_district_30.jpg/800px-Madana_Mohana_temple_of_Bishnupur_in_Bankura_district_30.jpg"/></div>
    <div className="flex-2 flex w-fit h-fit border p-5 m-5 items-center justify-center bg-blue-400 rounded-lg text-white"><h1>name</h1></div>
    <div className="flex-2 flex w-fit h-fit border p-5 m-5 items-center justify-center bg-blue-400 rounded-lg text-white"><h1>about_me</h1></div>
    
    </div>)


}

export default Profile