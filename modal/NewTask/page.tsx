"use client";

import { useState, useEffect } from "react";
import axios from "axios";
import { FiX } from "react-icons/fi";
import { API_BASE_URL } from "@/app/utils/config";

interface Props {
  onClose: () => void;
  onCreated: () => void;
}

export default function CreateTaskModal({ onClose, onCreated }: Props) {
  const [token, setToken] = useState<string | null>(null);
  const [projectId, setProjectId] = useState<number | null>(null);
  const [form, setForm] = useState({
    title: "",
    description: "",
    dueDate: "",
    status: "pending",
  });
  const [error, setError] = useState("");

  useEffect(() => {
    const storedToken = localStorage.getItem("token");
    const storedProjectId = localStorage.getItem("createdProjectId");

  console.log("Token from localStorage:", storedToken);
  console.log("ProjectId from localStorage:", storedProjectId);

    if (storedToken) setToken(storedToken);
    if (storedProjectId) setProjectId(Number(storedProjectId));
  }, []);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  setError("");

  console.log("Submitting with projectId:", projectId);

  if (!form.title.trim()) {
    setError("Title is required");
    return;
  }

  if (!projectId) {
    setError("Project ID is missing.");
    return;
  }

  try {
    await axios.post(
      `${API_BASE_URL}/api/createTask`,
      {
        title: form.title,
        description: form.description || null,
        status: form.status,
        dueDate: form.dueDate ? new Date(form.dueDate).toISOString() : null,
        projectId: projectId,
      },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    onCreated(); // refresh task list
    onClose();   // close modal
  } catch (err) {
    console.error(err);
    setError("Failed to create task. Please try again.");
  }
};


  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto">
      <form
        onSubmit={handleSubmit}
        className="bg-white shadow-xl rounded-xl p-6 w-full max-w-md sm:max-w-lg md:max-w-xl space-y-4 relative"
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-500 hover:text-red-600 text-xl"
          aria-label="Close modal"
          type="button"
        >
          <FiX />
        </button>

        <h2 className="text-2xl sm:text-3xl font-bold mb-2 text-center">Create New Task</h2>

        {error && <p className="text-red-500 text-sm">{error}</p>}

        <div>
          <label className="block text-sm font-medium mb-1">Title *</label>
          <input
            name="title"
            value={form.title}
            onChange={handleChange}
            required
            className="w-full border border-gray-300 rounded px-3 py-2 text-sm sm:text-base"
            placeholder="Enter task title"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Description</label>
          <textarea
            name="description"
            value={form.description}
            onChange={handleChange}
            rows={3}
            className="w-full border border-gray-300 rounded px-3 py-2 text-sm sm:text-base"
            placeholder="Optional description"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Due Date</label>
          <input
            type="date"
            name="dueDate"
            value={form.dueDate}
            onChange={handleChange}
            className="w-full border border-gray-300 rounded px-3 py-2 text-sm sm:text-base"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Status</label>
          <select
            name="status"
            value={form.status}
            onChange={handleChange}
            className="w-full border border-gray-300 rounded px-3 py-2 text-sm sm:text-base"
          >
            <option value="pending">Pending</option>
            <option value="completed">Completed</option>
          </select>
        </div>

        <button
          type="submit"
          className="w-full bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 transition"
        >
          Create Task
        </button>
      </form>
    </div>
  );
}
