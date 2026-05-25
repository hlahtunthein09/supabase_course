import { updateDeal, deleteDeal } from "@/app/actions";
import { SalesDeal } from "@/lib/types";
import DealRow from "./DealRow";



interface DealManagerProps{
    deals: SalesDeal[];
}

export default function DealManager({ deals } : DealManagerProps)
{
    return(
        <div className="border border-gray-200 rounded-lg p-4 mt-8 mb-6 self-center w-full max-w-4xl">
            <h2 className="text-lg font-semibold mb-4">Manage Deals</h2>

            <div>
                { deals.map((deal) => (
                    <DealRow key={deal.id} deal={deal} />
                ))}
            </div>
        </div>
    )
}

