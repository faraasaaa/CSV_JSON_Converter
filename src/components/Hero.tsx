import React from 'react';
import { motion } from 'framer-motion';
import { FileJson, FileSpreadsheet, ArrowRightLeft } from 'lucide-react';

const Hero = () => {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="text-center py-20 px-6"
    >
      <motion.div 
        className="flex justify-center items-center gap-4 mb-8"
        initial={{ scale: 0.5 }}
        animate={{ scale: 1 }}
        transition={{ delay: 0.2 }}
      >
        <FileSpreadsheet className="w-12 h-12 text-blue-400" />
        <ArrowRightLeft className="w-8 h-8" />
        <FileJson className="w-12 h-12 text-green-400" />
      </motion.div>
      
      <motion.h1 
        className="text-4xl md:text-6xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-green-400"
        initial={{ y: 20 }}
        animate={{ y: 0 }}
        transition={{ delay: 0.3 }}
      >
        CSV ⇄ JSON Converter
      </motion.h1>
      
      <motion.p 
        className="text-xl text-gray-400 max-w-2xl mx-auto"
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.4 }}
      >
        Transform your data seamlessly between CSV and JSON formats with our modern, intuitive converter.
      </motion.p>
    </motion.div>
  );
};

export default Hero;