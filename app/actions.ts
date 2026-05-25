// React 19 introduced a new pattern 
// where forms can directly call Server Actions 
// without onSubmit or e.preventDefault().

// formAction is used when a form has multiple 
// submit buttons that do different things:

"use server";   // ← Everything in this file runs on the server, not the browser

import { createClient } from "@supabase/supabase-js";
import { revalidatePath } from "next/cache";

// Create a Supabase client that runs on the server
const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!
);

// The action MUST accept (prevState, formData)
// prevState is whatever the action returned last time
export async function insertDeal(prevState: { error?: string; success?: boolean} | null, formData: FormData)
{
    const name = formData.get("name") as string;
    const newName = formData.get("newName") as string;
    const value = Number(formData.get("value"));

    // If user selected "Other..." and provided a name, use the newName input instead
    const finalName = name === "__new__" ? newName : name;

    if(!finalName || !value)
    {
        return { error: "Name and value are required" };
    }

    const { error } = await supabase
                            .from("sales_deals")
                            .insert({ name: finalName, value });

    if(error) 
    {
        console.error("Insert failed: ", error);
        return { error: error.message };
    }

    revalidatePath("/");

    return { success: true };       
}

// UPDATE an existing row
export async function updateDeal(
    prevState: { error?: string; success?: boolean} | null,
    formData: FormData)
{
    // FormData reads values by the input's "name" attribute
    const id = formData.get("id") as string;
    const name = formData.get("name") as string;
    const value = formData.get("value") as string;

    const { error } =  await supabase
                            .from("sales_deals")
                            .update({ name, value: Number(value)})
                            .eq("id", id); // only update the row with this id

    if(error) 
    {
        console.error("Update failed: ", error);
        return { error: error.message };
    }

    // Tell Next.js to re-render this page so server data refreshes
    revalidatePath("/");
    return { success: true };
}

// DELTE a row
export async function deleteDeal(prevState: { error?: string; success?: boolean} | null, formData: FormData)
{
    const id = formData.get("id") as string;

    const { error } = await supabase
                            .from("sales_deals")
                            .delete()
                            .eq("id", id);
    if(error) {
        console.error("Delete failed: ", error);
        return { error: error.message };
    }

    revalidatePath("/");
    return { success: true };
}