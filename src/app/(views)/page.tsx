"use client";

import { useState, useEffect } from "react";

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  createdAt: string;
}

interface ApiResponse<T> {
  success: boolean;
  data: T;
  message: string;
  count?: number;
}

export default function Home() {
  const [roles, setRoles] = useState<string[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        // Fetch roles and users in parallel
        const [rolesResponse, usersResponse] = await Promise.all([
          fetch("/api/roles-data"),
          fetch("/api/users-data"),
        ]);

        const rolesData: ApiResponse<string[]> = await rolesResponse.json();
        const usersData: ApiResponse<User[]> = await usersResponse.json();

        if (rolesData.success) {
          setRoles(rolesData.data);
        }

        if (usersData.success) {
          setUsers(usersData.data);
        }

        setError(null);
      } catch (err) {
        setError("Failed to fetch data");
        console.error("Error:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="font-sans grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20">
        <main className="flex flex-col gap-[32px] row-start-2 items-center sm:items-start">
          <h1 className="text-2xl font-bold">Prisma API Test</h1>
          <p>Loading...</p>
        </main>
      </div>
    );
  }

  return (
    <div className="font-sans grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20">
      <main className="flex flex-col gap-[32px] row-start-2 items-center sm:items-start">
        <h1 className="text-2xl font-bold">Prisma API Test - REST Endpoints</h1>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
            {error}
          </div>
        )}

        <div className="w-full max-w-2xl">
          <h2 className="text-xl font-semibold mb-4">
            Available Roles (GET /api/roles-data):
          </h2>
          <ul className="list-disc list-inside space-y-2">
            {roles.map((role) => (
              <li key={role} className="text-lg">
                {role}
              </li>
            ))}
          </ul>
        </div>

        <div className="w-full max-w-2xl">
          <h2 className="text-xl font-semibold mb-4">
            Users (GET /api/users-data):
          </h2>
          {users.length === 0 ? (
            <p className="text-gray-600">No users found in database</p>
          ) : (
            <div className="space-y-2">
              {users.map((user) => (
                <div key={user.id} className="border p-3 rounded">
                  <p>
                    <strong>Name:</strong> {user.name}
                  </p>
                  <p>
                    <strong>Email:</strong> {user.email}
                  </p>
                  <p>
                    <strong>Role:</strong> {user.role}
                  </p>
                  <p>
                    <strong>Created:</strong>{" "}
                    {new Date(user.createdAt).toLocaleDateString()}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="w-full max-w-2xl">
          <h2 className="text-xl font-semibold mb-4">
            API Endpoints Available:
          </h2>
          <div className="space-y-2 text-sm">
            <div className="border p-2 rounded">
              <code className="font-mono">GET /api/roles-data</code> - List all
              available roles
            </div>
            <div className="border p-2 rounded">
              <code className="font-mono">GET /api/users-data</code> - List all
              users
            </div>
            <div className="border p-2 rounded">
              <code className="font-mono">POST /api/users-data</code> - Create a
              new user
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
