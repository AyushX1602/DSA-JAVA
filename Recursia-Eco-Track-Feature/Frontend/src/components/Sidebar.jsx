import React, { useState, useCallback } from "react"
import { 
  Home, 
  MapPin, 
  Calendar, 
  BarChart3, 
  Users, 
  Settings, 
  ChevronDown, 
  Truck, 
  Package, 
  Bell,
  Zap,
  UserCheck,
  ClipboardList,
  Activity,
  Shield,
  Recycle
} from "lucide-react"
import { NavLink, useLocation } from "react-router-dom"
import { motion, AnimatePresence } from "framer-motion"
import { ScrollArea } from "./ui/scroll-area"
import { Collapsible, CollapsibleTrigger, CollapsibleContent } from "./ui/collapsible"
import { cn } from "../lib/utils"

// Design tokens
const designTokens = {
  colors: {
    primary: "blue-600",
    secondary: "purple-600", 
    surface: "white/95",
    border: "gray-200",
    text: {
      primary: "gray-900",
      secondary: "gray-600",
      muted: "gray-500"
    }
  },
  spacing: {
    xs: 2,
    sm: 3,
    md: 4,
    lg: 6,
    xl: 8
  },
  transitions: {
    fast: 0.15,
    normal: 0.3,
    slow: 0.5
  }
}

// Icon component with dynamic rendering
const Icon = ({ name, className = "", size = 20 }) => {
  const icons = {
    Home, MapPin, Calendar, BarChart3, Users, Settings, ChevronDown, 
    Truck, Package, Bell, Zap, UserCheck, ClipboardList, Activity, Shield, Recycle
  }
  
  const IconComponent = icons[name]
  if (!IconComponent) return null
  
  return <IconComponent className={className} size={size} />
}

// Default menu items for EcoTrack
const defaultMenuItems = [
  {
    title: "Dashboard",
    description: "Overview and analytics",
    icon: "Home",
    url: "/dashboard",
  },
  {
    title: "Waste Management",
    description: "Pickup and tracking",
    icon: "Recycle",
    submenu: [
      { title: "Schedule Pickup", icon: Calendar, url: "/pickups/schedule" },
      { title: "Track Requests", icon: MapPin, url: "/pickups/track" },
      { title: "History", icon: ClipboardList, url: "/pickups/history" }
    ]
  },
  {
    title: "Analytics",
    description: "Reports and insights",
    icon: "BarChart3",
    url: "/analytics",
  },
  {
    title: "Drivers",
    description: "Fleet management",
    icon: "Truck",
    submenu: [
      { title: "All Drivers", icon: Users, url: "/drivers" },
      { title: "Active Routes", icon: MapPin, url: "/drivers/routes" },
      { title: "Performance", icon: Activity, url: "/drivers/performance" }
    ]
  },
  {
    title: "Users",
    description: "User management",
    icon: "Users",
    url: "/users",
  },
  {
    title: "Settings",
    description: "System configuration",
    icon: "Settings",
    submenu: [
      { title: "Profile", icon: UserCheck, url: "/settings/profile" },
      { title: "Notifications", icon: Bell, url: "/settings/notifications" },
      { title: "Security", icon: Shield, url: "/settings/security" }
    ]
  }
]

