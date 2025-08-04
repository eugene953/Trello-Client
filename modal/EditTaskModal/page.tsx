"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import axios from "axios";
import { FiX } from "react-icons/fi";
import { API_BASE_URL } from "@/app/utils/config";

interface EditTaskModalProps {
  taskId: number;
  onClose: () => void;
  onUpdated: () => void;
}

export default function EditTask({ taskId, onClose, onUpdated }: EditTaskModalProps) {
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [form, setForm] = useState({
    title: "",
    description: "",
    dueDate: "",
    status: "pending",
  });

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) 
      return;
    

    if (!taskId) {
      setError("Task ID not found");
      setLoading(false);
      return;
    }

    const fetchTask = async () => {
      try {
        const response = await axios.get(`${API_BASE_URL}/api/getTaskById/${taskId}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const { title, description, dueDate, status } = response.data;

        setForm({
          title,
          description: description || "",
          dueDate: dueDate ? dueDate.slice(0, 10) : "",
          status: status || "pending",
        });
      } catch (err: any) {
        console.error("Fetch task error:", err.response?.data || err.message);
        setError("Failed to fetch task.");
      } finally {
        setLoading(false);
      }
    };

    fetchTask();
  }, [taskId]);

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
    if (!token) 
      return;
    

    try {
      await axios.put(
        `${API_BASE_URL}/api/updateTask/${taskId}`,
        {
          ...form,
          dueDate: form.dueDate || null,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      onUpdated(); 
      onClose(); 
    } catch (err: any) {
      console.error("Update task error:", err?.response?.data || err.message);
      setError("Failed to update task. Please try again.");
    }
  };

 if (loading) {
    return (
      <div className="fixed inset-0 flex items-center justify-center z-50">
        <div className="text-white text-lg">Loading task...</div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-5 flex items-center justify-center p-4">
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
          >
            Update Task
          </button>
        </form>
      </div>
    </div>
  );
}