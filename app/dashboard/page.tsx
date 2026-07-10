"use client";

import { createClient } from '@supabase/supabase-js';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

type Project = {
  id: string;
  name: string;
  client_name: string;
  cid: string;
  package: string;
  project_value: number;
  plot_area: string;
  road_facing: string;
  floors: number;
  status: string;
  rating: number;
  location: string;
  timeline: string;
  features: string[];
  thumbnail?: string | null;
};

type Package = {
  id: string;
  name: string;
  price: number;
  inclusions: string[];
  brands: string[];
  faqs: any;
  image_url: string;
  is_active: boolean;
};

type Testimonial = {
  id: string;
  client_name: string;
  content: string;
  rating: number;
  project_name: string;
  is_featured: boolean;
};

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"projects" | "packages" | "testimonials">("projects");

  // ---------- Projects State ----------
  const [projects, setProjects] = useState<Project[]>([]);
  const [showProjectModal, setShowProjectModal] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [projectForm, setProjectForm] = useState<any>({
    name: "",
    client_name: "",
    cid: "",
    package: "Essential",
    project_value: "",
    plot_area: "",
    road_facing: "",
    floors: "",
    status: "planning",
    rating: "",
    location: "",
    timeline: "",
    features: "",
  });
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);

  // ---------- Packages State ----------
  const [packages, setPackages] = useState<Package[]>([]);
  const [showPackageModal, setShowPackageModal] = useState(false);
  const [editingPackage, setEditingPackage] = useState<Package | null>(null);
  const [packageForm, setPackageForm] = useState<any>({
    name: "",
    price: "",
    inclusions: "",
    brands: "",
    faqs: "",
    image_url: "",
    is_active: true,
  });

  // ---------- Testimonials State ----------
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [showTestimonialModal, setShowTestimonialModal] = useState(false);
  const [editingTestimonial, setEditingTestimonial] = useState<Testimonial | null>(null);
  const [testimonialForm, setTestimonialForm] = useState({
    client_name: "",
    content: "",
    rating: "",
    project_name: "",
    is_featured: false,
  });

  // ---------- Auth & Data Fetch (✅ FIXED) ----------
  useEffect(() => {
    const checkUser = async () => {
      try {
        const { data: { user }, error } = await supabase.auth.getUser();
        console.log("🔍 User:", user, "Error:", error);

        if (error || !user) {
          console.log("❌ No user, redirecting to /login");
          router.push("/login");
          return;
        }

        setUser(user);
        await Promise.all([fetchProjects(), fetchPackages(), fetchTestimonials()]);
        setLoading(false);
      } catch (err) {
        console.error("❌ Dashboard Error:", err);
        router.push("/login");
      }
    };

    checkUser();
  }, []);

  // ---------- Fetch Functions ----------
  async function fetchProjects() {
    const { data, error } = await supabase
      .from("projects")
      .select(`*, project_images (image_url)`)
      .order("created_at", { ascending: false });
    if (error) {
      console.error("Failed to fetch projects:", error.message);
      return;
    }
    const formatted = (data || []).map((p: any) => ({
      ...p,
      features: p.features || [],
      thumbnail: p.project_images?.length > 0 ? p.project_images[0].image_url : null,
    }));
    setProjects(formatted);
  }

  async function fetchPackages() {
    const { data, error } = await supabase
      .from("packages")
      .select("*")
      .order("name", { ascending: true });
    if (error) {
      console.error("Failed to fetch packages:", error.message);
      return;
    }
    setPackages(data || []);
  }

  async function fetchTestimonials() {
    const { data, error } = await supabase
      .from("testimonials")
      .select("*")
      .order("created_at", { ascending: false });
    if (error) {
      console.error("Failed to fetch testimonials:", error.message);
      return;
    }
    setTestimonials(data || []);
  }

  // ---------- Handle Project Submit ----------
  async function handleProjectSubmit(e: React.FormEvent) {
    e.preventDefault();
    try {
      const payload = {
        name: projectForm.name,
        client_name: projectForm.client_name,
        cid: projectForm.cid,
        package: projectForm.package,
        project_value: parseFloat(projectForm.project_value) || 0,
        plot_area: projectForm.plot_area,
        road_facing: projectForm.road_facing,
        floors: parseInt(projectForm.floors) || 0,
        status: projectForm.status,
        rating: parseInt(projectForm.rating) || 0,
        location: projectForm.location,
        timeline: projectForm.timeline,
        features: projectForm.features
          ? projectForm.features.split("\n").filter((s: string) => s.trim())
          : [],
      };

      let projectId = editingProject?.id;
      if (editingProject) {
        const { error } = await supabase
          .from("projects")
          .update(payload)
          .eq("id", editingProject.id);
        if (error) throw error;
      } else {
        const { data, error } = await supabase
          .from("projects")
          .insert(payload)
          .select()
          .single();
        if (error) throw error;
        projectId = data.id;
      }

      // Handle Images Upload
      if (selectedFiles.length > 0 && projectId) {
        const imageUrls: string[] = [];
        for (const file of selectedFiles) {
          const fileExt = file.name.split(".").pop();
          const fileName = `${Date.now()}_${Math.random().toString(36).substring(2, 15)}.${fileExt}`;
          const filePath = `projects/${projectId}/${fileName}`;

          const { error: uploadError } = await supabase.storage
            .from("projects")
            .upload(filePath, file);
          if (uploadError) {
            console.error("Upload error:", uploadError);
            continue;
          }

          const { data: { publicUrl } } = supabase.storage.from("projects").getPublicUrl(filePath);

          await supabase.from("project_images").insert({
            project_id: projectId,
            image_url: publicUrl,
            is_gallery: true,
            is_video: false,
            sort_order: imageUrls.length,
          });
          imageUrls.push(publicUrl);
        }
      }

      setShowProjectModal(false);
      setEditingProject(null);
      resetProjectForm();
      fetchProjects();
    } catch (error) {
      alert("Error saving project: " + (error as any).message);
    }
  }

  async function deleteProject(id: string) {
    if (!confirm("Are you sure you want to delete this project?")) return;
    const { error } = await supabase.from("projects").delete().eq("id", id);
    if (error) {
      alert("Error deleting project: " + error.message);
    } else {
      fetchProjects();
    }
  }

  function resetProjectForm() {
    setProjectForm({
      name: "",
      client_name: "",
      cid: "",
      package: "Essential",
      project_value: "",
      plot_area: "",
      road_facing: "",
      floors: "",
      status: "planning",
      rating: "",
      location: "",
      timeline: "",
      features: "",
    });
    setSelectedFiles([]);
    setEditingProject(null);
  }

  // ---------- Handle Package Submit ----------
  async function handlePackageSubmit(e: React.FormEvent) {
    e.preventDefault();
    try {
      const payload = {
        name: packageForm.name,
        price: parseFloat(packageForm.price) || 0,
        inclusions: packageForm.inclusions
          ? packageForm.inclusions.split("\n").filter((s: string) => s.trim())
          : [],
        brands: packageForm.brands
          ? packageForm.brands.split("\n").filter((s: string) => s.trim())
          : [],
        faqs: packageForm.faqs ? JSON.parse(packageForm.faqs) : [],
        image_url: packageForm.image_url || "",
        is_active: packageForm.is_active,
      };

      if (editingPackage) {
        const { error } = await supabase
          .from("packages")
          .update(payload)
          .eq("id", editingPackage.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("packages").insert(payload);
        if (error) throw error;
      }

      setShowPackageModal(false);
      resetPackageForm();
      fetchPackages();
    } catch (error) {
      alert("Error saving package: " + (error as any).message);
    }
  }

  async function deletePackage(id: string) {
    if (!confirm("Are you sure you want to delete this package?")) return;
    const { error } = await supabase.from("packages").delete().eq("id", id);
    if (error) {
      alert("Error deleting package: " + error.message);
    } else {
      fetchPackages();
    }
  }

  function resetPackageForm() {
    setPackageForm({
      name: "",
      price: "",
      inclusions: "",
      brands: "",
      faqs: "",
      image_url: "",
      is_active: true,
    });
    setEditingPackage(null);
  }

  // ---------- Handle Testimonial Submit ----------
  async function handleTestimonialSubmit(e: React.FormEvent) {
    e.preventDefault();
    try {
      const payload = {
        client_name: testimonialForm.client_name,
        content: testimonialForm.content,
        rating: parseInt(testimonialForm.rating) || 0,
        project_name: testimonialForm.project_name,
        is_featured: testimonialForm.is_featured,
      };

      if (editingTestimonial) {
        const { error } = await supabase
          .from("testimonials")
          .update(payload)
          .eq("id", editingTestimonial.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("testimonials").insert(payload);
        if (error) throw error;
      }

      setShowTestimonialModal(false);
      resetTestimonialForm();
      fetchTestimonials();
    } catch (error) {
      alert("Error saving testimonial: " + (error as any).message);
    }
  }

  async function deleteTestimonial(id: string) {
    if (!confirm("Are you sure you want to delete this testimonial?")) return;
    const { error } = await supabase.from("testimonials").delete().eq("id", id);
    if (error) {
      alert("Error deleting testimonial: " + error.message);
    } else {
      fetchTestimonials();
    }
  }

  function resetTestimonialForm() {
    setTestimonialForm({
      client_name: "",
      content: "",
      rating: "",
      project_name: "",
      is_featured: false,
    });
    setEditingTestimonial(null);
  }

  // ---------- Logout ----------
  async function handleLogout() {
    await supabase.auth.signOut();
    router.push("/");
  }

  if (loading) return <div className="p-8 text-center text-gray-600">Loading...</div>;

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="mx-auto max-w-7xl px-4 py-6 flex justify-between items-center">
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-600">Logged in as {user?.email}</span>
            <button onClick={handleLogout} className="rounded bg-red-600 px-4 py-2 text-white hover:bg-red-700">
              Logout
            </button>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-7xl px-4 py-6">
        {/* Tabs */}
        <div className="border-b border-gray-200 mb-6">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => setActiveTab("projects")}
              className={`py-2 px-1 border-b-2 font-medium ${
                activeTab === "projects" ? "border-indigo-500 text-indigo-600" : "border-transparent text-gray-500 hover:text-gray-700"
              }`}
            >
              Projects
            </button>
            <button
              onClick={() => setActiveTab("packages")}
              className={`py-2 px-1 border-b-2 font-medium ${
                activeTab === "packages" ? "border-indigo-500 text-indigo-600" : "border-transparent text-gray-500 hover:text-gray-700"
              }`}
            >
              Packages
            </button>
            <button
              onClick={() => setActiveTab("testimonials")}
              className={`py-2 px-1 border-b-2 font-medium ${
                activeTab === "testimonials" ? "border-indigo-500 text-indigo-600" : "border-transparent text-gray-500 hover:text-gray-700"
              }`}
            >
              Testimonials
            </button>
          </nav>
        </div>

        {/* ========== PROJECTS TAB ========== */}
        {activeTab === "projects" && (
          <div>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">Projects</h2>
              <button
                onClick={() => { resetProjectForm(); setShowProjectModal(true); }}
                className="rounded bg-indigo-600 px-4 py-2 text-white hover:bg-indigo-700"
              >
                Add Project
              </button>
            </div>
            <div className="bg-white shadow overflow-hidden sm:rounded-md">
              {projects.length === 0 ? (
                <div className="p-6 text-center text-gray-500">No projects yet.</div>
              ) : (
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Image</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Project</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Client</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Rating</th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {projects.map((project) => (
                      <tr key={project.id}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {project.thumbnail ? (
                            <img src={project.thumbnail} alt={project.name} className="h-10 w-10 object-cover rounded" />
                          ) : (
                            <div className="h-10 w-10 bg-gray-200 rounded"></div>
                          )}
                        </td>
                        <td className="px-6 py-4 font-medium text-gray-900">{project.name}</td>
                        <td className="px-6 py-4">{project.client_name}</td>
                        <td className="px-6 py-4">
                          <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            project.status === "completed" ? "bg-green-100 text-green-800" :
                            project.status === "ongoing" ? "bg-yellow-100 text-yellow-800" :
                            "bg-blue-100 text-blue-800"
                          }`}>
                            {project.status}
                          </span>
                        </td>
                        <td className="px-6 py-4">{project.rating || "-"}</td>
                        <td className="px-6 py-4 text-right text-sm font-medium">
                          <button
                            onClick={() => {
                              setEditingProject(project);
                              setProjectForm({
                                ...project,
                                features: Array.isArray(project.features) ? project.features.join("\n") : "",
                                project_value: project.project_value || "",
                                floors: project.floors || "",
                                rating: project.rating || "",
                              });
                              setShowProjectModal(true);
                            }}
                            className="text-indigo-600 hover:text-indigo-900 mr-4"
                          >
                            Edit
                          </button>
                          <button onClick={() => deleteProject(project.id)} className="text-red-600 hover:text-red-900">
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        )}

        {/* ========== PACKAGES TAB ========== */}
        {activeTab === "packages" && (
          <div>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">Packages</h2>
              <button
                onClick={() => { resetPackageForm(); setShowPackageModal(true); }}
                className="rounded bg-indigo-600 px-4 py-2 text-white hover:bg-indigo-700"
              >
                Add Package
              </button>
            </div>
            <div className="bg-white shadow overflow-hidden sm:rounded-md">
              {packages.length === 0 ? (
                <div className="p-6 text-center text-gray-500">No packages yet.</div>
              ) : (
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Price</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {packages.map((pkg) => (
                      <tr key={pkg.id}>
                        <td className="px-6 py-4 font-medium text-gray-900">{pkg.name}</td>
                        <td className="px-6 py-4">₹{pkg.price.toLocaleString()}</td>
                        <td className="px-6 py-4">
                          <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            pkg.is_active ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
                          }`}>
                            {pkg.is_active ? "Active" : "Inactive"}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right text-sm font-medium">
                          <button
                            onClick={() => {
                              setEditingPackage(pkg);
                              setPackageForm({
                                name: pkg.name,
                                price: pkg.price,
                                inclusions: Array.isArray(pkg.inclusions) ? pkg.inclusions.join("\n") : "",
                                brands: Array.isArray(pkg.brands) ? pkg.brands.join("\n") : "",
                                faqs: JSON.stringify(pkg.faqs || "", null, 2),
                                image_url: pkg.image_url || "",
                                is_active: pkg.is_active,
                              });
                              setShowPackageModal(true);
                            }}
                            className="text-indigo-600 hover:text-indigo-900 mr-4"
                          >
                            Edit
                          </button>
                          <button onClick={() => deletePackage(pkg.id)} className="text-red-600 hover:text-red-900">
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        )}

        {/* ========== TESTIMONIALS TAB ========== */}
        {activeTab === "testimonials" && (
          <div>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">Testimonials</h2>
              <button
                onClick={() => { resetTestimonialForm(); setShowTestimonialModal(true); }}
                className="rounded bg-indigo-600 px-4 py-2 text-white hover:bg-indigo-700"
              >
                Add Testimonial
              </button>
            </div>
            <div className="bg-white shadow overflow-hidden sm:rounded-md">
              {testimonials.length === 0 ? (
                <div className="p-6 text-center text-gray-500">No testimonials yet.</div>
              ) : (
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Client</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Review</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Rating</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Featured</th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {testimonials.map((item) => (
                      <tr key={item.id}>
                        <td className="px-6 py-4 font-medium text-gray-900">{item.client_name}</td>
                        <td className="px-6 py-4 max-w-xs truncate">{item.content}</td>
                        <td className="px-6 py-4">{item.rating} ⭐</td>
                        <td className="px-6 py-4">
                          {item.is_featured ? (
                            <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">Yes</span>
                          ) : (
                            <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-gray-100 text-gray-800">No</span>
                          )}
                        </td>
                        <td className="px-6 py-4 text-right text-sm font-medium">
                          <button
                            onClick={() => {
                              setEditingTestimonial(item);
                              setTestimonialForm({
                                client_name: item.client_name,
                                content: item.content,
                                rating: item.rating.toString(),
                                project_name: item.project_name || "",
                                is_featured: item.is_featured,
                              });
                              setShowTestimonialModal(true);
                            }}
                            className="text-indigo-600 hover:text-indigo-900 mr-4"
                          >
                            Edit
                          </button>
                          <button onClick={() => deleteTestimonial(item.id)} className="text-red-600 hover:text-red-900">
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        )}
      </div>

      {/* ---------- PROJECT MODAL ---------- */}
      {showProjectModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4">
            <div className="fixed inset-0 bg-gray-500 bg-opacity-75"></div>
            <div className="relative bg-white rounded-lg max-w-3xl w-full p-6 max-h-[90vh] overflow-y-auto">
              <h2 className="text-xl font-bold mb-4">{editingProject ? "Edit Project" : "Add Project"}</h2>
              <form onSubmit={handleProjectSubmit}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <input type="text" placeholder="Project Name *" className="border p-2 rounded" value={projectForm.name} onChange={(e) => setProjectForm({ ...projectForm, name: e.target.value })} required />
                  <input type="text" placeholder="Client Name *" className="border p-2 rounded" value={projectForm.client_name} onChange={(e) => setProjectForm({ ...projectForm, client_name: e.target.value })} required />
                  <input type="text" placeholder="CID" className="border p-2 rounded" value={projectForm.cid} onChange={(e) => setProjectForm({ ...projectForm, cid: e.target.value })} />
                  <select className="border p-2 rounded" value={projectForm.package} onChange={(e) => setProjectForm({ ...projectForm, package: e.target.value })}>
                    <option>Essential</option><option>Solid Structure</option><option>Premium Luxury</option><option>Custom</option>
                  </select>
                  <input type="number" placeholder="Project Value" className="border p-2 rounded" value={projectForm.project_value} onChange={(e) => setProjectForm({ ...projectForm, project_value: e.target.value })} />
                  <input type="text" placeholder="Plot Area" className="border p-2 rounded" value={projectForm.plot_area} onChange={(e) => setProjectForm({ ...projectForm, plot_area: e.target.value })} />
                  <input type="text" placeholder="Road Facing" className="border p-2 rounded" value={projectForm.road_facing} onChange={(e) => setProjectForm({ ...projectForm, road_facing: e.target.value })} />
                  <input type="number" placeholder="Floors" className="border p-2 rounded" value={projectForm.floors} onChange={(e) => setProjectForm({ ...projectForm, floors: e.target.value })} />
                  <select className="border p-2 rounded" value={projectForm.status} onChange={(e) => setProjectForm({ ...projectForm, status: e.target.value })}>
                    <option value="planning">Planning</option><option value="ongoing">Ongoing</option><option value="completed">Completed</option>
                  </select>
                  <input type="number" placeholder="Rating (0-5)" className="border p-2 rounded" value={projectForm.rating} onChange={(e) => setProjectForm({ ...projectForm, rating: e.target.value })} />
                  <input type="text" placeholder="Location" className="border p-2 rounded" value={projectForm.location} onChange={(e) => setProjectForm({ ...projectForm, location: e.target.value })} />
                  <input type="text" placeholder="Timeline (e.g. Jan 2026 - Jun 2026)" className="border p-2 rounded" value={projectForm.timeline} onChange={(e) => setProjectForm({ ...projectForm, timeline: e.target.value })} />
                  <div className="col-span-2">
                    <label className="block text-sm font-medium text-gray-700">Features (ek feature per line)</label>
                    <textarea className="border p-2 rounded w-full" rows={3} value={projectForm.features} onChange={(e) => setProjectForm({ ...projectForm, features: e.target.value })} />
                  </div>
                  <div className="col-span-2">
                    <label className="block text-sm font-medium text-gray-700">Project Images</label>
                    <input type="file" multiple accept="image/*" className="border p-2 rounded w-full" onChange={(e) => { const files = e.target.files; if (files) { setSelectedFiles(Array.from(files)); } }} />
                    <p className="text-xs text-gray-500 mt-1">Multiple images select kar sakte hain. Pehli image dashboard thumbnail banegi.</p>
                  </div>
                </div>
                <div className="flex justify-end gap-3 mt-4">
                  <button type="button" onClick={() => { setShowProjectModal(false); resetProjectForm(); }} className="px-4 py-2 border rounded">Cancel</button>
                  <button type="submit" className="px-4 py-2 bg-indigo-600 text-white rounded">{editingProject ? "Update Project" : "Create Project"}</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* ---------- PACKAGE MODAL ---------- */}
{showPackageModal && (
  <div className="fixed inset-0 z-50 overflow-y-auto">
    <div className="flex min-h-full items-center justify-center p-4">
      <div className="fixed inset-0 bg-gray-500 bg-opacity-75"></div>
      <div className="relative bg-white rounded-lg max-w-3xl w-full p-6 max-h-[90vh] overflow-y-auto">
        <h2 className="text-xl font-bold mb-4">{editingPackage ? "Edit Package" : "Add Package"}</h2>
        <form onSubmit={handlePackageSubmit}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input type="text" placeholder="Package Name *" className="border p-2 rounded" value={packageForm.name} onChange={(e) => setPackageForm({ ...packageForm, name: e.target.value })} required />
            <input type="number" placeholder="Price *" className="border p-2 rounded" value={packageForm.price} onChange={(e) => setPackageForm({ ...packageForm, price: e.target.value })} required />
            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700">Inclusions (ek feature per line)</label>
              <textarea className="border p-2 rounded w-full" rows={3} value={packageForm.inclusions} onChange={(e) => setPackageForm({ ...packageForm, inclusions: e.target.value })} />
            </div>
            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700">Brands (ek brand per line)</label>
              <textarea className="border p-2 rounded w-full" rows={2} value={packageForm.brands} onChange={(e) => setPackageForm({ ...packageForm, brands: e.target.value })} />
            </div>
            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700">
                FAQs (Valid JSON format, e.g. {`[{"question":"Q1","answer":"A1"}]`})
              </label>
              <textarea className="border p-2 rounded w-full" rows={3} value={packageForm.faqs} onChange={(e) => setPackageForm({ ...packageForm, faqs: e.target.value })} placeholder='[{"question":"What is included?","answer":"Everything!"}]' />
            </div>
            <input type="text" placeholder="Image URL" className="border p-2 rounded col-span-2" value={packageForm.image_url} onChange={(e) => setPackageForm({ ...packageForm, image_url: e.target.value })} />
            <div className="col-span-2 flex items-center gap-2">
              <input type="checkbox" checked={packageForm.is_active} onChange={(e) => setPackageForm({ ...packageForm, is_active: e.target.checked })} />
              <label className="text-sm font-medium text-gray-700">Active</label>
            </div>
          </div>
          <div className="flex justify-end gap-3 mt-4">
            <button type="button" onClick={() => { setShowPackageModal(false); resetPackageForm(); }} className="px-4 py-2 border rounded">Cancel</button>
            <button type="submit" className="px-4 py-2 bg-indigo-600 text-white rounded">{editingPackage ? "Update Package" : "Create Package"}</button>
          </div>
        </form>
      </div>
    </div>
  </div>
)}
      {/* ---------- TESTIMONIAL MODAL ---------- */}
      {showTestimonialModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4">
            <div className="fixed inset-0 bg-gray-500 bg-opacity-75"></div>
            <div className="relative bg-white rounded-lg max-w-2xl w-full p-6">
              <h2 className="text-xl font-bold mb-4">{editingTestimonial ? "Edit Testimonial" : "Add Testimonial"}</h2>
              <form onSubmit={handleTestimonialSubmit}>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Client Name *</label>
                    <input type="text" className="border p-2 rounded w-full" value={testimonialForm.client_name} onChange={(e) => setTestimonialForm({ ...testimonialForm, client_name: e.target.value })} required />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Review *</label>
                    <textarea className="border p-2 rounded w-full" rows={4} value={testimonialForm.content} onChange={(e) => setTestimonialForm({ ...testimonialForm, content: e.target.value })} required />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Rating (0-5)</label>
                    <input type="number" min="0" max="5" className="border p-2 rounded w-full" value={testimonialForm.rating} onChange={(e) => setTestimonialForm({ ...testimonialForm, rating: e.target.value })} />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Project Name (Optional)</label>
                    <input type="text" className="border p-2 rounded w-full" value={testimonialForm.project_name} onChange={(e) => setTestimonialForm({ ...testimonialForm, project_name: e.target.value })} />
                  </div>
                  <div className="flex items-center gap-2">
                    <input type="checkbox" checked={testimonialForm.is_featured} onChange={(e) => setTestimonialForm({ ...testimonialForm, is_featured: e.target.checked })} />
                    <label className="text-sm font-medium text-gray-700">Feature on Homepage</label>
                  </div>
                </div>
                <div className="flex justify-end gap-3 mt-6">
                  <button type="button" onClick={() => { setShowTestimonialModal(false); resetTestimonialForm(); }} className="px-4 py-2 border rounded">Cancel</button>
                  <button type="submit" className="px-4 py-2 bg-indigo-600 text-white rounded">{editingTestimonial ? "Update Testimonial" : "Create Testimonial"}</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}