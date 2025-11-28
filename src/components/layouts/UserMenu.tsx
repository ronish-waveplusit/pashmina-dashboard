import  { useState } from "react";
import { useAuth } from "../context/AuthContext";

import { useNavigate } from "react-router-dom";
import { Settings, LogOut} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../../components/ui/dropdown-menu";
import { Avatar } from "../../components/ui/avatar";
import { useSelector } from "react-redux";
import { RootState } from "../store/store";
const UserMenu = () => {
  const { user } = useSelector((state: RootState) => state.auth);
  const { logout } = useAuth();
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

 
 const handleLogout = (e: React.MouseEvent<HTMLDivElement>) => {
    e.preventDefault();
    logout();
    navigate("/");
  }
  return (
    <DropdownMenu open={isMenuOpen} onOpenChange={setIsMenuOpen}>
      <DropdownMenuTrigger asChild>
        <button
          aria-label="User menu"
          className={`relative rounded-full focus:outline-none transition-all duration-200 ${
            isMenuOpen ? "ring-2 ring-offset-2 ring-coffee" : "hover:opacity-80"
          }`}
        >
          <Avatar
            className={`h-8 w-8 ${isMenuOpen ? "ring-2 ring-coffee" : ""}`}
          >
            <img
              src={
                "https://ui-avatars.com/api/?name=User&background=A67C52&color=fff"
              }
              alt="User avatar"
              className="rounded-full h-8 w-8 object-cover"
            />
          </Avatar>
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56" align="end">
        <DropdownMenuLabel>
          <div className="flex flex-col">
            <span>{user?.name}</span>
            <span className="text-xs text-muted-foreground capitalize truncate">
              {user?.groups
                ?.map((group) => group.replace(/_/g, " "))
                .join(", ")}
            </span>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onClick={() => navigate("/settings")}
          className="cursor-pointer"
        >
          <Settings className="mr-2 h-4 w-4" />
          <span>Settings</span>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={handleLogout} className="cursor-pointer">
          <LogOut className="mr-2 h-4 w-4" />
          <span>Logout</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default UserMenu;
