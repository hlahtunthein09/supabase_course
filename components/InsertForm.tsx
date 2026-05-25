"use client";

import { supabase } from "@/lib/supabase";
import { useActionState, useState } from "react";
import { insertDeal } from "@/app/actions";

interface FormProps{
    // fetchMetrics?: () => Promise<void>;
    names: string[];
}

export default function InsertForm({ names }: FormProps)
{
    // Traditional way
    /* const [ name, setName ] = useState('');
    const [ amount, setAmount ] = useState("");
    const [ newName, setNewName ] = useState(""); // for custom name
    const [ isNewName, setIsNewName ] = useState(false); //track if "Other..." selected
    const[ submitting, setSubmitting ] = useState(false); */

    // This submit action is traditional way to define action like onSubmit
    // I have implemented another form validation using formAction method from React 19

    
    /* const handleAddDeal = async (e: React.FormEvent) => {
        e.preventDefault();

        const finalName = isNewName ? newName : name;

        if(!finalName || !amount) return;         // Basic validation

        setSubmitting(true); // Show loading state

        

        // Temporary: log what we're about to send
        console.log("Sending: ", { finalName, value: Number(amount) });

        const response = await supabase
                                .from("sales_deals")
                                .insert({ name: finalName, value: Number(amount) })       // Convert string to Number
                                .select();           // select() to return the inserted row

        console.log("Full response: ", response);
        
        setSubmitting(false); // Reset button

        if( response.error ) {
            console.error("Insert failed: ", response.error);
            return;
        }

        console.log("Inserted row: ", response.data);
        // Clear cache
        setName("");
        setAmount("");

        // Refresh charts immediately (don't wait for realtime)
        await fetchMetrics();
    } */

    // Hook: [state, wrappedAction, isPending]
    const [ state, formAction, isPending ] = useActionState(insertDeal, null);
    
    // Still need client state for the "Other..." toggle
    const [isNewName, setIsNewName] = useState(false);

    return(
        <div className="border border-gray-200 rounded-lg p-4 mt-8 self-center w-full max-w-4xl">
            <h2 className="text-lg font-semibold mb-4">New Deal</h2>
            <form action={formAction} className="flex items-end gap-4 mt-8">

                {/* Name dropdown */}
                <div>
                    <label className="block text-sm mb-1">Name: </label>
                    <select
                        // value={name}
                        // onChange={(e) => {
                        //     setName(e.target.value)
                        //     setIsNewName(e.target.value === "__new__");
                        // }}
                        name="name"
                        onChange={(e) => {
                            setIsNewName(e.target.value === "__new__");
                        }}
                        className="border rounded px-2 py-1 bg-white text-black"
                    >
                        <option value="">Select...</option>
                        {/*  Map over the names prop instead of hardcoding */}
                        {names.map((name, index) => (
                            <option key={index} value={name}>
                                {name}
                            </option>
                        ))}
                        <option value="__new__">Other (new person)...</option>
                    </select>
                </div>
                
                {/* New name text input — only shown when "Other..." selected */}
                { isNewName && (
                    <div>
                        <label className="block text-sm mb-1">New Name:</label>
                        <input 
                            // value={newName}
                            type="text"
                            name="newName"
                            // onChange={(e) => setNewName(e.target.value)}
                            placeholder="Enter name"
                            className="border rounded px-2 bg-white text-black"
                        />
                    </div>
                )}
                <div>
                    <label>Amount: $ </label>
                    <input 
                        // type="number" 
                        // value={amount}
                        // onChange={(e) => setAmount(e.target.value)}
                        name="value"
                        type="number"
                        placeholder="0.00"
                        className="border rounded px-2 py-1 w-24 bg-white text-black"
                    />
                </div>

                {/* Button */}
                <button
                    type="submit"
                    // disabled = { submitting || !name || !amount }
                    disabled = { isPending}
                    className="bg-green-800 text-white px-4 py-1 rounded disabled:opacity-50"
                >
                    {isPending ? "Adding..." : "Add Deal"}
                </button>
            </form>

            {/* Error message */}
            {state?.error && (
                <p className="text-red-500 mt-2">{state.error}</p>
            )}

            {/* Success message */}
            {state?.success && (
                <p className="text-green-500 mt-2">{state.success}</p>
            )}
        </div>
        
    )
}