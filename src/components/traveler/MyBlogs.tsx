import { useState, useEffect } from 'react';
import axios from 'axios';
import type { Blog, BlogFormData } from '../../types';
import Icon from './Icon';

function MyBlogs() {
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<string | null>(null);
  const [form, setForm] = useState<BlogFormData>({ title: '', details: '' });
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);

  const fetchBlogs = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get<{ blogs: Blog[] }>(`${import.meta.env.VITE_API_URL}/api/traveler/blogs`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setBlogs(res.data.blogs);
    } catch (err: unknown) { console.error('Failed to fetch blogs'); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchBlogs(); }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => setForm({ ...form, [e.target.name]: e.target.value });

  const resetForm = () => { setForm({ title: '', details: '' }); setFile(null); setEditing(null); setShowForm(false); };

  const uploadToImgBB = async (imageFile: File): Promise<string | null> => {
    const apiKey = import.meta.env.VITE_IMGBB_API_KEY;
    if (!apiKey) {
      console.error("ImgBB API Key missing");
      return null;
    }
    const formData = new FormData();
    formData.append('image', imageFile);
    try {
      const response = await axios.post(`https://api.imgbb.com/1/upload?key=${apiKey}`, formData);
      return response.data.data.url;
    } catch (error) {
      console.error("ImgBB Upload Failed:", error);
      return null;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsUploading(true);
    try {
      const token = localStorage.getItem('token');
      const payload: Record<string, any> = {};
      if (form.title) payload.title = form.title;
      if (form.details) payload.details = form.details;

      if (file) {
        const imageUrl = await uploadToImgBB(file);
        if (imageUrl) {
          payload.blog_image = imageUrl;
        } else {
          alert("Image upload failed!");
          setIsUploading(false);
          return;
        }
      }

      const config = {
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' }
      };

      if (editing) {
        await axios.put(`${import.meta.env.VITE_API_URL}/api/traveler/blogs/${editing}`, payload, config);
      } else {
        await axios.post(`${import.meta.env.VITE_API_URL}/api/traveler/blogs`, payload, config);
      }
      resetForm();
      fetchBlogs();
    } catch (err: unknown) { console.error('Failed to save blog'); }
    finally { setIsUploading(false); }
  };

  const handleEdit = (blog: Blog) => {
    setForm({ title: blog.title || '', details: blog.details || '' });
    setFile(null);
    setEditing(blog._id);
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Delete this blog?')) return;
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`${import.meta.env.VITE_API_URL}/api/traveler/blogs/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchBlogs();
    } catch (err: unknown) { console.error('Failed to delete blog'); }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">My Blogs</h1>
          <p className="text-gray-500 mt-1">Write and manage your travel stories</p>
        </div>
        <button onClick={() => { resetForm(); setShowForm(!showForm); }}
          className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 ${
            showForm ? 'bg-gray-100 text-gray-700 hover:bg-gray-200' : 'bg-teal-600 hover:bg-teal-700 text-white shadow-lg shadow-teal-500/25 hover:shadow-teal-500/40'
          }`}>
          {showForm ? 'Cancel' : <><Icon name="plus" className="w-4 h-4" /> Create Blog</>}
        </button>
      </div>

      {showForm && (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 animate-fade-in-up">
          <h3 className="text-lg font-bold text-gray-900 mb-5">{editing ? 'Edit Blog' : 'Create New Blog'}</h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Title</label>
              <input name="title" value={form.title} onChange={handleChange} required
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all" placeholder="Blog title" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Blog Image (Optional)</label>
              <label className="flex items-center justify-center gap-2 px-4 py-6 border-2 border-dashed border-gray-200 rounded-xl hover:border-teal-400 hover:bg-teal-50/50 transition-all cursor-pointer">
                <input type="file" accept="image/*" className="hidden" onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFile(e.target.files?.[0] || null)} />
                <svg className="w-6 h-6 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                <span className="text-sm text-gray-500">{file ? file.name : 'Click to upload blog image'}</span>
              </label>
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Content</label>
              <textarea name="details" value={form.details} onChange={handleChange} rows={6} required
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all resize-none" placeholder="Write your story..."></textarea>
            </div>
            <button type="submit" disabled={isUploading} className="bg-teal-600 hover:bg-teal-700 text-white px-6 py-2.5 rounded-xl text-sm font-semibold transition-all shadow-sm hover:shadow-md disabled:bg-teal-400">
              {isUploading ? 'Uploading Image...' : editing ? 'Update Blog' : 'Create Blog'}
            </button>
          </form>
        </div>
      )}

      {loading ? (
        <div className="flex justify-center py-16"><div className="animate-spin rounded-full h-10 w-10 border-4 border-teal-600 border-t-transparent"></div></div>
      ) : (
        <div className="space-y-4">
          {blogs.length > 0 ? blogs.map((blog) => (
            <div key={blog._id} className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow overflow-hidden">
              {blog.blog_image && (
                <div className="h-48 overflow-hidden">
                  <img src={blog.blog_image} alt={blog.title} className="w-full h-full object-cover" />
                </div>
              )}
              <div className="p-6">
                <div className="flex justify-between items-start gap-4">
                  <div className="flex-1 min-w-0">
                    <h3 className="text-lg font-bold text-gray-900">{blog.title}</h3>
                    <p className="text-sm text-gray-500 mt-1">
                      {new Date(blog.createdAt).toLocaleDateString()}
                      <span className="mx-2 text-gray-300">|</span>
                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold ${blog.status === 'active' ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'}`}>
                        <span className={`w-1 h-1 rounded-full ${blog.status === 'active' ? 'bg-emerald-500' : 'bg-amber-500'}`}></span>
                        {blog.status}
                      </span>
                    </p>
                    <p className="text-gray-600 mt-3 line-clamp-2 text-sm leading-relaxed">{blog.details}</p>
                  </div>
                  <div className="flex gap-2 flex-shrink-0">
                    <button onClick={() => handleEdit(blog)} className="px-3 py-1.5 text-xs font-semibold text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors">Edit</button>
                    <button onClick={() => handleDelete(blog._id)} className="px-3 py-1.5 text-xs font-semibold text-red-600 bg-red-50 hover:bg-red-100 rounded-lg transition-colors">Delete</button>
                  </div>
                </div>
              </div>
            </div>
          )) : (
            <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center shadow-sm">
              <div className="flex flex-col items-center gap-3">
                <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center"><Icon name="blog" className="w-8 h-8 text-gray-300" /></div>
                <p className="text-gray-400 font-medium">No blogs found. Create one!</p>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default MyBlogs;
