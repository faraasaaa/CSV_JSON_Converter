import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FileJson, FileSpreadsheet, ArrowRightLeft, Download, Upload, Copy, Check, AlertCircle } from 'lucide-react';

interface ConversionError {
  message: string;
  details?: string;
}

const Converter = () => {
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [error, setError] = useState<ConversionError | null>(null);
  const [mode, setMode] = useState<'csv2json' | 'json2csv'>('csv2json');
  const [copied, setCopied] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const parseCSV = (csv: string) => {
    const lines = csv.trim().split(/\r\n|\n/);
    if (lines.length < 2) {
      throw new Error('CSV must contain at least a header row and one data row');
    }

    const headers = lines[0].split(',').map(h => h.trim());
    if (headers.some(h => !h)) {
      throw new Error('CSV headers cannot be empty');
    }

    return lines.slice(1).map((line, index) => {
      const values = line.split(',').map(v => v.trim());
      if (values.length !== headers.length) {
        throw new Error(`Row ${index + 2} has ${values.length} values but should have ${headers.length} (matching headers)`);
      }
      return headers.reduce((obj, header, i) => {
        obj[header] = values[i] || '';
        return obj;
      }, {} as Record<string, string>);
    });
  };

  const parseJSON = (json: string) => {
    const data = JSON.parse(json);
    if (!Array.isArray(data)) {
      throw new Error('Input must be an array of objects');
    }
    if (data.length === 0) {
      throw new Error('JSON array cannot be empty');
    }
    if (!data.every(item => typeof item === 'object' && item !== null)) {
      throw new Error('All items in the array must be objects');
    }
    return data;
  };

  const convertData = () => {
    setError(null);
    if (!input.trim()) {
      setError({ message: 'Please enter some data to convert' });
      return;
    }

    try {
      if (mode === 'csv2json') {
        const result = parseCSV(input);
        setOutput(JSON.stringify(result, null, 2));
      } else {
        const jsonData = parseJSON(input);
        const headers = Array.from(new Set(jsonData.flatMap(obj => Object.keys(obj))));
        const csv = [
          headers.join(','),
          ...jsonData.map(obj => 
            headers.map(header => {
              const value = obj[header];
              // Handle special characters and commas in values
              if (value === null || value === undefined) return '';
              const stringValue = String(value);
              return stringValue.includes(',') || stringValue.includes('"') || stringValue.includes('\n')
                ? `"${stringValue.replace(/"/g, '""')}"`
                : stringValue;
            }).join(',')
          )
        ].join('\n');
        setOutput(csv);
      }
    } catch (err) {
      const error = err as Error;
      setError({
        message: 'Conversion failed',
        details: error.message
      });
      setOutput('');
    }
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target?.result as string;
      setInput(content);
      setError(null);
      if (file.name.endsWith('.csv')) {
        setMode('csv2json');
      } else if (file.name.endsWith('.json')) {
        setMode('json2csv');
      }
    };
    reader.onerror = () => {
      setError({ message: 'Failed to read file' });
    };
    reader.readAsText(file);
  };

  const downloadOutput = () => {
    const blob = new Blob([output], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `converted.${mode === 'csv2json' ? 'json' : 'csv'}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const copyToClipboard = async () => {
    await navigator.clipboard.writeText(output);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-full max-w-6xl mx-auto p-6 space-y-6"
    >
      <div className="flex flex-col md:flex-row gap-6 h-[70vh]">
        <motion.div 
          className="flex-1 flex flex-col"
          initial={{ x: -20 }}
          animate={{ x: 0 }}
        >
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              {mode === 'csv2json' ? <FileSpreadsheet className="text-blue-400" /> : <FileJson className="text-green-400" />}
              <h2 className="text-xl font-semibold">Input</h2>
            </div>
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => fileInputRef.current?.click()}
              className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-gray-700 hover:bg-gray-600 text-sm transition-colors"
            >
              <Upload className="w-4 h-4" />
              Upload
            </motion.button>
          </div>
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileUpload}
            accept={mode === 'csv2json' ? '.csv' : '.json'}
            className="hidden"
          />
          <textarea
            value={input}
            onChange={(e) => {
              setInput(e.target.value);
              setError(null);
            }}
            className="flex-1 w-full p-4 bg-gray-800 rounded-lg border border-gray-700 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all duration-200 font-mono text-sm resize-none whitespace-pre-wrap break-all"
            placeholder={mode === 'csv2json' ? 'Paste your CSV here or upload a file...' : 'Paste your JSON here or upload a file...'}
            spellCheck={false}
          />
        </motion.div>

        <div className="flex md:flex-col justify-center items-center gap-4">
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => {
              setMode(mode === 'csv2json' ? 'json2csv' : 'csv2json');
              setError(null);
              setOutput('');
            }}
            className="p-2 rounded-full bg-gray-700 hover:bg-gray-600 transition-colors"
          >
            <ArrowRightLeft className="w-6 h-6" />
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            onClick={convertData}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-500 rounded-full font-medium transition-colors"
          >
            Convert
          </motion.button>
        </div>

        <motion.div 
          className="flex-1 flex flex-col"
          initial={{ x: 20 }}
          animate={{ x: 0 }}
        >
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              {mode === 'csv2json' ? <FileJson className="text-green-400" /> : <FileSpreadsheet className="text-blue-400" />}
              <h2 className="text-xl font-semibold">Output</h2>
            </div>
            {output && (
              <div className="flex items-center gap-2">
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={copyToClipboard}
                  className="p-2 rounded-full hover:bg-gray-700 transition-colors"
                >
                  <AnimatePresence>
                    {copied ? (
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        exit={{ scale: 0 }}
                      >
                        <Check className="w-5 h-5 text-green-400" />
                      </motion.div>
                    ) : (
                      <Copy className="w-5 h-5" />
                    )}
                  </AnimatePresence>
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={downloadOutput}
                  className="p-2 rounded-full hover:bg-gray-700 transition-colors"
                >
                  <Download className="w-5 h-5" />
                </motion.button>
              </div>
            )}
          </div>
          <div className="flex-1 w-full p-4 bg-gray-800 rounded-lg border border-gray-700 font-mono text-sm overflow-auto relative">
            {error ? (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-start gap-3 text-red-400 bg-red-400/10 p-4 rounded-lg"
              >
                <AlertCircle className="w-5 h-5 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="font-semibold">{error.message}</p>
                  {error.details && (
                    <p className="text-red-400/80 text-sm mt-1">{error.details}</p>
                  )}
                </div>
              </motion.div>
            ) : (
              <pre className="whitespace-pre-wrap break-all">{output || 'Converted data will appear here...'}</pre>
            )}
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default Converter;