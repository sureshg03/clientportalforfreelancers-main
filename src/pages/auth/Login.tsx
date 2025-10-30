import { useState, FormEvent } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../contexts/AuthContext';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Card, CardBody } from '../../components/ui/Card';
import { LogIn, Mail, ArrowRight, Eye, EyeOff, AlertCircle, Sparkles } from 'lucide-react';
// Note: If bg.jpeg is a local asset, ensure it's in the public folder (e.g., public/bg.jpeg) and reference as below.
// If it's in src, import it: import bgImage from './bg.jpeg'; then use `url(${bgImage})` in the style.

export function Login() {
  const { signIn } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError('Please enter a valid email address');
      setLoading(false);
      return;
    }
    const { error: authError } = await signIn(email, password);
    if (authError) {
      setError(authError.message);
    }
    setLoading(false);
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1] } },
  };

  const inputVariants = {
    focus: { scale: 1.02, transition: { duration: 0.2 } },
  };

  return (
    <div 
      className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden"
      style={{
        backgroundImage: `url('/bg.jpeg')`, // Fixed: Use root-relative path for public assets (not 'src/public'). Adjust if imported.
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
        backgroundAttachment: 'fixed',
      }}
    >
      {/* Light black overlay layer (added for subtle darkening over the image) */}
      <div className="absolute inset-0 bg-black/30" />
      
      {/* Optional: Existing subtle gradient overlay for better readability */}
      <div className="absolute inset-0 bg-gradient-to-br from-purple-900/20 via-transparent to-blue-900/20" />
      
      <motion.div
        variants={cardVariants}
        initial="hidden"
        animate="visible"
        className="w-full max-w-lg relative z-10"
      >
        <Card className="bg-white/95 backdrop-blur-sm border border-purple-100/50 shadow-2xl rounded-3xl overflow-hidden [box-shadow:0_25px_50px_-12px_rgba(139,92,246,0.25)] relative before:absolute before:inset-0 before:rounded-3xl before:bg-gradient-to-t before:from-purple-500/5 before:to-transparent">
          <CardBody className="space-y-8 py-10 relative z-10">
            <motion.div
              className="text-center"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, type: 'spring' }}
            >
              <motion.div
                className="inline-flex items-center justify-center w-20 h-20 bg-purple-500 rounded-2xl mb-6 shadow-lg [box-shadow:0_10px_20px_rgba(139,92,246,0.3)]"
                whileHover={{ rotate: -5, scale: 1.05 }}
                transition={{ duration: 0.3, type: 'spring' }}
              >
                <LogIn className="w-9 h-9 text-white" />
              </motion.div>
              <motion.h1
                className="text-4xl font-bold text-purple-700 mb-2 [text-shadow:0_2px_4px_rgba(0,0,0,0.1)]"
                initial={{ y: -15 }}
                animate={{ y: 0 }}
                transition={{ delay: 0.1, duration: 0.4 }}
              >
                Welcome Back
              </motion.h1>
              <motion.p
                className="text-gray-600 text-lg"
                initial={{ y: -10 }}
                animate={{ y: 0 }}
                transition={{ delay: 0.2, duration: 0.4 }}
              >
                Access your account securely and continue where you left off
              </motion.p>
            </motion.div>
            <motion.form onSubmit={handleSubmit} className="space-y-6" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }}>
              <AnimatePresence>
                {error && (
                  <motion.div
                    initial={{ opacity: 0, y: -10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -10, scale: 0.95 }}
                    className="bg-red-50 border border-red-200 text-red-700 px-5 py-4 rounded-2xl text-sm shadow-md flex items-center space-x-2"
                  >
                    <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
                    <span>{error}</span>
                  </motion.div>
                )}
              </AnimatePresence>
              <motion.div
                variants={inputVariants}
                whileFocus="focus"
              >
                <Input
                  label="Email Address"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email address"
                  icon={<Mail className="w-4 h-4 text-purple-400" />}
                  required
                  className="focus:ring-2 focus:ring-purple-500/50 border-purple-300 focus:border-purple-500 transition-all duration-200 shadow-sm hover:shadow-md"
                />
              </motion.div>
              <motion.div
                variants={inputVariants}
                whileFocus="focus"
              >
                <Input
                  label="Password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your secure password"
                  icon={
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="p-1 hover:bg-purple-100 rounded transition-colors"
                    >
                      {showPassword ? (
                        <EyeOff className="w-4 h-4 text-purple-400" />
                      ) : (
                        <Eye className="w-4 h-4 text-purple-400" />
                      )}
                    </button>
                  }
                  required
                  className="focus:ring-2 focus:ring-purple-500/50 border-purple-300 focus:border-purple-500 transition-all duration-200 pr-10 shadow-sm hover:shadow-md"
                />
              </motion.div>
              <motion.div
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="space-y-3"
              >
                <Button
                  type="submit"
                  fullWidth
                  disabled={loading}
                  size="lg"
                  className="bg-purple-600 hover:bg-purple-700 text-white font-semibold shadow-lg hover:shadow-xl transition-all duration-300 h-12 rounded-2xl text-lg border-purple-600 flex items-center justify-center space-x-2 px-6 [box-shadow:0_4px_6px_-1px_rgba(0,0,0,0.1)]"
                >
                  {loading ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>Signing In...</span>
                    </>
                  ) : (
                    <>
                      <ArrowRight className="w-5 h-5" />
                      <span>Sign In Securely</span>
                    </>
                  )}
                </Button>
              </motion.div>
            </motion.form>
            <motion.div
              className="text-center text-sm text-gray-600 pt-4 border-t border-purple-100"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
            >
              New to our platform?{' '}
              <a
                href="/signup"
                className="text-purple-600 hover:text-purple-700 font-semibold transition-colors duration-200"
              >
                Create an account
              </a>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.6, type: 'spring' }}
              className="absolute -top-4 left-4 w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center"
            >
              <Sparkles className="w-4 h-4 text-purple-500" />
            </motion.div>
          </CardBody>
        </Card>
      </motion.div>
    </div>
  );
}