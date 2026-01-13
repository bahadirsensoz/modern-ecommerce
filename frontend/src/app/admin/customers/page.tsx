"use client"

import { useEffect, useState, useCallback } from "react";
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

  const fetchCustomers = useCallback(async () => {
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
  }, [isAuthenticated, token]);

  useEffect(() => {
    fetchCustomers();
  }, [fetchCustomers]);

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
      <div className="page-shell space-y-6 max-w-6xl">
        <div className="flex items-center justify-between">
          <div>
            <p className="pill">Admin</p>
            <h1 className="headline dark:text-white">Customers</h1>
          </div>
        </div>

        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by name or email"
          className="input w-full dark:bg-slate-900 dark:border-slate-700 dark:text-white"
        />

        <div className="grid gap-4 lg:grid-cols-[1.3fr_1fr]">
          <div className="section space-y-3 dark:bg-slate-800 dark:border-slate-700">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">All customers</h2>
            <div className="space-y-3">
              {filtered.map((customer) => (
                <div
                  key={customer._id}
                  className="surface border border-gray-200 rounded-lg p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 dark:bg-slate-900 dark:border-slate-700"
                >
                  <div>
                    <p className="font-semibold text-gray-900 dark:text-white">{customer.firstName} {customer.lastName}</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">{customer.email}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-500">Role: {customer.role}</p>
                  </div>
                  <button
                    className="ghost-btn text-sm dark:text-gray-300 dark:hover:bg-slate-800"
                    onClick={() => {
                      setSelected(customer);
                      fetchCustomerOrders(customer._id);
                    }}
                  >
                    View orders
                  </button>
                </div>
              ))}
              {filtered.length === 0 && (
                <p className="text-sm text-gray-600 dark:text-gray-400">No customers found.</p>
              )}
            </div>
          </div>

          <div className="section space-y-3 dark:bg-slate-800 dark:border-slate-700">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Orders</h2>
            {selected ? (
              <div className="space-y-2">
                <p className="text-sm text-gray-700 font-semibold dark:text-gray-300">{selected.firstName} {selected.lastName}</p>
                {orders.length === 0 ? (
                  <p className="text-sm text-gray-600 dark:text-gray-400">No orders.</p>
                ) : (
                  <div className="space-y-2">
                    {orders.map((order) => (
                      <div key={order._id} className="surface border border-gray-200 rounded-lg p-3 text-sm text-gray-700 dark:bg-slate-900 dark:border-slate-700 dark:text-gray-300">
                        <p className="font-semibold text-gray-900 dark:text-white">Order #{order._id}</p>
                        <p>Date: {new Date(order.createdAt).toLocaleDateString()}</p>
                        <p>Total: ${order.totalPrice.toFixed(2)}</p>
                        <p>Status: {order.status}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <p className="text-sm text-gray-600 dark:text-gray-400">Select a customer to view orders.</p>
            )}
          </div>
        </div>
      </div>
    </AdminGuard>
  );
}
