"use client"

import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
  } from "@/components/ui/select"

import { Textarea } from "./ui/textarea"
import {useState } from "react";
import {useForm } from "react-hook-form";
import { z } from "zod";

import {Form, FormField, FormItem, FormLabel, FormControl, FormMessage} from "./ui/form"
import { Button } from "./ui/button";

export const fromSchema = z.object({
    expertiseLevel: z.string(),
    context: z.string().optional()
});

export const onSubmit = (data: z.infer<typeof fromSchema>) => {
    console.log(data);
 }

export default function  SelectMenu({items}: {items: string[]}) {

    const [formData, setFormData] = useState<{expertiseLevel: string, context?: string}>({expertiseLevel: "", context: ""});

    const form = useForm<z.infer<typeof fromSchema>>({
        defaultValues: {
            expertiseLevel: "",
            context: ""
        }
    });



    return(
        <>


        <div className="flex flex-col items-center">

            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                    <FormField
                        control={form.control}
                        name="expertiseLevel"
                        render={({field}) => (
                            <FormItem>
                                <FormLabel>Expertise</FormLabel>
                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                    <FormControl>
                                        <SelectTrigger className="w-72">
                                            <SelectValue placeholder="Select your expertise level" />
                                        </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                        {items.map((item) => (
                                            <SelectItem key={item} value={item}>{item}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="context"
                        render={({field}) => (
                            <FormItem>
                                <FormLabel>Context</FormLabel>
                                <FormControl>
                                    <Textarea placeholder="Or enter a custom expertise level" className="w-128 mt-2" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white text-lg font-semibold py-3 rounded-lg shadow-lg shadow-blue-500/20 hover:shadow-blue-500/30 transition duration-300">
                        Start Recording
                    </Button>
                </form>
            </Form>
        </div>

        </>

        
    )    

}