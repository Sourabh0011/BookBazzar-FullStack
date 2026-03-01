import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, ArrowRight, Upload, Check } from "lucide-react";

const BRANCHES = ["Engineering", "Arts", "Science", "Commerce", "Competitive Exams", "Literature", "Other"];
const SEMESTERS = ["1st", "2nd", "3rd", "4th", "5th", "6th", "7th", "8th"];
const CONDITIONS = ["New", "Like New", "Good", "Fair", "Poor"];

const AddListing = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  const [form, setForm] = useState({
    title: "",
    author: "",
    price: "",
    isSwap: false,
    condition: "Good",
    category: "Other",
    description: "",
    semester: "",
  });

  const updateForm = (field: string, value: any) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async () => {
    if (!user) return;
    setLoading(true);

    try {
      const formData = new FormData();
      formData.append("title", form.title);
      formData.append("author", form.author);
      formData.append("price", form.isSwap ? "0" : form.price);
      formData.append("is_swap", String(form.isSwap));
      formData.append("condition", form.condition);
      formData.append("category", form.category);
      formData.append("description", form.description);
      if (imageFile) {
        formData.append("image", imageFile);
      }

      const token = localStorage.getItem("token");
      const res = await fetch(`${import.meta.env.VITE_API_URL}/books`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          // Note: Don't set Content-Type header when using FormData
        },
        body: formData,
      });

      if (!res.ok) throw new Error("Failed to list book");

      toast({ title: "Listed!", description: "Your book is now on the marketplace." });
      navigate("/marketplace");
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    navigate("/auth");
    return null;
  }

  const totalSteps = 3;

  return (
    <div className="container mx-auto max-w-xl px-4 py-8">
      <div className="mb-8 text-center">
        <h1 className="font-display text-3xl font-bold text-foreground">Sell Your Book</h1>
        <p className="mt-1 text-muted-foreground">Fill in the details to reach buyers on campus.</p>
      </div>

      <div className="rounded-2xl border bg-card p-6 shadow-card">
        <div className="mb-6">
          <div className="flex items-center justify-between text-xs text-muted-foreground mb-2">
            <span className="font-medium text-primary">STEP {step} OF {totalSteps}</span>
            <span className="font-medium text-primary">
              {step === 1 ? "Details" : step === 2 ? "Pricing" : "Photo"}
            </span>
          </div>
          <div className="flex gap-1">
            {Array.from({ length: totalSteps }).map((_, i) => (
              <div
                key={i}
                className={`h-1.5 flex-1 rounded-full transition-colors ${
                  i < step ? "bg-primary" : "bg-muted"
                }`}
              />
            ))}
          </div>
        </div>

        {step === 1 && (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label className="font-medium">Book Title</Label>
              <Input
                placeholder="e.g. Theory of Computation"
                value={form.title}
                onChange={(e) => updateForm("title", e.target.value)}
                className="rounded-xl"
                required
              />
            </div>
            <div className="space-y-2">
              <Label className="font-medium">Author</Label>
              <Input
                placeholder="e.g. Peter Linz"
                value={form.author}
                onChange={(e) => updateForm("author", e.target.value)}
                className="rounded-xl"
                required
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="font-medium">Branch</Label>
                <Select value={form.category} onValueChange={(v) => updateForm("category", v)}>
                  <SelectTrigger className="rounded-xl"><SelectValue placeholder="Select Branch" /></SelectTrigger>
                  <SelectContent>
                    {BRANCHES.map((b) => <SelectItem key={b} value={b}>{b}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label className="font-medium">Semester</Label>
                <Select value={form.semester} onValueChange={(v) => updateForm("semester", v)}>
                  <SelectTrigger className="rounded-xl"><SelectValue placeholder="Select Sem" /></SelectTrigger>
                  <SelectContent>
                    {SEMESTERS.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <Button
              className="w-full rounded-xl bg-primary py-6 text-base font-semibold hover:bg-primary/90"
              onClick={() => setStep(2)}
              disabled={!form.title || !form.author}
            >
              Continue <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-4">
            <div className="flex items-center justify-between rounded-xl border p-4">
              <div>
                <Label className="font-medium">Swap only?</Label>
                <p className="text-sm text-muted-foreground">Toggle if you want to swap instead of sell</p>
              </div>
              <Switch checked={form.isSwap} onCheckedChange={(v) => updateForm("isSwap", v)} />
            </div>
            {!form.isSwap && (
              <div className="space-y-2">
                <Label className="font-medium">Price (₹)</Label>
                <Input type="number" placeholder="e.g. 250" value={form.price} onChange={(e) => updateForm("price", e.target.value)} className="rounded-xl" min="0" required />
              </div>
            )}
            <div className="space-y-2">
              <Label className="font-medium">Condition</Label>
              <Select value={form.condition} onValueChange={(v) => updateForm("condition", v)}>
                <SelectTrigger className="rounded-xl"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {CONDITIONS.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label className="font-medium">Description (optional)</Label>
              <Textarea placeholder="Tell buyers about your book..." value={form.description} onChange={(e) => updateForm("description", e.target.value)} className="rounded-xl" />
            </div>
            <div className="flex gap-2">
              <Button variant="outline" className="flex-1 rounded-xl" onClick={() => setStep(1)}>
                <ArrowLeft className="h-4 w-4" /> Back
              </Button>
              <Button className="flex-1 rounded-xl bg-primary hover:bg-primary/90" onClick={() => setStep(3)} disabled={!form.isSwap && !form.price}>
                Continue <ArrowRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label className="font-medium">Book Photo</Label>
              <label className="flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-muted-foreground/25 p-8 transition-all hover:border-primary/50 hover:bg-accent/50">
                {imagePreview ? (
                  <img src={imagePreview} alt="Preview" className="max-h-48 rounded-lg object-contain" />
                ) : (
                  <>
                    <Upload className="mb-2 h-8 w-8 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground font-medium">Click to upload book cover</span>
                    <span className="text-[10px] text-muted-foreground mt-1">JPG, PNG, WEBP supported</span>
                  </>
                )}
                <input type="file" accept="image/*" className="hidden" onChange={handleImageChange} />
              </label>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" className="flex-1 rounded-xl" onClick={() => setStep(2)}>
                <ArrowLeft className="h-4 w-4" /> Back
              </Button>
              <Button className="flex-1 rounded-xl bg-primary hover:bg-primary/90" onClick={handleSubmit} disabled={loading}>
                {loading ? "Listing..." : <><Check className="h-4 w-4" /> Publish Listing</>}
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AddListing;
