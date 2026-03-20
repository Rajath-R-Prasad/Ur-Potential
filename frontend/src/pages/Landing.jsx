import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

export default function Landing() {
  return (
    <div className="min-h-[80vh] flex flex-col justify-center items-center p-4 text-center">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="max-w-2xl"
      >
        <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight mb-8">
          Unlock your <span className="bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-blue-400">Potential</span>
        </h1>
        
        <p className="text-xl md:text-2xl text-slate-400 mb-12 leading-relaxed">
          An ADHD-friendly focus companion. Stop worrying about long to-do lists and start your first 2-minute sprint.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link 
            to="/signup" 
            className="bg-purple-600 hover:bg-purple-500 text-white font-semibold px-8 py-4 rounded-xl transition-all shadow-lg hover:shadow-purple-500/20 text-lg flex-1 sm:flex-none border border-purple-500/50"
          >
            Get Started
          </Link>
          <Link 
            to="/login" 
            className="bg-slate-800/80 hover:bg-slate-700/80 text-white font-semibold px-8 py-4 rounded-xl transition-all text-lg flex-1 sm:flex-none border border-slate-700 backdrop-blur-sm"
          >
            Log In
          </Link>
        </div>
      </motion.div>
      
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.8, duration: 1 }}
        className="absolute bottom-8 text-slate-500 text-sm"
      >
        Because the hardest part is just starting.
      </motion.div>
    </div>
  );
}
