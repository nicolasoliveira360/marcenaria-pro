import React from 'react'
import {
  LayoutDashboard,
  Info,
  ListTodo,
  Layers,
  FileImage,
  CreditCard,
  FileText,
  LinkIcon,
  Settings,
} from "lucide-react"

export const sidebarItems = [
  { id: "dashboard", label: "Dashboard", icon: <LayoutDashboard size={18} className="text-[#475569]" /> },
  { id: "info", label: "Informações", icon: <Info size={18} className="text-[#475569]" /> },
  { id: "tasks", label: "Tarefas", icon: <ListTodo size={18} className="text-[#475569]" /> },
  { id: "status", label: "Status", icon: <Layers size={18} className="text-[#475569]" /> },
  { id: "gallery", label: "Galeria", icon: <FileImage size={18} className="text-[#475569]" /> },
  { id: "payments", label: "Pagamentos", icon: <CreditCard size={18} className="text-[#475569]" /> },
  { id: "description", label: "Descrição", icon: <FileText size={18} className="text-[#475569]" /> },
  { id: "access", label: "Acesso", icon: <LinkIcon size={18} className="text-[#475569]" /> },
  { id: "settings", label: "Configurações", icon: <Settings size={18} className="text-[#475569]" /> },
]
