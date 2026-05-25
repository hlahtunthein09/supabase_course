import { supabase } from "@/lib/supabase";
import { useState } from "react";

interface FormProps{
    fetchMetrics: () => Promise<void>;
    names: string[];
}

export default function Form({ fetchMetrics, names } : FormProps)
{
    const [ name, setName ] = useState('');
    const [ amount, setAmount ] = useState("");
    const [ newName, setNewName ] = useState(""); // for custom name
    const [ isNewName, setIsNewName ] = useState(false); //track if "Other..." selected
    const[ submitting, setSubmitting ] = useState(false);

    const handleAddDeal = async (e: React.FormEvent) => {
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
    }

    return(
        <form onSubmit={handleAddDeal} className="flex items-end gap-4 mt-8">
            <div>
                <label className="block text-sm mb-1">Name:</label>
                <select
                    value={name}
                    onChange={(e) => {
                        setName(e.target.value)
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
            
            {/* Show text input only when "Other..." is selected */}
            { isNewName && (
                <div>
                    <label className="block text-sm mb-1">New Name:</label>
                    <input 
                        type="text"
                        value={newName}
                        onChange={(e) => setNewName(e.target.value)}
                        placeholder="Enter name"
                        className="border rounded px-2 bg-white text-black"
                    />
                </div>
            )}
            <div>
                <label>Amount: $</label>
                <input 
                    type="number" 
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="border rounded px-2 py-1 w-24 bg-white text-black"
                />
            </div>

            {/* Button */}
            <button
                type="submit"
                disabled = { submitting || !name || !amount }
                className="bg-green-800 text-white px-4 py-1 rounded disabled:opacity-50"
            >
                {submitting ? "Adding..." : "Add Deal"}
            </button>
        </form>
    )
}