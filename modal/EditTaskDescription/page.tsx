"use client";

import { useState, FormEvent } from "react";
import axios from "axios";
import { FiX } from "react-icons/fi";
import dynamic from "next/dynamic";
import { API_BASE_URL } from "@/app/utils/config";

const MDEditor = dynamic(() => import("@uiw/react-md-editor"), { ssr: false });

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

export default function EditTaskDescriptionModal({
  task,
  onClose,
  onUpdated,
}: EditTaskModalProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [description, setDescription] = useState(task.description || "");

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    const token = localStorage.getItem("token");
    if (!token) return;

    setLoading(true);
    try {
      await axios.put(
        `${API_BASE_URL}/api/updateTask/${task.id}`,
        {
          description,
          projectId: task.projectId,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      onUpdated();
      onClose();
    } catch (err: any) {
      console.error("Update task error:", err?.response?.data || err.message);
      setError("Failed to update description. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 ">
      <div className="bg-white rounded-2xl shadow-lg w-full max-w-2xl p-6 relative">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-gray-500 hover:text-red-600 text-xl z-10"
          aria-label="Close modal"
          type="button"
        >
          <FiX />
        </button>

        {/* Title */}
        <h2 className="text-2xl font-semibold text-center mb-4">
          Edit Description
        </h2>

        {error && <p className="text-red-500 text-sm mb-2">{error}</p>}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* MD Editor */}
          <div data-color-mode="light">
            <MDEditor
              value={description}
              onChange={(val) => setDescription(val || "")}
              height={250}
              preview="edit"
              hideToolbar={false}
              visibleDragbar={false}
            />
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            className="w-full bg-green-600 text-white font-medium py-2 rounded transition disabled:opacity-50 mt-4"
            disabled={loading}
          >
            {loading ? "Saving..." : "Save Description"}
          </button>
        </form>
      </div>
    </div>
  );
}