"use client";

import { deleteDeal, updateDeal } from "@/app/actions";
import { SalesDeal } from "@/lib/types";
import { useActionState } from "react";

interface DealRowProps{
    deal: SalesDeal;
}

export default function DealRow({ deal } : DealRowProps) 
{
    const [ updateState, updateFormAction, isUpdating ] = useActionState(updateDeal, null);
    const [ deleteState, deleteFormAction, isDeleting ] = useActionState(deleteDeal, null); 

    return(
        <form
            action={updateFormAction}
            className="flex items-end gap-4 mb-4"
        >
            <input type="hidden" name="id" value={deal.id} />

            <div>
                <label className="block text-sm mb-1">Name: </label>
                <input name="name" defaultValue={deal.name} className="border rounded px-2 py-1 bg-white text-black" />
            </div>

            <div>
                <label className="block text-sm mb-1">Value: </label>
                <input name="value" type="number" defaultValue={deal.value} className="border rounded px-2 py-1 w-24 bg-white text-black" />
            </div>

            <button
                type="submit"
                disabled = {isUpdating}
                className="bg-blue-600 text-white px-4 py-1 rounded disabled:opacity-50"
            >
                {isUpdating ? "Updating..." : "Update"}
            </button>

            <button
                type="submit"
                formAction={deleteFormAction}
                disabled={isDeleting}
                className="bg-red-600 text-white px-4 py-1 rounded disabled:opacity-50"
            >
                {isDeleting ? "Deleting..." : "Delete"}
            </button>

            {/* Error messages */}
            {updateState?.error && <p className="text-red-500">{updateState.error}</p>}
            {deleteState?.error && <p className="text-red-500">{deleteState.error}</p>}
        </form>
    )
}