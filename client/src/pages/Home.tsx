import { useGreeting } from "@/hooks/use-greeting";
import { motion } from "framer-motion";
import { Activity } from "lucide-react";

export default function Home() {
  const { data, isLoading, isError } = useGreeting();

  // Clean, minimal loading state
  if (isLoading) {
    return (
      <div className="min-h-[100dvh] w-full flex items-center justify-center bg-background bg-grain selection:bg-primary selection:text-primary-foreground">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, ease: "easeInOut", repeat: Infinity, repeatType: "reverse" }}
        >
          <Activity className="w-8 h-8 text-muted-foreground/30" strokeWidth={1.5} />
        </motion.div>
      </div>
    );
  }

  // Clean, minimal error state
  if (isError) {
    return (
      <div className="min-h-[100dvh] w-full flex items-center justify-center bg-background bg-grain selection:bg-primary selection:text-primary-foreground">
        <div className="text-center space-y-3">
          <p className="text-sm font-medium text-muted-foreground tracking-wider uppercase">
            Connection Error
          </p>
          <p className="text-foreground/80">
            Unable to establish contact with the server.
          </p>
        </div>
      </div>
    );
  }

  return (
    <main className="min-h-[100dvh] w-full flex flex-col items-center justify-center bg-background bg-grain p-6 md:p-12 overflow-hidden selection:bg-primary selection:text-primary-foreground">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        className="flex flex-col items-center justify-center text-center max-w-3xl mx-auto space-y-8"
      >
        {/* Subtle App Name Badge */}
        {data?.appName && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            className="inline-flex items-center justify-center px-4 py-1.5 rounded-full border border-border/50 bg-muted/30 backdrop-blur-sm shadow-sm"
          >
            <span className="text-[11px] font-semibold tracking-[0.2em] uppercase text-foreground/70">
              {data.appName}
            </span>
          </motion.div>
        )}

        {/* Primary Greeting Message */}
        {data?.message && (
          <h1 
            className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-medium tracking-tight text-foreground"
            style={{ fontFamily: 'var(--font-display)' }}
          >
            {data.message}
          </h1>
        )}
      </motion.div>
      
      {/* Decorative subtle ambient element */}
      <div className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-foreground/[0.02] rounded-full blur-[100px] -z-10" />
    </main>
  );
}
