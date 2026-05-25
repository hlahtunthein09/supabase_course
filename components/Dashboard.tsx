"use client";

import { supabase } from "@/lib/supabase"
import { useCallback, useEffect, useState } from "react";
import { BarChart, Bar, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import InsertForm from "./InsertForm";
import DealManager from "./DealManager";
import { SalesDeal, SalesTotals } from "@/lib/types";



// interface SalesTotal {
//     name: string;
//     value: number;
// }

export default function Dashboard()
{
    const [ deals, setDeals ] = useState<SalesDeal[]>([]);
    const [ totals, setTotals ] = useState<SalesTotals[]>([]);
    const [ loading, setLoading ] = useState<boolean>(true);
    const [ error, setError ] = useState<string | null>(null);

    // Extract unique names from deals (using Set to remove duplicates)
    const uniqueNames = [ ...new Set(deals.map(deal => deal.name)) ];

    const fetchMetrics = useCallback (async () => {

                try{
                    const p1 = await supabase
                                            .from("sales_deals")
                                            .select("id, name, value")
                                            .order("id", { ascending: true }); // ← oldest first, newest last

                    const p2 = await supabase.from("sales_deals_quarterly_totals")
                                                .select("name, value")
                                                .order("value", { ascending: false });

                    const [ { data: raw, error: e1 }, { data: agg, error: e2} ] = await Promise.all([p1, p2]);

                    if(e1) throw e1;
                    if(e2) throw e2;
                    if(raw) setDeals(raw ?? []);
                    if(agg) setTotals(agg ?? []);
                }
                catch(err)
                {
                    console.error("Error fetching metrics:", err);
                    setError((err as Error).message ?? "Failed to fetch metrics");
                }
                finally{
                    setLoading(false);
                }
            }, []);

    useEffect(() => {

        // Initial fecth
        // Wrap in async function to avoid "synchronous setState" warning
        const loadData = async () => {
            await fetchMetrics();
        };

        loadData();

        
        // Real-time subscription
        const channel = supabase
                        //Creates a named connection endpoint.
                        .channel("deals_changes")
                        //The type of event to listen for. Supabase Realtime supports:
                        //The filter — narrows down exactly which changes trigger your callback.
                        .on(
                            "postgres_changes",
                            { event: "*", schema: "public", table: "sales_deals" },
                            (payload) => {
                                console.log("Change detected:", payload);
                                // Re-fetch to update the chart
                                fetchMetrics();
                            }
                        )
                        .subscribe((status) => {
                            console.log("Realtime status:", status);
                        });

        /* React's useEffect pattern:
            useEffect(() => {
                // SETUP: runs when component mounts
                const channel = supabase.channel(...).on(...).subscribe();

                // TEARDOWN: runs when component unmounts
                return () => {
                    supabase.removeChannel(channel);
                };
            }, []); // ← empty deps = run once on mount, clean up on unmount */

        
        // Cleanup when component unmounts
        return () => {
            supabase.removeChannel(channel);
        };

    }, [fetchMetrics]); // ← add fetchMetrics to dependency array




    if(loading) return <div>Loading...</div>
    if(error) return <div>Error: {error}</div>
    if(!deals || deals.length === 0) return <div>No deals found.</div>

    return (
        // ← vertical stack
        <div className="flex flex-col gap-8 mt-10 px-4"> 

            {/* ← horizontal row for charts */}
            <div className="flex gap-6">
                {/* first chart: All Deals */}
                <div className="flex-1 border border-gray-200 rounded-lg p-4">
                    <h2 className="text-lg font-semibold mb-3">All sale deals ($)</h2>

                    {/* {
                        deals && deals.length > 0 ? (
                            deals.map((deal, index) => (
                                <div key={index}>
                                    <p>{deal.name}</p>
                                    <p>${deal.value.toLocaleString()}</p>
                                </div>
                            ))
                        ) : (
                            <div>No quarterly totals found.</div>
                        )
                    } */}
                    
                    <ResponsiveContainer width="100%" height={300}>
                        {/* data={deals} feeds the raw deals array */}
                        <BarChart data={deals}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis 
                                dataKey="name" 
                                angle={-60}
                                textAnchor="end"
                                height={80}
                                tick={{ fontSize: 12 }}
                                interval={0}
                            />
                            <YAxis />
                            <Tooltip formatter={(value) => [`$${Number(value).toLocaleString()}`, "Amount"]} />
                            {/* Different color so you can tell the charts apart */}
                            <Bar dataKey = "value" fill="#10b981" radius={[4, 4, 0, 0]} />
                        </BarChart>
                    </ResponsiveContainer>
                </div>

                {/* Second chart: Quarterly Totals */}
                <div className="flex-1 border border-gray-200 rounded-lg p-4">
                    <h2 className="text-lg font-semibold mb-3">Quarterly Totals</h2>

                    <ResponsiveContainer width="100%" height={300}>
                        {/* data={totals} feeds the aggregated totals array */}
                        <BarChart data={totals}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis 
                                dataKey="name" 
                                angle={-60}
                                textAnchor="end"
                                height={80}
                                tick={{ fontSize: 12 }}
                                interval={0}
                            />
                            <YAxis />
                            <Tooltip formatter={(value) => [`$${Number(value).toLocaleString()}`, "Revenue"]} />
                            <Bar dataKey="value" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                        </BarChart>
                    </ResponsiveContainer>
                    {/* {
                        totals && totals.length > 0 ? (
                            totals.map((total, index) => (
                                <div key={index}>
                                    <p>{total.name}</p>
                                    <p>${total.value.toLocaleString()}</p>
                                </div>
                            ))
                        ) : (
                            <div>No quarterly totals found.</div>
                        )
                    } */}
                </div>

            </div>

            {/* Form for updating methods */}
            <InsertForm names={uniqueNames} />
            
            {/* Manage existing deals */}
            <DealManager deals={deals} />

        </div>
    )
}
