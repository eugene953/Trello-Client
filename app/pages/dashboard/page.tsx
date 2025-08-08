"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import { API_BASE_URL } from "@/app/utils/config";
import CreateProjectModal from "@/modal/new/page";
import EditProject from "@/modal/EditProjectModal/page";

export default function Dashboard() {
  const [name, setName] = useState("User");
  const [selectedBoard, setSelectedBoard] = useState("welcome");
  const [projects, setProjects] = useState<any[]>([]);
  const router = useRouter();
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editProjectId, setEditProjectId] = useState<number | null>(null);

  const fetchProjects = () => {
    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/pages/login");
      return;
    }
    axios
      .get(`${API_BASE_URL}/api/getAllProject`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      .then((res) => setProjects(res.data.projects))
      .catch((err) => {
        console.error("Failed to fetch projects", err);
        if (err.response?.status === 401) router.push("/login");
      });
  };

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("user") || "{}");
    if (user?.fullName) setName(user.fullName);
    fetchProjects();
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    router.push("/pages/login");
  };

  const handleDelete = async (projectId: number) => {
    const isConfirmed = window.confirm("Are you sure you want to delete this project?");
    if (!isConfirmed) return;

    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/pages/login");
      return;
    }

    try {
      await axios.delete(`${API_BASE_URL}/api/deleteProject/${projectId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setProjects((prevProjects) => prevProjects.filter((project) => project.id !== projectId));
    } catch (error: any) {
      console.error("Failed to delete project:", error);
      if (error.response?.status === 404) {
        alert("Project not found or you're not authorized to delete it.");
      } else {
        alert("An error occurred while deleting the project.");
      }
    }
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-gray-100">
      {/* Sidebar */}
      <aside className="w-full md:w-64 bg-white border-b md:border-b-0 md:border-r p-6 shadow-md">
        <div className="flex flex-col leading-tight ml-2">
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
            onClick={() => setSelectedBoard("projects")}
            className={`block text-left w-full px-4 py-2 rounded ${
              selectedBoard === "projects"
                ? "bg-blue-100 text-blue-700 font-semibold"
                : "hover:bg-gray-100"
            }`}
          >
            My Projects
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
              <p className="text-sm text-blue-100">Welcome back to your dashboard.</p>
            </div>

            <section>
              <h2 className="text-xl font-semibold text-gray-700 mb-4">Boards</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                <div
                  className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg cursor-pointer transition"
                  onClick={() => setSelectedBoard("projects")}
                >
                  <h3 className="text-lg font-bold text-gray-800 mb-2">My Projects</h3>
                  <p className="text-gray-600 text-sm">Organize your projects in one place.</p>
                </div>
              </div>
            </section>
          </>
        )}

        {selectedBoard === "projects" && (
          <div className="p-6 bg-white rounded-xl shadow-md">
            <h2 className="text-2xl font-bold text-gray-800 mb-2">My Projects</h2>
            <p className="text-gray-600 mb-4">Here is where you’ll manage all your boards and projects.</p>

            <div
              className="w-50 h-20 sm:w-28 sm:h-28 md:w-82 md:h-32 flex items-center justify-center bg-gray-100 rounded-lg text-center text-gray-700 font-medium cursor-pointer hover:bg-gray-200 transition mb-6"
              onClick={() => setShowCreateModal(true)}
            >
              + Create New Project
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {projects.map((project) => (
                <div
                  key={project.id}
                  className="bg-gray-50 border rounded-lg p-4 shadow hover:shadow-md transition"
                  onClick={() => {
                    localStorage.setItem("createdProjectTitle", project.title);
                    localStorage.setItem("createdProjectId", project.id);
                    router.push(`/projects/${project.id}/index`);
                  }}
                >
                  <h3 className="text-lg font-semibold text-gray-800 mb-1">{project.title}</h3>
                  <p className="text-sm text-gray-600 mb-2">Status: {project.status}</p>
                  {project.dueDate && (
                    <p className="text-sm text-gray-500">
                      Due: {new Date(project.dueDate).toLocaleDateString()}
                    </p>
                  )}

                  <div
                    className="mt-4 flex space-x-2"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <button
                      onClick={() => setEditProjectId(project.id)}
                      className="text-sm text-blue-600 hover:underline"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(project.id)}
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
        <CreateProjectModal 
        onClose={() => setShowCreateModal(false)} 
        onCreated={fetchProjects} />
      )}

      {editProjectId !== null && (
        <EditProject
          projectId={editProjectId}
          onClose={() => setEditProjectId(null)}
          onUpdated={fetchProjects}
        />
      )}
    </div>
  );
}
