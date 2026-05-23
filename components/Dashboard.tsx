"use client";

import { supabase } from "@/lib/supabase"
import { useEffect, useState } from "react";

interface SalesDeal {
    name: string;
    value: number;
};

export default function Dashboard()
{   
    const [ deals, setDeals ] = useState<SalesDeal[]>([]);
    const [ loading, setLoading ] = useState<boolean>(true);
    const [ error, setError ] = useState<string | null>(null);

    useEffect(() => {
        const fetchMetrics = async () => {
            try{
                const { data, error } = await supabase
                                        .from("sales_deals")
                                        .select("name, value")
                                        .order("value", { ascending: false })
                if (error) {
                    throw error;
                }
                if (data) {
                    setDeals(data ?? []);
                }
            }
            catch(err)
            {
                console.error("Error fetching metrics:", err);
                setError((err as Error).message ?? "Failed to fetch metrics");
            }
            finally{
                setLoading(false);
            }
        };

        fetchMetrics();
    }, []);

    if(loading) return <div>Loading...</div>
    if(error) return <div>Error: {error}</div>
    if(!deals || deals.length === 0) return <div>No deals found.</div>

    return (
        <div>
            <div>
                <h2>Total Sales This Quater ($)</h2>
                {
                    deals && deals.length > 0 ? (
                        deals.map((deal, index) => (
                            <div key={index}>
                                <p>{deal.name}</p>
                                <p>${deal.value.toLocaleString()}</p>
                            </div>
                        ))
                    ) : (
                        <div>No sales data found.</div>
                    )
                }
            </div>
        </div>
    )
}