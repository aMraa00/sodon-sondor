import { motion } from 'framer-motion';

export default function Empty({ icon = '🦷', title = 'Өгөгдөл байхгүй', description, action }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col items-center justify-center py-16 px-4 text-center"
    >
      <div className="w-20 h-20 brand-gradient rounded-3xl flex items-center justify-center shadow-brand mb-6 text-4xl">
        {icon}
      </div>
      <h3 className="text-lg font-semibold text-foreground mb-2">{title}</h3>
      {description && <p className="text-sm text-muted-foreground max-w-xs">{description}</p>}
      {action && <div className="mt-6">{action}</div>}
    </motion.div>
  );
}
