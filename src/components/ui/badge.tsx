"use client";

import * as React from "react";
import { motion, HTMLMotionProps } from "framer-motion";
import { cn } from "@/lib/utils";

interface BadgeProps extends HTMLMotionProps<"div"> {
    variant?: "default" | "secondary" | "outline" | "destructive" | "glass";
}

export const Badge = React.forwardRef<HTMLDivElement, BadgeProps>(
    ({ className, variant = "default", ...props }, ref) => {

        const variants = {
            default: "border-transparent bg-primary text-primary-foreground shadow-sm",
            secondary: "border-transparent bg-secondary text-secondary-foreground",
            destructive: "border-transparent bg-destructive/20 text-destructive border border-destructive/30",
            outline: "text-foreground border-border",
            glass: "glass-panel px-3 border border-white/10 text-muted-foreground",
        };

        return (
            <motion.div
                ref={ref}
                whileHover={{ y: -1 }}
                transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                className={cn(
                    "inline-flex items-center rounded-md border px-2.5 py-0.5 text-xs font-semibold transition-all duration-500 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
                    variants[variant],
                    className
                )}
                {...props}
            />
        );
    }
);
Badge.displayName = "Badge";
