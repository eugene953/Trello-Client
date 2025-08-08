"use client";

import { useState, useEffect } from "react";
import axios from "axios";
import { FiX } from "react-icons/fi";
import { API_BASE_URL } from "@/app/utils/config";

interface Task {
  id: number;
  title: string;
  description: string | null;
  status: string;
  dueDate: string | null;
  projectId: number;
}

interface EditTaskModalProps {
  task: Task; 
  onClose: () => void;
  onUpdated: () => void;
}

export default function EditTaskModal({ task, onClose, onUpdated }: EditTaskModalProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [form, setForm] = useState({
    title: task.title || "",
    description: task.description || "",
    dueDate: task.dueDate ? task.dueDate.slice(0, 10) : "",
    status: task.status || "pending",
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!form.title.trim()) {
      setError("Title is required");
      return;
    }

    const token = localStorage.getItem("token");
    if (!token) return;

    setLoading(true);
    try {
      await axios.put(
        `${API_BASE_URL}/api/updateTask/${task.id}`,
        {
          ...form,
          dueDate: form.dueDate || null,
          projectId: task.projectId,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      onUpdated();
      onClose();
    } catch (err: any) {
      console.error("Update task error:", err?.response?.data || err.message);
      setError("Failed to update task. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 ">
      <div className="bg-white rounded-2xl shadow-lg w-full max-w-lg p-6 relative">
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-gray-500 hover:text-red-600 text-xl"
          aria-label="Close modal"
        >
          <FiX />
        </button>

        <h2 className="text-2xl font-semibold text-center mb-4">Edit Task</h2>

        {error && <p className="text-red-500 text-sm mb-2">{error}</p>}

        <form onSubmit={handleSubmit} className="space-y-4">
        
          <div>
            <label className="block text-sm font-medium mb-1">Title *</label>
            <input
              type="text"
              name="title"
              value={form.title}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded px-3 py-2"
              required
            />
          </div>

        
          <div>
            <label className="block text-sm font-medium mb-1">Description</label>
            <textarea
              name="description"
              value={form.description}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded px-3 py-2"
              rows={3}
            />
          </div>

    
          <div>
            <label className="block text-sm font-medium mb-1">Due Date</label>
            <input
              type="date"
              name="dueDate"
              value={form.dueDate}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded px-3 py-2"
            />
          </div>

       
          <div>
            <label className="block text-sm font-medium mb-1">Status</label>
            <select
              name="status"
              value={form.status}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded px-3 py-2"
            >
              <option value="pending">Pending</option>
              <option value="completed">Completed</option>
            </select>
          </div>

        
          <button
            type="submit"
            className="w-full bg-green-600 text-white font-medium py-2 rounded transition"
            disabled={loading}
          >
            {loading ? "Updating..." : "Update Task"}
          </button>
        </form>
      </div>
    </div>
  );
}
