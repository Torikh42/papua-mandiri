"use client";

import React, { useState, useEffect, useCallback, useTransition } from "react";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Search, Trash2, ChevronLeft, ChevronRight } from "lucide-react";
import {
  searchUsersAction,
  deleteUserAction,
} from "@/action/UserManagementAction";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";

type User = {
  id: string;
  user_name: string;
  user_email: string;
  role: string;
  location: string;
};

type SearchAttribute = "user_name" | "user_email" | "location";

const UserTable = ({
  title,
  users,
  onPageChange,
  currentPage,
  totalPages,
  onDelete,
  isPending,
}: {
  title: string;
  users: User[];
  onPageChange?: (page: number) => void;
  currentPage?: number;
  totalPages?: number;
  onDelete: (userId: string, userName: string) => void;
  isPending: boolean;
}) => (
  <div className="bg-white p-4 sm:p-6 rounded-lg shadow-sm border">
    <h2 className="text-xl font-semibold mb-4" style={{ color: "#4c7a6b" }}>
      {title}
    </h2>
    <div className="overflow-x-auto">
      <table className="w-full text-sm text-left">
        <thead className="text-xs text-gray-700 uppercase bg-gray-50">
          <tr>
            <th className="px-4 py-3">No</th>
            <th className="px-4 py-3">Nama Lengkap</th>
            <th className="px-4 py-3">Role</th>
            <th className="px-4 py-3">Lokasi</th>
            <th className="px-4 py-3">Email</th>
            <th className="px-4 py-3 text-center">Delete</th>
          </tr>
        </thead>
        <tbody>
          {users.length > 0 ? (
            users.map((user, index) => (
              <tr key={user.id} className="border-b hover:bg-gray-50">
                <td className="px-4 py-3">
                  {(currentPage ? (currentPage - 1) * 5 : 0) + index + 1}
                </td>
                <td className="px-4 py-3 font-medium text-gray-900">
                  {user.user_name || "-"}
                </td>
                <td className="px-4 py-3">
                  <Badge variant="secondary">{user.role || "user"}</Badge>
                </td>
                <td className="px-4 py-3">{user.location || "-"}</td>
                <td className="px-4 py-3">{user.user_email}</td>
                <td className="px-4 py-3 text-center">
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="ghost" size="icon" disabled={isPending}>
                        <Trash2 className="h-4 w-4 text-red-500" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Anda Yakin?</AlertDialogTitle>
                        <AlertDialogDescription>
                          Aksi ini tidak dapat dibatalkan. Ini akan menghapus
                          pengguna{" "}
                          <strong>{user.user_name || user.user_email}</strong> secara
                          permanen.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Batal</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={() =>
                            onDelete(user.id, user.user_name || user.user_email)
                          }
                        >
                          Hapus
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan={6} className="text-center py-8 text-gray-500">
                {title.includes("Hasil Pencarian")
                  ? "Hasil pencarian Anda akan muncul di sini."
                  : "Tidak ada pengguna untuk ditampilkan."}
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
    {onPageChange && totalPages && totalPages > 1 && (
      <div className="flex justify-end items-center mt-4 text-sm">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onPageChange(currentPage! - 1)}
          disabled={currentPage === 1}
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <span>
          Halaman {currentPage} dari {totalPages}
        </span>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onPageChange(currentPage! + 1)}
          disabled={currentPage === totalPages}
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
    )}
  </div>
);

const KelolaUserPage = () => {
  const [searchResults, setSearchResults] = useState<User[]>([]);
  const [latestUsers, setLatestUsers] = useState<User[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [searchAttribute, setSearchAttribute] = useState<SearchAttribute>("user_email");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [loading, setLoading] = useState({ search: false, latest: true });
  const [isPending, startTransition] = useTransition();

  const fetchLatestUsers = useCallback(async (page = 1) => {
    setLoading((prev) => ({ ...prev, latest: true }));
    const result = await searchUsersAction("", "user_email", page, 5);
    if ("success" in result && result.success && result.data) {
      setLatestUsers(result.data);
      setTotalPages(Math.ceil(result.total / 5));
      setCurrentPage(page);
    } else if ("errorMessage" in result) {
      toast.error(result.errorMessage);
    }
    setLoading((prev) => ({ ...prev, latest: false }));
  }, []);

  useEffect(() => {
    fetchLatestUsers(1);
  }, [fetchLatestUsers]);

  const handleSearchSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading((prev) => ({ ...prev, search: true }));
    const result = await searchUsersAction(searchTerm, searchAttribute, 1, 5);
    if ("success" in result && result.success && result.data) {
      setSearchResults(result.data);
    } else if ("errorMessage" in result) {
      toast.error(result.errorMessage);
    }
    setLoading((prev) => ({ ...prev, search: false }));
  };

  const handleDeleteUser = (userId: string, userName: string) => {
    startTransition(async () => {
      const result = await deleteUserAction(userId);
      if ("success" in result && result.success) {
        toast.success(`User ${userName} berhasil dihapus.`);
        fetchLatestUsers(currentPage);
        setSearchResults((prev) => prev.filter((user) => user.id !== userId));
      } else {
        toast.error("Gagal menghapus user.");
      }
    });
  };

  return (
    <div className="container mx-auto py-8 space-y-8">
      <h1
        className="text-3xl font-bold text-center"
        style={{ color: "#4c7a6b" }}
      >
        Kelola User
      </h1>

      <div className="bg-green-50/50 p-4 rounded-lg border border-green-200">
        <form
          onSubmit={handleSearchSubmit}
          className="flex flex-col sm:flex-row gap-2"
        >
          <div className="relative flex-grow">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
            <Input
              placeholder="Cari User..."
              className="pl-10"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <Select
            value={searchAttribute}
            onValueChange={(value: string) => setSearchAttribute(value as SearchAttribute)}
          >
            <SelectTrigger className="w-full sm:w-[180px]">
              <SelectValue placeholder="Pilih Atribut" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="user_email">Email</SelectItem>
              <SelectItem value="user_name">Nama Lengkap</SelectItem>
              <SelectItem value="location">Lokasi</SelectItem>
            </SelectContent>
          </Select>
          <Button type="submit" disabled={loading.search}>
            {loading.search ? "Mencari..." : "Cari"}
          </Button>
        </form>
      </div>

      <UserTable
        title="Hasil Pencarian Anda"
        users={searchResults}
        onDelete={handleDeleteUser}
        isPending={isPending}
      />

      <UserTable
        title="Pengguna Terbaru"
        users={latestUsers}
        onPageChange={fetchLatestUsers}
        currentPage={currentPage}
        totalPages={totalPages}
        onDelete={handleDeleteUser}
        isPending={isPending}
      />
    </div>
  );
};

export default KelolaUserPage;