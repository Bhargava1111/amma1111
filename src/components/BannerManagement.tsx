import React, { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';

interface Banner {
  id: number;
  title: string;
  subtitle: string;
  description: string;
  image: string;
  cta: string;
  link: string;
}

const defaultBanner: Omit<Banner, 'id'> = {
  title: '',
  subtitle: '',
  description: '',
  image: '',
  cta: '',
  link: ''
};

const BannerManagement: React.FC = () => {
  const { toast } = useToast();
  const [banners, setBanners] = useState<Banner[]>([]);
  const [loading, setLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [editIndex, setEditIndex] = useState<number | null>(null);
  const [form, setForm] = useState<Omit<Banner, 'id'>>(defaultBanner);

  // Fetch banners
  const fetchBanners = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/banners');
      const json = await res.json();
      if (json.success) setBanners(json.data);
      else toast({ title: 'Error', description: json.error || 'Failed to fetch banners', variant: 'destructive' });
    } catch (e) {
      toast({ title: 'Error', description: 'Failed to fetch banners', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchBanners(); }, []);

  // Open modal for add/edit
  const openModal = (index: number | null = null) => {
    setEditIndex(index);
    setForm(index !== null ? { ...banners[index] } : defaultBanner);
    setModalOpen(true);
  };

  // Handle form change
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // Save banner (add or edit)
  const handleSave = async () => {
    let newBanners = [...banners];
    if (editIndex !== null) {
      newBanners[editIndex] = { ...form, id: banners[editIndex].id };
    } else {
      const maxId = banners.reduce((max, b) => Math.max(max, b.id), 0);
      newBanners.push({ ...form, id: maxId + 1 });
    }
    setLoading(true);
    try {
      const res = await fetch('/api/banners', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newBanners)
      });
      const json = await res.json();
      if (json.success) {
        setBanners(json.data);
        setModalOpen(false);
        toast({ title: 'Success', description: 'Banners updated' });
      } else {
        toast({ title: 'Error', description: json.error || 'Failed to update banners', variant: 'destructive' });
      }
    } catch (e) {
      toast({ title: 'Error', description: 'Failed to update banners', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  // Delete banner
  const handleDelete = async (index: number) => {
    const newBanners = banners.filter((_, i) => i !== index);
    setLoading(true);
    try {
      const res = await fetch('/api/banners', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newBanners)
      });
      const json = await res.json();
      if (json.success) {
        setBanners(json.data);
        toast({ title: 'Success', description: 'Banner deleted' });
      } else {
        toast({ title: 'Error', description: json.error || 'Failed to delete banner', variant: 'destructive' });
      }
    } catch (e) {
      toast({ title: 'Error', description: 'Failed to delete banner', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold">Homepage Banners</h3>
        <Button onClick={() => openModal(null)}>Add Banner</Button>
      </div>
      {loading && <div className="text-blue-600 mb-2">Loading...</div>}
      <div className="overflow-x-auto">
        <table className="min-w-full border text-sm">
          <thead>
            <tr className="bg-gray-100">
              <th className="p-2 border">Image</th>
              <th className="p-2 border">Title</th>
              <th className="p-2 border">Subtitle</th>
              <th className="p-2 border">Description</th>
              <th className="p-2 border">CTA</th>
              <th className="p-2 border">Link</th>
              <th className="p-2 border">Actions</th>
            </tr>
          </thead>
          <tbody>
            {banners.map((banner, i) => (
              <tr key={banner.id} className="border-b">
                <td className="p-2 border"><img src={banner.image} alt="banner" className="w-24 h-16 object-cover rounded" /></td>
                <td className="p-2 border">{banner.title}</td>
                <td className="p-2 border">{banner.subtitle}</td>
                <td className="p-2 border">{banner.description}</td>
                <td className="p-2 border">{banner.cta}</td>
                <td className="p-2 border">{banner.link}</td>
                <td className="p-2 border">
                  <Button size="sm" variant="outline" onClick={() => openModal(i)} className="mr-2">Edit</Button>
                  <Button size="sm" variant="destructive" onClick={() => handleDelete(i)}>Delete</Button>
                </td>
              </tr>
            ))}
            {banners.length === 0 && (
              <tr><td colSpan={7} className="text-center p-4">No banners found.</td></tr>
            )}
          </tbody>
        </table>
      </div>
      {/* Add/Edit Modal */}
      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent className="max-w-lg w-full">
          <DialogHeader>
            <DialogTitle>{editIndex !== null ? 'Edit Banner' : 'Add Banner'}</DialogTitle>
            <DialogDescription>
              {editIndex !== null ? 'Update the banner information below.' : 'Create a new banner for your homepage.'}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            <Input name="title" value={form.title} onChange={handleChange} placeholder="Title" />
            <Input name="subtitle" value={form.subtitle} onChange={handleChange} placeholder="Subtitle" />
            <Input name="description" value={form.description} onChange={handleChange} placeholder="Description" />
            <Input name="image" value={form.image} onChange={handleChange} placeholder="Image URL" />
            <Input name="cta" value={form.cta} onChange={handleChange} placeholder="CTA Button Text" />
            <Input name="link" value={form.link} onChange={handleChange} placeholder="Link URL" />
          </div>
          <DialogFooter className="mt-4 flex flex-col sm:flex-row gap-2">
            <Button type="button" variant="outline" onClick={() => setModalOpen(false)} className="w-full sm:w-auto">Cancel</Button>
            <Button type="button" onClick={handleSave} className="w-full sm:w-auto">Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default BannerManagement; 
