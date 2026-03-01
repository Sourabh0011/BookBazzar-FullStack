import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { BookOpen, Star, ShoppingCart, ArrowLeftRight } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import BuyDialog from "./BuyDialog";

interface BookCardProps {
  _id: string;
  title: string;
  author: string;
  price: number | null;
  is_swap: boolean;
  condition: string;
  category: string;
  image_url: string | null;
  user?: {
    username: string;
    _id: string;
  };
}

const BookCard = ({ _id, title, author, price, is_swap, condition, category, image_url, user: seller }: BookCardProps) => {
  const [buyOpen, setBuyOpen] = useState(false);
  const { user } = useAuth();
  const navigate = useNavigate();

  const handleAction = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!user) {
      navigate("/auth");
      return;
    }

    setBuyOpen(true);
  };

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        whileHover={{ y: -5 }}
        transition={{ duration: 0.3 }}
        className="h-full"
      >
        <Card className="group flex h-full flex-col overflow-hidden border bg-card shadow-sm transition-all duration-300 hover:shadow-md">
          <div className="relative aspect-[3/4] overflow-hidden bg-muted">
            {image_url ? (
              <img
                src={image_url}
                alt={title}
                className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                loading="lazy"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center bg-accent/50">
                <BookOpen className="h-10 w-10 text-primary/30" />
              </div>
            )}
            
            <div className="absolute top-2 left-2 flex flex-col gap-1">
              {is_swap && (
                <Badge className="bg-blue-600 hover:bg-blue-700 text-white border-none px-2 py-0">
                  Swap
                </Badge>
              )}
              <Badge variant="secondary" className="bg-card/80 backdrop-blur-md text-[10px] uppercase tracking-wider font-bold">
                {condition}
              </Badge>
            </div>
          </div>

          <CardContent className="flex flex-1 flex-col p-3">
            <div className="flex-1">
              <p className="text-[10px] font-medium uppercase text-primary/80">{category}</p>
              <h3 className="mt-0.5 font-display text-sm font-bold leading-tight text-foreground line-clamp-2 group-hover:text-primary transition-colors">
                {title}
              </h3>
              <p className="text-xs text-muted-foreground line-clamp-1">by {author}</p>
              {seller && <p className="text-[10px] text-muted-foreground mt-1">Seller: {seller.username}</p>}
            </div>

            <div className="mt-3 flex items-center justify-between border-t pt-2">
              <div className="flex flex-col">
                <span className="text-xs text-muted-foreground font-medium">Price</span>
                <span className="text-sm font-bold text-foreground">
                  {is_swap ? "Trade Only" : `₹${price}`}
                </span>
              </div>
              <div className="flex items-center gap-0.5 rounded-full bg-amber-50 px-2 py-0.5 text-[10px] font-bold text-amber-700">
                <Star className="h-2.5 w-2.5 fill-amber-500 text-amber-500" />
                5.0
              </div>
            </div>

            <Button
              onClick={handleAction}
              className={`mt-3 w-full rounded-xl text-xs h-9 font-bold shadow-sm transition-all active:scale-95 ${
                is_swap 
                ? "bg-blue-600 hover:bg-blue-700 text-white" 
                : "bg-primary hover:bg-primary/90"
              }`}
              size="sm"
            >
              {is_swap ? (
                <>
                  <ArrowLeftRight className="mr-1.5 h-3.5 w-3.5" />
                  Request Swap
                </>
              ) : (
                <>
                  <ShoppingCart className="mr-1.5 h-3.5 w-3.5" />
                  Buy Now
                </>
              )}
            </Button>
          </CardContent>
        </Card>
      </motion.div>

      {seller && (
        <BuyDialog
          open={buyOpen}
          onOpenChange={setBuyOpen}
          book={{ id: _id, title, author, price, sellerId: seller._id }}
        />
      )}
    </>
  );
};

export default BookCard;
