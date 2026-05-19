"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { X } from "lucide-react";
import { Avatar } from "@/components/base/avatar/avatar";

interface Category {
  id: number;
  name: string;
  icon: string;
}

interface SubCategory {
  id: number;
  name: string;
  categoryId: number;
}

const subCategories: SubCategory[] = [
  { id: 1, name: "React", categoryId: 1 },
  { id: 2, name: "Python", categoryId: 1 },
  { id: 3, name: "JavaScript", categoryId: 1 },
  { id: 4, name: "Communication", categoryId: 2 },
  { id: 5, name: "Leadership", categoryId: 2 },
  { id: 6, name: "Teamwork", categoryId: 2 },
  { id: 7, name: "Spanish", categoryId: 3 },
  { id: 8, name: "French", categoryId: 3 },
  { id: 9, name: "Mandarin", categoryId: 3 },
  { id: 10, name: "UI/UX", categoryId: 4 },
  { id: 11, name: "Graphic Design", categoryId: 4 },
  { id: 12, name: "Web Design", categoryId: 4 },
  { id: 13, name: "Marketing", categoryId: 5 },
  { id: 14, name: "Sales", categoryId: 5 },
  { id: 15, name: "Finance", categoryId: 5 },
  { id: 16, name: "Guitar", categoryId: 6 },
  { id: 17, name: "Piano", categoryId: 6 },
  { id: 18, name: "Vocals", categoryId: 6 },
];

// Mock users for the modal
const mockUsers = [
  { id: "1", name: "John Doe", avatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?q=80&w=200", profession: "Software Engineer", matchScore: 95 },
  { id: "2", name: "Jane Smith", avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=200", profession: "Data Scientist", matchScore: 88 },
  { id: "3", name: "Mike Johnson", avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=200", profession: "UX Designer", matchScore: 82 },
  { id: "4", name: "Sarah Williams", avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?q=80&w=200", profession: "Marketing Manager", matchScore: 79 },
  { id: "5", name: "David Brown", avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=200", profession: "Full Stack Dev", matchScore: 75 },
  { id: "6", name: "Emily Davis", avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=200", profession: "Product Manager", matchScore: 71 },
];

interface CategoryModalProps {
  category: Category;
  onClose: () => void;
}

export function CategoryModal({ category, onClose }: CategoryModalProps) {
  const [selectedSubCategory, setSelectedSubCategory] = useState<number | null>(null);
  const filteredSubCategories = subCategories.filter((sub) => sub.categoryId === category.id);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center"
      onClick={onClose}
    >
      {/* Blur Veil */}
      <div
        className="absolute inset-0 backdrop-blur-md"
        style={{ backgroundColor: "rgba(0, 0, 0, 0.7)" }}
      />

      {/* Modal */}
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.8, opacity: 0 }}
        transition={{ type: "spring", damping: 25 }}
        className="relative w-[70vw] h-[80vh] rounded-2xl border-2 overflow-hidden"
        style={{
          backgroundColor: "var(--glass-bg)",
          borderColor: "var(--glass-border)",
          backdropFilter: "blur(20px)",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-6 right-6 z-10 p-2 rounded-full transition-all hover:scale-110"
          style={{
            backgroundColor: "var(--card)",
            color: "var(--text-primary)",
          }}
        >
          <X className="w-6 h-6" />
        </button>

        <div className="flex h-full">
          {/* Left Sidebar - Categories/Subcategories */}
          <motion.div
            animate={{ width: selectedSubCategory ? "30%" : "100%" }}
            transition={{ type: "spring", damping: 25 }}
            className="flex flex-col p-8 border-r-2"
            style={{ borderColor: "var(--glass-border)" }}
          >
            <h2
              className="text-[32px] mb-8 flex items-center gap-3"
              style={{ color: "var(--text-primary)", fontWeight: 700 }}
            >
              <span className="text-4xl">{category.icon}</span>
              {category.name}
            </h2>

            <div className="flex-1 overflow-y-auto space-y-3">
              {filteredSubCategories.map((subCat) => (
                <motion.button
                  key={subCat.id}
                  whileHover={{ x: 5 }}
                  onClick={() => setSelectedSubCategory(subCat.id)}
                  className="w-full text-left p-4 rounded-xl border-2 transition-all"
                  style={{
                    backgroundColor:
                      selectedSubCategory === subCat.id
                        ? "var(--primary)"
                        : "var(--card)",
                    borderColor:
                      selectedSubCategory === subCat.id
                        ? "var(--primary-dark)"
                        : "var(--border)",
                    color:
                      selectedSubCategory === subCat.id
                        ? "var(--background)"
                        : "var(--text-primary)",
                  }}
                >
                  <span className="text-[16px] font-medium">{subCat.name}</span>
                </motion.button>
              ))}
            </div>
          </motion.div>

          {/* Right Content - Users */}
          <AnimatePresence>
            {selectedSubCategory && (
              <motion.div
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 50 }}
                className="flex-1 p-8 overflow-y-auto"
              >
                <h3
                  className="text-[24px] mb-6"
                  style={{ color: "var(--text-primary)", fontWeight: 600 }}
                >
                  Users teaching{" "}
                  {subCategories.find((s) => s.id === selectedSubCategory)?.name}
                </h3>

                <div className="grid grid-cols-2 gap-4">
                  {mockUsers.slice(0, 6).map((user) => (
                    <motion.div
                      key={user.id}
                      whileHover={{ y: -5 }}
                      className="p-4 rounded-xl border-2 cursor-pointer transition-all"
                      style={{
                        backgroundColor: "var(--card)",
                        borderColor: "var(--border)",
                        boxShadow: "var(--neon-glow)",
                      }}
                    >
                      <div className="flex items-center gap-3 mb-3">
                        <Avatar
                          src={user.avatar}
                          alt={user.name}
                          size="md"
                          initials={user.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                        />
                        <div>
                          <p
                            className="text-[14px] font-bold"
                            style={{ color: "var(--text-primary)" }}
                          >
                            {user.name}
                          </p>
                          <p
                            className="text-[12px]"
                            style={{ color: "var(--text-secondary)" }}
                          >
                            {user.profession}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center justify-between">
                        <span
                          className="text-[12px] px-3 py-1 rounded-full"
                          style={{
                            backgroundColor: "var(--primary)",
                            color: "var(--background)",
                          }}
                        >
                          {user.matchScore}% Match
                        </span>
                        <button
                          className="text-[12px] px-4 py-1 rounded-full border-2 hover:bg-[var(--primary)] hover:text-[var(--background)] transition-all"
                          style={{
                            borderColor: "var(--primary)",
                            color: "var(--primary)",
                          }}
                        >
                          View Profile
                        </button>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </motion.div>
  );
}

export default CategoryModal;
