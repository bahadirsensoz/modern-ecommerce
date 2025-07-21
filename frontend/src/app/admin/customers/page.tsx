"use client"

import { useEffect, useState } from "react";
import AdminGuard from "@/components/guards/AdminGuard";
import { useAuthStore } from "@/store/authStore";
import { User, Order } from "@/types";
import { logTokenInfo, isValidJWT } from "@/utils/tokenValidation";

export default function AdminCustomersPage() {
    const [customers, setCustomers] = useState<User[]>([]);
    const [search, setSearch] = useState("");
    const [selected, setSelected] = useState<User | null>(null);
    const [orders, setOrders] = useState<Order[]>([]);
    const { isAuthenticated, token } = useAuthStore();

    useEffect(() => {
        fetchCustomers();
    }, []);

    const fetchCustomers = async () => {
        if (!isAuthenticated || !token) return;
        logTokenInfo(token, "AdminFetchCustomers");
        if (!isValidJWT(token)) return;
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/admin/customers`, {
            headers: {
                Authorization: `Bearer ${token}`,
                "Content-Type": "application/json",
            },
            credentials: "include",
        });
        if (res.ok) {
            const data = await res.json();
            setCustomers(data);
        }
    };

    const fetchCustomerOrders = async (userId: string) => {
        if (!isAuthenticated || !token) return;
        logTokenInfo(token, "AdminFetchCustomerOrders");
        if (!isValidJWT(token)) return;
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/admin/customers/${userId}/orders`, {
            headers: {
                Authorization: `Bearer ${token}`,
                "Content-Type": "application/json",
            },
            credentials: "include",
        });
        if (res.ok) {
            const data = await res.json();
            setOrders(data);
        }
    };

    const filtered = customers.filter((c) =>
        c.email.toLowerCase().includes(search.toLowerCase()) ||
        (c.firstName && c.firstName.toLowerCase().includes(search.toLowerCase())) ||
        (c.lastName && c.lastName.toLowerCase().includes(search.toLowerCase()))
    );

    return (
        <AdminGuard>
            <div className="p-6 max-w-5xl mx-auto">
                <h1 className="text-4xl font-black mb-8 transform -rotate-2">CUSTOMERS</h1>
                <input
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Search by name or email"
                    className="w-full p-3 border-4 border-black font-bold mb-6"
                />
                <div className="grid gap-4">
                    {filtered.map((customer) => (
                        <div
                            key={customer._id}
                            className="bg-gray-400 p-4 border-4 border-black flex justify-between items-center"
                        >
                            <div>
                                <p className="font-black text-lg">{customer.firstName} {customer.lastName}</p>
                                <p className="text-gray-600">{customer.email}</p>
                                <p className="text-sm">Role: {customer.role}</p>
                            </div>
                            <button
                                className="bg-blue-400 text-white font-black px-4 py-2 border-2 border-black"
                                onClick={() => {
                                    setSelected(customer);
                                    fetchCustomerOrders(customer._id);
                                }}
                            >
                                VIEW
                            </button>
                        </div>
                    ))}
                </div>
                {selected && (
                    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
                        <div className="bg-gray-400 p-6 rounded-lg border-4 border-black w-full max-w-lg">
                            <h2 className="text-2xl font-black mb-2">{selected.firstName} {selected.lastName}</h2>
                            <p className="mb-2">Email: {selected.email}</p>
                            <p className="mb-2">Role: {selected.role}</p>
                            <h3 className="text-xl font-bold mt-4 mb-2">Order History</h3>
                            <div className="max-h-60 overflow-y-auto">
                                {orders.length === 0 ? (
                                    <p className="text-gray-500">No orders found.</p>
                                ) : (
                                    orders.map((order) => (
                                        <div key={order._id} className="border-b py-2">
                                            <div className="flex justify-between">
                                                <span>Order #{order._id.slice(-6)}</span>
                                                <span className="font-bold">₺{order.totalPrice}</span>
                                            </div>
                                            <div className="text-sm text-gray-600">{new Date(order.createdAt).toLocaleDateString()}</div>
                                            <div className="text-sm">Status: {order.status}</div>
                                        </div>
                                    ))
                                )}
                            </div>
                            <button
                                className="mt-4 bg-gray-300 px-4 py-2 font-bold border-2 border-black"
                                onClick={() => setSelected(null)}
                            >
                                Close
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </AdminGuard>
    );
} 