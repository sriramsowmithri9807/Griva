"use client";

import * as React from "react";
import { motion, HTMLMotionProps } from "framer-motion";
import { cn } from "@/lib/utils";

interface ButtonProps extends HTMLMotionProps<"button"> {
    variant?: "default" | "outline" | "ghost" | "glass";
    size?: "sm" | "default" | "lg" | "icon";
    children: React.ReactNode;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
    ({ className, variant = "default", size = "default", children, ...props }, ref) => {

        const variants = {
            default: "bg-primary text-primary-foreground hover:bg-primary/90 shadow-sm",
            outline: "border border-input bg-background/50 backdrop-blur-sm hover:bg-accent hover:text-accent-foreground",
            ghost: "hover:bg-accent hover:text-accent-foreground",
            glass: "glass-panel text-foreground hover:bg-white/10"
        };

        const sizes = {
            default: "h-10 px-4 py-2",
            sm: "h-9 rounded-md px-3",
            lg: "h-12 rounded-md px-8",
            icon: "h-10 w-10",
        };

        return (
            <motion.button
                ref={ref}
                whileHover={{ y: -2 }}
                whileTap={{ scale: 0.98 }}
                transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                className={cn(
                    "inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors duration-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50",
                    variants[variant],
                    sizes[size],
                    className
                )}
                {...props}
            >
                {children}
            </motion.button>
        );
    }
);

Button.displayName = "Button";