const Sidebar = ({ items = defaultMenuItems, className = "" }) => {
  const [isHovered, setIsHovered] = useState(false)
  const [openSubmenus, setOpenSubmenus] = useState(new Set())
  const location = useLocation()
  const currentPath = location.pathname

  const isActive = useCallback((path) => currentPath === path, [currentPath])
  const hasActiveSubmenu = useCallback((submenu) => 
    submenu?.some(sub => isActive(sub.url)), [isActive])

  const toggleSubmenu = useCallback((title) => {
    setOpenSubmenus(prev => {
      const newSet = new Set(prev)
      if (newSet.has(title)) {
        newSet.delete(title)
      } else {
        newSet.add(title)
      }
      return newSet
    })
  }, [])

  const sidebarVariants = {
    collapsed: { width: 64 },
    expanded: { width: 256 }
  }

  const itemVariants = {
    collapsed: { opacity: 0, x: -10 },
    expanded: { opacity: 1, x: 0 }
  }

  const menuItems = items.length > 0 ? items : defaultMenuItems

  return (
    <motion.div
      className={cn(
        "fixed left-0 top-16 h-[calc(100vh-4rem)] z-50 bg-white/98 backdrop-blur-md border-r border-gray-300 shadow-xl flex flex-col overflow-hidden",
        className
      )}
      variants={sidebarVariants}
      animate={isHovered ? "expanded" : "collapsed"}
      transition={{ duration: designTokens.transitions.normal, ease: "easeInOut" }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {isHovered ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: designTokens.transitions.fast }}
          className="flex-1 flex flex-col h-full"
        >
          {/* Header */}
          <div className="p-4 border-b border-gray-300">
            <motion.div
              variants={itemVariants}
              initial="collapsed"
              animate="expanded"
              transition={{ delay: 0.15 }}
              className="flex items-center space-x-3"
            >
              <div className="w-8 h-8 bg-gradient-to-br from-green-600 to-blue-600 rounded-lg flex items-center justify-center shadow-md">
                <Recycle className="text-white" size={16} />
              </div>
              <div>
                <h3 className="font-bold text-gray-900">EcoTrack</h3>
                <p className="text-xs text-gray-700 font-medium">Waste Management</p>
              </div>
            </motion.div>
          </div>

          {/* Navigation */}
          <ScrollArea className="flex-1 px-3 py-4">
            <nav className="space-y-1">
              {menuItems.map((item, index) => {
                const isItemActive = isActive(item.url)
                const hasActiveChild = hasActiveSubmenu(item.submenu)
                
                if (item.submenu) {
                  return (
                    <motion.div
                      key={item.title}
                      variants={itemVariants}
                      initial="collapsed"
                      animate="expanded"
                      transition={{ delay: 0.1 + index * 0.02 }}
                    >
                      <Collapsible
                        open={openSubmenus.has(item.title)}
                        onOpenChange={() => toggleSubmenu(item.title)}
                      >
                        <CollapsibleTrigger asChild>
                          <button
                            className={cn(
                              "flex items-center justify-between w-full h-11 px-3 rounded-lg transition-all duration-200 group focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-opacity-50",
                              hasActiveChild
                                ? "bg-green-100 text-green-800 shadow-sm border border-green-200"
                                : "hover:bg-gray-100 text-gray-800 hover:text-gray-900"
                            )}
                          >
                            <div className="flex items-center space-x-3">
                              <Icon name={item.icon} className="h-5 w-5 shrink-0" />
                              <div className="text-left">
                                <div className="text-sm font-semibold">{item.title}</div>
                                <div className="text-xs text-gray-600">{item.description}</div>
                              </div>
                            </div>
                            <motion.div
                              animate={{ rotate: openSubmenus.has(item.title) ? 180 : 0 }}
                              transition={{ duration: 0.2 }}
                            >
                              <ChevronDown className="h-4 w-4" />
                            </motion.div>
                          </button>
                        </CollapsibleTrigger>
                        <AnimatePresence>
                          {openSubmenus.has(item.title) && (
                            <CollapsibleContent asChild>
                              <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: "auto" }}
                                exit={{ opacity: 0, height: 0 }}
                                transition={{ duration: 0.2 }}
                                className="space-y-1 mt-1 ml-8"
                              >
                                {item.submenu.map((subItem, subIndex) => (
                                  <motion.div
                                    key={subItem.title}
                                    initial={{ opacity: 0, x: -10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: subIndex * 0.05 }}
                                  >
                                    <NavLink
                                      to={subItem.url}
                                      className={({ isActive: navIsActive }) =>
                                        cn(
                                          "flex items-center space-x-3 h-9 px-3 rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-opacity-50",
                                          navIsActive
                                            ? "bg-green-100 text-green-800 border-r-2 border-green-600 font-semibold"
                                            : "hover:bg-gray-100 text-gray-700 hover:text-gray-900"
                                        )
                                      }
                                    >
                                      <subItem.icon className="h-4 w-4 shrink-0" />
                                      <span className="text-sm font-medium">{subItem.title}</span>
                                    </NavLink>
                                  </motion.div>
                                ))}
                              </motion.div>
                            </CollapsibleContent>
                          )}
                        </AnimatePresence>
                      </Collapsible>
                    </motion.div>
                  )
                }

                return (
                  <motion.div
                    key={item.title}
                    variants={itemVariants}
                    initial="collapsed"
                    animate="expanded"
                    transition={{ delay: 0.1 + index * 0.02 }}
                  >
                    <NavLink
                      to={item.url}
                      className={({ isActive: navIsActive }) =>
                        cn(
                          "flex items-center space-x-3 h-11 px-3 rounded-lg transition-all duration-200 group focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-opacity-50",
                          navIsActive
                            ? "bg-green-100 text-green-800 shadow-sm border-r-2 border-green-600 font-semibold"
                            : "hover:bg-gray-100 text-gray-800 hover:text-gray-900"
                        )
                      }
                    >
                      <Icon name={item.icon} className="h-5 w-5 shrink-0" />
                      <div className="text-left">
                        <div className="text-sm font-semibold">{item.title}</div>
                        <div className="text-xs text-gray-600">{item.description}</div>
                      </div>
                    </NavLink>
                  </motion.div>
                )
              })}
            </nav>
          </ScrollArea>

          {/* Footer */}
          <div className="p-3 border-t border-gray-300">
            <motion.div
              variants={itemVariants}
              initial="collapsed"
              animate="expanded"
              transition={{ delay: 0.2 }}
              className="bg-gradient-to-r from-green-100 to-blue-100 rounded-lg p-3 border border-green-200"
            >
              <div className="flex items-center space-x-2 mb-2">
                <Zap size={16} className="text-green-700" />
                <span className="text-sm font-bold text-gray-900">Upgrade</span>
              </div>
              <p className="text-xs text-gray-700 mb-3 font-medium">
                Unlock premium features and advanced analytics
              </p>
              <motion.button 
                className="w-full bg-gradient-to-r from-green-600 to-blue-600 text-white text-xs py-2 rounded-md hover:shadow-lg transition-all duration-200 font-semibold focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-opacity-50"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                Upgrade Now
              </motion.button>
            </motion.div>
          </div>
        </motion.div>
      ) : (
        <div className="pt-6 px-3 flex flex-col h-full">
          <nav className="flex flex-col space-y-2 flex-1">
            {menuItems.map((item, index) => (
              <motion.div
                key={item.title}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.05 }}
                className="flex justify-center"
                title={`${item.title} - ${item.description}`}
              >
                {item.submenu ? (
                  <motion.button
                    className={cn(
                      "flex items-center justify-center w-10 h-10 rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-opacity-50",
                      hasActiveSubmenu(item.submenu)
                        ? "bg-green-100 text-green-800 shadow-sm border border-green-200"
                        : "hover:bg-gray-100 text-gray-700 hover:text-gray-900"
                    )}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => toggleSubmenu(item.title)}
                  >
                    <Icon name={item.icon} className="h-5 w-5 shrink-0" />
                  </motion.button>
                ) : (
                  <NavLink
                    to={item.url}
                    className={({ isActive: navIsActive }) =>
                      cn(
                        "flex items-center justify-center w-10 h-10 rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-opacity-50",
                        navIsActive
                          ? "bg-green-100 text-green-800 shadow-sm border border-green-200"
                          : "hover:bg-gray-100 text-gray-700 hover:text-gray-900"
                      )
                    }
                  >
                    <motion.div
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <Icon name={item.icon} className="h-5 w-5 shrink-0" />
                    </motion.div>
                  </NavLink>
                )}
              </motion.div>
            ))}
          </nav>

          {/* Collapsed Footer */}
          <div className="pb-3">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="flex justify-center"
            >
              <motion.button
                className="w-10 h-10 bg-gradient-to-r from-green-600 to-blue-600 rounded-lg flex items-center justify-center shadow-lg hover:shadow-xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-opacity-50 border border-green-200"
                title="Upgrade to Premium"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Zap size={16} className="text-white" />
              </motion.button>
            </motion.div>
          </div>
        </div>
      )}
    </motion.div>
  )
}

export default Sidebar