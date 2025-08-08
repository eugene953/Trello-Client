"use client";

import React, { useEffect, useState } from "react";
import CreateTaskModal from "@/modal/NewTask/page";
import axios from "axios";
import { API_BASE_URL } from "@/app/utils/config";
import EditTaskModal from "@/modal/EditTask/page";
import EditTaskDescriptionModal from "@/modal/EditTaskDescription/page";

interface Props {
  task?: Task | null; 
  onClose: () => void;
  onCreated: () => void;
}


interface Task {
  id: number;
  title: string;
  description: string | null;
  status: string;
  dueDate: string | null;
  projectId: number;
}

export default function IndexPage() {
  const [createdTitle, setCreatedTitle] = useState("");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showEditDescriptionModal, setShowEditDescriptionModal] = useState(false);
  const [editTask, setEditTask] = useState<Task | null>(null);
  const [editTaskDescription, setEditTaskDescription] = useState<Task | null>(null);
  const [groupedTasks, setGroupedTasks] = useState<Record<string, Task[]>>({});
  const [projectId, setProjectId] = useState<number | null>(null);

  // Fetch project details from localStorage
  useEffect(() => {
    const storedTitle = localStorage.getItem("createdProjectTitle");
    const storedId = localStorage.getItem("createdProjectId");
    if (storedTitle) setCreatedTitle(storedTitle);
    if (storedId) setProjectId(Number(storedId));
  }, []);

  // Fetch tasks from backend
  useEffect(() => {
    if (!projectId) return;
    fetchTasks();
  }, [projectId]);

  const fetchTasks = async () => {

    try {
      const token = localStorage.getItem("token");
      const res = await axios.get<Task[]>(
        `${API_BASE_URL}/api/getAllTask`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      // Filter by projectId
      const filtered = res.data.filter((task) => task.projectId === projectId);

      // Group by title
      const grouped = filtered.reduce((acc, task) => {
        if (!acc[task.title]) acc[task.title] = [];
        acc[task.title].push(task);
        return acc;
      }, {} as Record<string, Task[]>);

      setGroupedTasks(grouped);
    } catch (err) {
      console.error("Failed to fetch tasks", err);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure you want to delete this task?")) return;
    try {
      const token = localStorage.getItem("token");
      await axios.delete(`${API_BASE_URL}/api/deleteTask/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchTasks();
    } catch (err) {
      console.error("Failed to delete task", err);

       if (axios.isAxiosError(err) && err.response?.status === 401) {
      alert("Session expired. Please log in again.");
      localStorage.removeItem("token");
    }
     }
  };

  const handleEdit = (task: Task, event: React.MouseEvent) => {
    event.stopPropagation();
    setEditTask(task);
    setShowEditModal(true);
  };

  const handleEditDescription = (task: Task) => {
   setEditTaskDescription(task);
   setShowEditDescriptionModal(true);
  }

// Function to truncate text and strip HTML/markdown
  const truncateText = (text: string | null, maxLength: number = 80) => {
    if (!text) return null;
    
    // Strip HTML tags and markdown formatting for display
    const plainText = text
      .replace(/<[^>]*>/g, '') // Remove HTML tags
      .replace(/[#*_`~]/g, '') // Remove markdown formatting
      .trim();
    
    if (plainText.length <= maxLength) {
      return plainText;
    }
    
    return plainText.substring(0, maxLength).trim() + "...";
  };

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      <h1 className="text-3xl font-bold mb-6 text-gray-800">
        {createdTitle || "My Task Board"}
      </h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
        {Object.entries(groupedTasks).map(([title, tasks]) => (
          <div
            key={title}
            className="bg-white rounded shadow-md p-4 w-72 flex-shrink-0"
          >
           
            <h2 className="font-semibold text-lg mb-3">{title}</h2>

            {/* Tasks */}
            <div className="space-y-2">
              {tasks.map((task) => (
                <div
                  key={task.id}
                  onClick={() => handleEditDescription(task)}
                  className="bg-gray-50 border border-gray-300 rounded p-2"
                >
                  <div className="min-h-[3rem] flex flex-col">
                    <p className="text-sm text-gray-700 flex-1">
                      {task.description ? (
                        <span title={task.description}>
                          {truncateText(task.description)}
                        </span>
                      ) : (
                        <i>No description</i>
                      )}
                    </p>
                  </div>

                  {task.dueDate && (
                    <p className="text-xs text-gray-500 mb-2">
                      Due: {new Date(task.dueDate).toLocaleDateString()}
                    </p>
                  )}

                  <p className="text-xs text-gray-400 italic">{task.status}</p>

                  {/* Edit & Delete Buttons */}
                  <div className="flex gap-2 mt-2">
                    <button
                      onClick={(e) => handleEdit(task, e)}
                      className="bg-green-500 text-white px-2 py-1 text-xs rounded hover:bg-green-600"
                    >
                      Edit
                    </button>
                    <button
                     onClick={(e) => {
                        e.stopPropagation();
                        handleDelete(task.id);
                      }}
                      className="bg-red-500 text-white px-2 py-1 text-xs rounded hover:bg-red-600"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}

        {/* Add Task Button Column */}
        <div className="bg-white rounded shadow-md p-20 w-72 flex-shrink-0 flex justify-center">
          <button
            onClick={() => {
              setShowCreateModal(true);
            }}
            className="bg-blue-600 text-white rounded px-4 py-1 hover:bg-blue-700 transition text-sm"
          >
            + Create Task
          </button>
        </div>
      </div>

{showCreateModal && (
        <CreateTaskModal
          onClose={() => setShowCreateModal(false)}
          onCreated={() => {
            setShowCreateModal(false);
            fetchTasks();
          }}
        />
      )}

{showEditModal && editTask && (
  <EditTaskModal
    task={editTask}
    onClose={() => {
      setShowEditModal(false);
      setEditTask(null);
    }}
    onUpdated={() => {
            setShowEditModal(false);
            setEditTask(null);
            fetchTasks();
    }}
  />
)}

{showEditDescriptionModal && editTaskDescription && (
  <EditTaskDescriptionModal
    task={editTaskDescription}
    onClose={() => {
      setShowEditDescriptionModal(false);
      setEditTaskDescription(null);
    }}
    onUpdated={() => {
            setShowEditDescriptionModal(false);
            setEditTaskDescription(null);
            fetchTasks();
          }}
  />
)}

    </div>
  );
}
