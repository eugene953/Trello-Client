"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";

import CreateTaskModal from "@/modal/new/page";
import { API_BASE_URL } from "@/app/utils/config";
import EditTask from "@/modal/EditTaskModal/page";



export default function Dashboard() {
  const [name, setName] = useState("User");
  const [selectedBoard, setSelectedBoard] = useState("welcome");
  const [tasks, setTasks] = useState<any[]>([]);
  const router = useRouter();
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editTaskId, setEditTaskId] = useState<number | null>(null);


    const fetchTasks = () => {
    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/pages/login");
      return;
    }
    axios.get(`${API_BASE_URL}/api/getAllTask`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      .then((res) => setTasks(res.data.task))
      .catch((err) => {
        console.error("Failed to fetch tasks", err);
        if (err.response?.status === 401) router.push("/login");
      });
  };

   useEffect(() => {
    const user = JSON.parse(localStorage.getItem("user") || "{}");
    if (user?.fullName) setName(user.fullName);
       fetchTasks();
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    router.push("/pages/login");
  };

  
  const handleDelete = async (taskId: number) => {
     const isConfirmed = window.confirm("Are you sure you want to delete this task?");
  if (!isConfirmed) return;

  const token = localStorage.getItem("token");
  if (!token) {
    router.push("/pages/login");
    return;
  }

  try {
    await axios.delete(`${API_BASE_URL}/api/deleteTask/${taskId}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    // Remove the deleted task from state
    setTasks((prevTasks) => prevTasks.filter((task) => task.id !== taskId));
  } catch (error: any) {
    console.error("Failed to delete task:", error);
    if (error.response?.status === 404) {
      alert("Task not found or you're not authorized to delete it.");
    } else {
      alert("An error occurred while deleting the task.");
    }
  }
};

  

  return (
   <div className="min-h-screen flex flex-col md:flex-row bg-gray-100">
      {/* Sidebar */}
     <aside className="w-full md:w-64 bg-white border-b md:border-b-0 md:border-r p-6 shadow-md">
        <div className="flex flex-col leading-tight ml-2 ">
          <div className="text-xs font-bold text-blue-700">WorkGrid</div>
          <span className="text-2xl font-semibold text-gray-800 -mt-1">Trello</span>
        </div>

        <nav className="space-y-4 mt-6">
          <button
            onClick={() => setSelectedBoard("welcome")}
            className={`block text-left w-full px-4 py-2 rounded ${
              selectedBoard === "welcome"
                ? "bg-blue-100 text-blue-700 font-semibold"
                : "hover:bg-gray-100"
            }`}
          >
            Dashboard
          </button>

          <button
            onClick={() => setSelectedBoard("tasks")}
            className={`block text-left w-full px-4 py-2 rounded ${
              selectedBoard === "tasks"
                ? "bg-blue-100 text-blue-700 font-semibold"
                : "hover:bg-gray-100"
            }`}
          >
            My Tasks
          </button>

          <button
            onClick={handleLogout}
            className="block text-left w-full px-4 py-2 rounded bg-red-500 text-white hover:bg-red-600 mt-8"
          >
            Logout
          </button>
        </nav>
      </aside>

      {/* Main Content */}
       <main className="flex-1 p-4 md:p-10">
        {selectedBoard === "welcome" && (
          <>
            <div className="bg-gradient-to-r from-blue-500 to-indigo-600 rounded-lg p-8 text-white shadow-md mb-6">
              <h1 className="text-3xl font-bold mb-1">Hi, {name} 👋</h1>
              <p className="text-sm text-blue-100">Welcome back to your task dashboard.</p>
            </div>

            <section>
              <h2 className="text-xl font-semibold text-gray-700 mb-4">Boards</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                <div
                  className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg cursor-pointer transition"
                  onClick={() => setSelectedBoard("tasks")}
                >
                  <h3 className="text-lg font-bold text-gray-800 mb-2">My Tasks</h3>
                  <p className="text-gray-600 text-sm">Organize your tasks in one place.</p>
                </div>
              </div>
            </section>
          </>
        )}

        {selectedBoard === "tasks" && (
          <div className="p-6 bg-white rounded-xl shadow-md">
            <h2 className="text-2xl font-bold text-gray-800 mb-2">My Tasks</h2>
            <p className="text-gray-600 mb-4">Here is where you’ll manage all your tasks and boards.</p>

           <div
           className="w-50 h-20 sm:w-28 sm:h-28 md:w-82 md:h-32 flex items-center justify-center bg-gray-100 rounded-lg text-center text-gray-700 font-medium cursor-pointer hover:bg-gray-200 transition mb-6"
           onClick={() => setShowCreateModal(true)}
          >
              + Create New Task
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {tasks.map((task) => (
                <div
                  key={task.id}
                  className="bg-gray-50 border rounded-lg p-4 shadow hover:shadow-md transition"
                onClick={() => {
                  localStorage.setItem("createdTaskTitle", task.title);
                  localStorage.setItem("createdTaskId", task.id);
                  router.push(`/tasks/${task.id}/index`);
                }}
                >
                  <h3 className="text-lg font-semibold text-gray-800 mb-1">{task.title}</h3>
                  <p className="text-sm text-gray-600 mb-2">Status: {task.status}</p>
                  {task.dueDate && (
                    <p className="text-sm text-gray-500">Due: {new Date(task.dueDate).toLocaleDateString()}</p>
                  )}
                  
                  <div className="mt-4 flex space-x-2"
                 onClick={(e) => e.stopPropagation()}
                  >
                    <button
                      onClick={() => setEditTaskId(task.id)}
                      className="text-sm text-blue-600 hover:underline"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(task.id)}
                      className="text-sm text-red-600 hover:underline"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>

 {showCreateModal && (
        <CreateTaskModal
          onClose={() => setShowCreateModal(false)}
          onCreated={fetchTasks}
        />
      )}

  {editTaskId !== null && (
  <EditTask
    taskId={editTaskId}
    onClose={() => setEditTaskId(null)}
    onUpdated={fetchTasks}
  />
)}


    </div>
  );
}
