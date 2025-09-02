"use client"

import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
  } from "@/components/ui/select"


  import { Textarea } from "./ui/textarea"
import { use, useState } from "react";

export default function  SelectMenu({items}: {items: string[]}) {

    const [p, setP] = useState("");

    return(
        <>
        <div className="flex flex-col items-center">
            <Select onValueChange={(value) => setP(value)}>
                <SelectTrigger className="w-64" >
                    <SelectValue placeholder="Select a expertise level" color="white" />
                </SelectTrigger>
                <SelectContent>
                    {items.map((item) => (
                        <SelectItem key={item} value={item}>
                            {item}
                        </SelectItem>
                    ))}
                </SelectContent>
                
            </Select>

            {p != items[0] &&
                <Textarea placeholder="Or enter a custom expertise level" className="w-128 mt-2" />
            }
            
        </div>

        </>

        
    )    

}