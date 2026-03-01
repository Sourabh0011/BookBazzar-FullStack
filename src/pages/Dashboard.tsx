import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Plus, Trash2, Pencil, CheckCircle, Package, TrendingUp, Bell, Clock, MapPin, CreditCard, Banknote } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { formatDistanceToNow } from "date-fns";

interface Book { _id: string; title: string; author: string; price: number | null; is_swap: boolean; condition: string; category: string; image_url: string | null; created_at: string; }
interface Transaction { _id: string; type: string; status: string; created_at: string; payment_method: string | null; address_line: string | null; city: string | null; state: string | null; pincode: string | null; phone: string | null; buyer: { _id: string; username: string }; seller: { _id: string; username: string }; book: { title: string; author: string; price: number | null }; }
interface Notification { _id: string; title: string; message: string; is_read: boolean; created_at: string; }

const Dashboard = () => {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [myBooks, setMyBooks] = useState<Book[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/auth");
      return;
    }
    if (user) fetchData();
  }, [user, authLoading]);

  const fetchData = async () => {
    const token = localStorage.getItem("token");
    try {
      const [booksRes, txRes, notifRes] = await Promise.all([
        fetch(`${import.meta.env.VITE_API_URL}/books/my`, { headers: { Authorization: `Bearer ${token}` } }),
        fetch(`${import.meta.env.VITE_API_URL}/transactions`, { headers: { Authorization: `Bearer ${token}` } }),
        fetch(`${import.meta.env.VITE_API_URL}/notifications`, { headers: { Authorization: `Bearer ${token}` } }),
      ]);

      if (booksRes.ok) setMyBooks(await booksRes.json());
      if (txRes.ok) setTransactions(await txRes.json());
      if (notifRes.ok) setNotifications(await notifRes.json());
    } catch (err) {
      console.error("Dashboard fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  const deleteBook = async (bookId: string) => {
    const token = localStorage.getItem("token");
    const res = await fetch(`${import.meta.env.VITE_API_URL}/books/${bookId}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    });
    if (res.ok) {
      setMyBooks((prev) => prev.filter((b) => b._id !== bookId));
      toast({ title: "Deleted", description: "Your listing has been removed." });
    }
  };

  const updateOrderStatus = async (txId: string, status: string) => {
    const token = localStorage.getItem("token");
    const res = await fetch(`${import.meta.env.VITE_API_URL}/transactions/${txId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify({ status }),
    });
    if (res.ok) {
      setTransactions((prev) => prev.map((t) => (t._id === txId ? { ...t, status } : t)));
      toast({ title: "Updated", description: `Order marked as ${status}.` });
    }
  };

  const markNotifRead = async (id: string) => {
    const token = localStorage.getItem("token");
    await fetch(`${import.meta.env.VITE_API_URL}/notifications/${id}`, {
      method: "PUT",
      headers: { Authorization: `Bearer ${token}` },
    });
    setNotifications((prev) => prev.map((n) => (n._id === id ? { ...n, is_read: true } : n)));
  };

  if (authLoading || loading) {
    return <div className="container mx-auto px-4 py-16 text-center"><p className="text-muted-foreground">Loading Dashboard...</p></div>;
  }

  // Safety check for user object
  if (!user) return null;

  const currentUserId = (user as any)._id;
  const totalEarned = myBooks.reduce((sum, b) => sum + (b.price ?? 0), 0);
  const incomingOrders = transactions.filter((t) => t.seller?._id === currentUserId);
  const myPurchases = transactions.filter((t) => t.buyer?._id === currentUserId);
  const unreadCount = notifications.filter((n) => !n.is_read).length;

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8 text-center md:text-left">
        <h1 className="font-display text-2xl md:text-3xl font-bold text-foreground">User Dashboard</h1>
        <p className="mt-1 text-muted-foreground">Manage your books and track your earnings.</p>
      </div>

      <div className="mb-8 grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { label: "Active Ads", val: myBooks.length, icon: <Package className="h-5 w-5 text-primary" />, bg: "bg-accent" },
          { label: "Total Earned", val: `₹${totalEarned.toLocaleString()}`, icon: <TrendingUp className="h-5 w-5 text-green-600" />, bg: "bg-green-50" },
          { label: "Orders", val: incomingOrders.length, icon: <Package className="h-5 w-5 text-amber-600" />, bg: "bg-amber-50" },
          { label: "Notifications", val: unreadCount, icon: <Bell className="h-5 w-5 text-purple-600" />, bg: "bg-purple-50" }
        ].map((stat, i) => (
          <div key={i} className="flex items-center gap-4 rounded-2xl border bg-card p-5 shadow-sm">
            <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl ${stat.bg}`}>{stat.icon}</div>
            <div>
              <p className="text-sm text-muted-foreground">{stat.label}</p>
              <p className="text-xl md:text-2xl font-bold text-foreground">{stat.val}</p>
            </div>
          </div>
        ))}
      </div>

      <Tabs defaultValue="listings" className="w-full">
        <TabsList className="flex w-full justify-start gap-6 bg-transparent border-b rounded-none px-0 mb-6 overflow-x-auto no-scrollbar">
          <TabsTrigger value="listings" className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent">My Listings</TabsTrigger>
          <TabsTrigger value="orders" className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent">Incoming Orders</TabsTrigger>
          <TabsTrigger value="purchases" className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent">My Purchases</TabsTrigger>
          <TabsTrigger value="notifications" className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent">Notifications</TabsTrigger>
        </TabsList>

        <TabsContent value="listings">
          {myBooks.length === 0 ? (
            <div className="rounded-2xl border bg-card p-12 text-center">
              <p className="text-muted-foreground">No listings yet.</p>
              <Link to="/add-listing"><Button className="mt-4 rounded-full">Add Your First Book</Button></Link>
            </div>
          ) : (
            <div className="rounded-2xl border bg-card overflow-hidden">
              {myBooks.map((book) => (
                <div key={book._id} className="flex items-center justify-between border-b last:border-0 px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent"><Package className="h-4 w-4 text-primary" /></div>
                    <div className="min-w-0"><p className="font-medium truncate">{book.title}</p><p className="text-xs text-muted-foreground">{formatDistanceToNow(new Date(book.created_at))} ago</p></div>
                  </div>
                  <div className="flex items-center gap-4">
                    <p className="font-bold">{book.is_swap ? "Swap" : `₹${book.price}`}</p>
                    <Button variant="ghost" size="icon" onClick={() => deleteBook(book._id)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="orders">
          {incomingOrders.length === 0 ? (
            <div className="rounded-2xl border bg-card p-12 text-center text-muted-foreground">No orders yet.</div>
          ) : (
            <div className="space-y-4">
              {incomingOrders.map((order) => (
                <div key={order._id} className="rounded-2xl border bg-card p-5 shadow-sm space-y-3">
                  <div className="flex items-start justify-between">
                    <div><p className="font-semibold">{order.book?.title || "Unknown Book"}</p><p className="text-sm text-muted-foreground">Buyer: {order.buyer?.username || "Unknown"}</p></div>
                    <Badge className="rounded-full">{order.status}</Badge>
                  </div>
                  <div className="text-sm text-muted-foreground bg-accent/50 p-3 rounded-xl">
                    <p>{order.address_line}, {order.city}, {order.state}</p>
                    <p className="font-medium text-foreground">📞 {order.phone}</p>
                  </div>
                  <div className="flex gap-2">
                    {order.status === "pending" && (
                      <Button size="sm" className="rounded-full" onClick={() => updateOrderStatus(order._id, "confirmed")}>Accept</Button>
                    )}
                    {order.status === "confirmed" && (
                      <Button size="sm" className="rounded-full bg-green-600" onClick={() => updateOrderStatus(order._id, "completed")}>Mark Delivered</Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="purchases">
          {myPurchases.length === 0 ? (
            <div className="rounded-2xl border bg-card p-12 text-center text-muted-foreground">No purchases yet.</div>
          ) : (
            <div className="space-y-3">
              {myPurchases.map((tx) => (
                <div key={tx._id} className="flex items-center justify-between rounded-2xl border bg-card p-4 shadow-sm">
                  <div><p className="font-medium">{tx.book?.title || "Unknown Book"}</p><p className="text-xs text-muted-foreground">Status: {tx.status}</p></div>
                  <Badge className="rounded-full">{tx.status}</Badge>
                </div>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="notifications">
          {notifications.length === 0 ? (
            <div className="rounded-2xl border bg-card p-12 text-center text-muted-foreground">No notifications.</div>
          ) : (
            <div className="space-y-3">
              {notifications.map((n) => (
                <div key={n._id} onClick={() => !n.is_read && markNotifRead(n._id)} className={`rounded-2xl border p-4 cursor-pointer transition-all ${n.is_read ? "" : "bg-accent/50 border-primary/20 shadow-sm"}`}>
                  <p className="font-semibold text-sm">{n.title}</p>
                  <p className="text-sm text-muted-foreground">{n.message}</p>
                </div>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Dashboard;
