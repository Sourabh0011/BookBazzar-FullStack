import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { MapPin, CreditCard, Banknote, Loader2 } from "lucide-react";

interface BuyDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  book: {
    id: string;
    title: string;
    author: string;
    price: number | null;
    sellerId: string;
  };
}

const BuyDialog = ({ open, onOpenChange, book }: BuyDialogProps) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [submitting, setSubmitting] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState("cash");
  const [form, setForm] = useState({
    address_line: "",
    city: "",
    state: "",
    pincode: "",
    phone: "",
  });

  const handleChange = (field: string, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async () => {
    if (!user) {
      navigate("/auth");
      return;
    }

    if (!form.address_line || !form.city || !form.state || !form.pincode || !form.phone) {
      toast({ title: "Missing fields", description: "Please fill all address fields.", variant: "destructive" });
      return;
    }

    setSubmitting(true);

    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${import.meta.env.VITE_API_URL}/transactions`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          bookId: book.id,
          sellerId: book.sellerId,
          type: "purchase", // or "swap" based on context
          paymentMethod,
          address_line: form.address_line,
          city: form.city,
          state: form.state,
          pincode: form.pincode,
          phone: form.phone,
        }),
      });

      if (!res.ok) throw new Error("Failed to place order");

      toast({ title: "Order Placed! ✅", description: "The seller has been notified. You'll hear back soon." });
      onOpenChange(false);
      setForm({ address_line: "", city: "", state: "", pincode: "", phone: "" });
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md rounded-2xl">
        <DialogHeader>
          <DialogTitle className="font-display text-xl">Buy "{book.title}"</DialogTitle>
          <p className="text-sm text-muted-foreground">by {book.author} · ₹{book.price}</p>
        </DialogHeader>

        <div className="space-y-4 mt-2">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <MapPin className="h-4 w-4 text-primary" />
              <span className="font-semibold text-sm text-foreground">Delivery Address</span>
            </div>
            <div className="space-y-3">
              <div>
                <Label className="text-xs text-muted-foreground">Address Line</Label>
                <Input
                  placeholder="Hostel name, Room no..."
                  value={form.address_line}
                  onChange={(e) => handleChange("address_line", e.target.value)}
                  className="rounded-xl"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label className="text-xs text-muted-foreground">City</Label>
                  <Input
                    placeholder="City"
                    value={form.city}
                    onChange={(e) => handleChange("city", e.target.value)}
                    className="rounded-xl"
                  />
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">State</Label>
                  <Input
                    placeholder="State"
                    value={form.state}
                    onChange={(e) => handleChange("state", e.target.value)}
                    className="rounded-xl"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label className="text-xs text-muted-foreground">Pincode</Label>
                  <Input
                    placeholder="Pincode"
                    value={form.pincode}
                    onChange={(e) => handleChange("pincode", e.target.value)}
                    className="rounded-xl"
                  />
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">Phone</Label>
                  <Input
                    placeholder="Phone number"
                    value={form.phone}
                    onChange={(e) => handleChange("phone", e.target.value)}
                    className="rounded-xl"
                  />
                </div>
              </div>
            </div>
          </div>

          <div>
            <div className="flex items-center gap-2 mb-3">
              <CreditCard className="h-4 w-4 text-primary" />
              <span className="font-semibold text-sm text-foreground">Payment Method</span>
            </div>
            <RadioGroup value={paymentMethod} onValueChange={setPaymentMethod} className="grid grid-cols-2 gap-3">
              <label
                className={`flex items-center gap-3 rounded-xl border p-3 cursor-pointer transition-all ${
                  paymentMethod === "cash" ? "border-primary bg-accent" : "border-border"
                }`}
              >
                <RadioGroupItem value="cash" />
                <Banknote className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium">Cash</span>
              </label>
              <label
                className={`flex items-center gap-3 rounded-xl border p-3 cursor-pointer transition-all ${
                  paymentMethod === "online" ? "border-primary bg-accent" : "border-border"
                }`}
              >
                <RadioGroupItem value="online" />
                <CreditCard className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium">Online</span>
              </label>
            </RadioGroup>
          </div>

          <Button
            onClick={handleSubmit}
            disabled={submitting}
            className="w-full rounded-full bg-primary text-primary-foreground font-semibold"
          >
            {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : "Place Order"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default BuyDialog;
