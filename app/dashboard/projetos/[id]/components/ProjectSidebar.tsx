"use client"

import { Card, CardContent } from "@/components/ui/card"
import { ChevronRight } from "lucide-react"
import { sidebarItems } from "../utils/sidebarItems"

interface ProjectSidebarProps {
  activeSection: string
  setActiveSection: (section: string) => void
}

export function ProjectSidebar({ activeSection, setActiveSection }: ProjectSidebarProps) {
  return (
    <div className="hidden md:block w-64 shrink-0">
      <Card className="border border-[#e5e7eb] shadow-sm sticky top-6 bg-white">
        <CardContent className="p-4">
          <nav className="space-y-1">
            {sidebarItems.map((item) => (
              <button
                key={item.id}
                onClick={() => setActiveSection(item.id)}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-md text-sm transition-colors duration-300 ${
                  activeSection === item.id
                    ? "bg-[#70645C]/10 text-[#70645C] font-medium"
                    : "text-gray-500 hover:bg-[#70645C]/5 hover:text-[#70645C]"
                }`}
              >
                <div className="flex items-center">
                  <span className="mr-3">{item.icon}</span>
                  <span>{item.label}</span>
                </div>
                <ChevronRight size={16} className={activeSection === item.id ? "text-[#70645C]" : "text-gray-500"} />
              </button>
            ))}
          </nav>
        </CardContent>
      </Card>
    </div>
  )
}
